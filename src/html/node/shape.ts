/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {
    IElementConfig,
    IHTMLChildrenRenderer,
    IHtmlConfig,
    IHtmlNodeComponent,
    IHtmlNodeShape,
    IHtmlShape,
    IHtmlShapeTypes
} from "./index";
import {ICancellable, nullCancellable, procedure, unobserved} from "@reactivelib/reactive";
import * as robj from './object';
import {IManualDiffer, ObjectDiffReturn} from './object';
import renderHTML from '../index';
import {HtmlRenderContext, IHtmlRenderContext} from "./context";
import {ChildManager} from "./child";

export function afterAdd(parent: IHtmlNodeShape, child: IHtmlNodeShape, indx: number){
    var n = parent.element.childNodes[indx];
    if (n){
        parent.element.insertBefore(child.element, n);
    }
    else{
        parent.element.appendChild(child.element);
    }
}

export function afterRemove(parent: IHtmlNodeShape, indx: number){
    parent.element.removeChild(parent.element.childNodes[indx]);
}

class ObjectDiff implements robj.IObjectDiffListener{
    
    constructor(public object: any, public rend: HTMLChildrenRenderer){
        
    }

    add(p: string, val: any){
        this.object[p] = val;
    }
    
    remove(p: string, val: any){
        this.object[p] = "";
    }
    
    replace(p: string, val: any, old: any){
        this.object[p] = val;
    }
    
}

class AttributeDiffer{

    constructor(public element: HTMLElement, public rend: HTMLChildrenRenderer){

    }
    
    add(p: string, val: any){
        this.element.setAttribute(p, val);
    }
    
    remove(p: string, val: any){
        this.element.removeAttribute(p);
    }
    
    replace(p: string, val: any, old: any){
        this.element.setAttribute(p, val);
    }

}

export interface ICustomHtmlShapeSettings extends IHtmlConfig{

}

export interface ICustomHtmlConfig extends IElementConfig{

    render(ctx: IHtmlRenderContext);

}

export class CustomHTMLShape implements IHtmlNodeShape{

    public parent: IHtmlNodeShape;
    public element: Node;
    public __shape_node: boolean;
    public first: boolean = true;

    constructor(public settings: ICustomHtmlConfig){

    }

    get parentModel(){
        return this.parent && this.parent.settings;
    }

    render(ctx: IHtmlRenderContext){
        if (this.first){
            if (this.settings.onAttached){
                this.settings.onAttached();
            }
        }
        this.first = false;
        this.settings.render(ctx);
    }

    onDetached(){
        if (!this.first){
            this.first = true;
            this.settings.onDetached && this.settings.onDetached();
        }
    }

}

CustomHTMLShape.prototype.__shape_node = true;

export class ManualUpdater{

    public last: any;
    public proc: procedure.IManualProcedureExecution;

    constructor(public updater: (value: any) => ObjectDiffReturn, public getSettings: () => any){
        var lastAttr: ObjectDiffReturn;
        var lastSet: any = this;
        this.proc = procedure.manual(() => {
            var attr = this.getSettings();
            if (lastSet !== attr){
                lastAttr && lastAttr.cancel();
                lastSet = attr;
                lastAttr = null;
                unobserved(() => {
                    if (attr){
                        lastAttr = this.updater(attr);
                    }
                });
            }
            lastAttr && lastAttr.p.update();
        });
    }

    public update(){
        this.proc.update();
    }

    public cancel(){
        this.proc.cancel();
    }
}

export class HTMLChildrenRenderer implements IHTMLChildrenRenderer, IHtmlShape{

    public parent: IHtmlNodeComponent;
    public element: Node;
    public cancellable: ICancellable;
    public __shape_node: boolean;
    public ctx: HtmlRenderContext;
    public parentCtx: IHtmlRenderContext;
    public propertyProc: procedure.IManualProcedureExecution;
    public renderUpdater: procedure.IManualProcedureExecution;
    public childManager: ChildManager;

    public first = true;
    get children(){
        return this.childManager.children;
    }

    public updateProcedure: procedure.IManualProcedureExecution;

    public onAttached(){
        if (!this.settings.renderDirect){
            this.renderUpdater = procedure.manual(() => {
                this.renderProc();
            });
        }
        this.cancellable = this.observeSettings();
        this.ctx = new HtmlRenderContext(this.element);
    }

    public onDetached(){
        if (!this.first){
            var config = this.settings;
            config.onDetached && config.onDetached();
            this.cancellable.cancel();
            var children = this.children;
            children && children.forEach(c => {
                c.onDetached && c.onDetached();
            });
            this.first = true;
        }
    }

    public render(ctx: IHtmlRenderContext){
        ctx.push(this.element);
        if (this.first){
            this.onAttached();
            var config = this.settings;
            config.onAttached && config.onAttached();
            this.first = false;
        }
        this.parentCtx = ctx;
        if (this.settings.renderDirect){
            this.settings.renderDirect(ctx);
        }
        else {
            this.renderUpdater.update();
        }
    }

    public renderProc(){
        var ctx = this.parentCtx;
        if (this.settings.render){
            this.settings.render(ctx);
        }
        else
        {
            this.renderAll();
        }
    }

    public renderAll(){
        this.renderThis();
    }

    public renderThis(){
        this.applyChanges();
        this.renderChildren();
        this.propertyProc.update();

    }

    public renderChildren(){
        this.childManager.update();
        this.children.forEach(c => {
            c.render(this.ctx);
        });
        this.ctx.stop();
    }

    public applyChanges(){
        this.updateProcedure.update();
    }

    public renderChild(config: IHtmlShapeTypes){
        return renderHTML(config);
    }

    public attributes: ManualUpdater;
    public properties: ManualUpdater;
    public styles: ManualUpdater;
    public events: IManualDiffer;

    public renderAttributes(){
        this.attributes.update();
    }

    public renderProperties(){
        this.properties.update();
    }

    public renderStyles(){
        this.styles.update();
    }

    public renderEvents(){
        this.events.update(this.settings.event);
    }


    public observeSettings(){
        var settings = this.settings;
        var oattr = new ManualUpdater(val => robj.reactiveObjectDiff(val, new AttributeDiffer(<HTMLElement>this.element, this)), () => settings.attr);
        var oprop = new ManualUpdater(val => robj.reactiveObjectDiff(val, new ObjectDiff(this.element, this)), () => settings.prop);
        var ostyle = new ManualUpdater(val => robj.reactiveObjectDiff(val, new ObjectDiff((<HTMLElement>this.element).style, this)), () => settings.style);
        this.attributes = oattr;
        this.properties = oprop;
        this.styles = ostyle;

        var oevent = robj.managedDiffer((val: any) => {
            if (val){
                var el = this;
                var added: any[] = [];
                for (var p in val){
                    var evs = val[p];
                    if (!evs){
                        continue;
                    }
                    if (typeof evs === "function"){
                        added.push({
                            event: p, handler: evs, useCapture: false
                        });
                        el.element.addEventListener(p, evs);
                    }
                    else {
                        if (Array.isArray(evs)){
                            evs.forEach(f => {
                                if (typeof f === "function"){
                                    added.push({
                                        event: p, handler: f, useCapture: false
                                    });
                                    el.element.addEventListener(p, f);
                                }
                                else
                                {
                                    added.push({
                                        event: p, handler: f.handler, useCapture: f.useCapture
                                    });
                                    el.element.addEventListener(p, f.handler, f.useCapture);
                                }
                            });
                        }
                        else {
                            var f = evs;
                            if (typeof f === "function"){
                                added.push({
                                    event: p, handler: f, useCapture: false
                                });
                                el.element.addEventListener(p, f);
                            }
                            else
                            {
                                added.push({
                                    event: p, handler: f.handler, useCapture: f.useCapture
                                });
                                el.element.addEventListener(p, f.handler, f.useCapture);
                            }
                        }

                    }
                }
                return {cancel: () => {
                    added.forEach(a => {
                        el.element.removeEventListener(a.event, a.handler, a.useCapture);
                    })
                }};
            }
            return nullCancellable;
        });
        this.events = oevent;
        var self = this;
        this.childManager = new ChildManager({
            get child(){
                return self.settings.child;
            },
            parent: this
        });
        this.childManager.renderChild = this.renderChild;
        this.propertyProc = procedure.manual(() => {
            oprop.update();
        });
        var p = procedure.manual(() => {
            oattr.update();
            ostyle.update();
            oevent.update(settings.event);
        });
        this.updateProcedure = p;
        return {cancel: () => {
            p.cancel();
            this.childManager.cancel();
            oattr.cancel();
            oprop.cancel();
            this.propertyProc.cancel();
            ostyle.cancel();
            oevent.cancel();
        }};
    }


    constructor(public settings: IHtmlConfig){
        this.element = this.createElement();
    }

    get parentModel(){
        return this.parent && this.parent.settings;
    }

    public createElement(): Node{
        var el = document.createElement(this.settings.tag);
        return el;
    }

}

HTMLChildrenRenderer.prototype.__shape_node = true;