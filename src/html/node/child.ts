/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */


import {IHtmlConfig, IHtmlNodeComponent, IHtmlNodeShape, IHtmlShapeTypes} from "./index";
import {array, ICancellableIterator, procedure} from "@reactivelib/reactive";
import {hash} from "@reactivelib/core";
import renderHTML from "../index";

export class ChildManager{

    public children: IHtmlNodeComponent[];
    public proc: procedure.IManualProcedureExecution;

    public cancel(){
        this.proc.cancel();
    }

    public update(){
        this.proc.update();
    }

    constructor(public settings: IChildRendererSettings){
        var lastAdded = hash.map<IHtmlConfig, IHtmlNodeComponent>();
        var lastVal: any;
        var updates: ICancellableIterator<array.ArrayUpdate<IHtmlConfig>>;
        var childProc = procedure.manual(() => {
            var val = <any>this.settings.child;
            if (val){
                if (!(Array.isArray(val) && Array.isArray(lastVal)) && val !== lastVal){
                    this.children && this.children.forEach(c => {
                        c.onDetached();
                    });
                    this.children = [];
                }
                if (array.isReactiveArray(val)){
                    var ra: array.IReactiveArray<IHtmlConfig> = val;
                    if (!updates){
                        updates = ra.updates();
                        ra.values.forEach(v => {
                            var s = this.renderChild(v);
                            s.parent = this.settings.parent;
                            this.children.push(s);
                        });
                    }
                    else
                    {
                        while(updates.hasNext()){
                            var upd = updates.next();
                            switch(upd.type){
                                case "ADD":
                                    var s = this.renderChild(upd.value);
                                    s.parent = this.settings.parent;
                                    this.children.splice(upd.index, 0, s);
                                    break;
                                case "REMOVE":
                                    this.children[upd.index].onDetached();
                                    this.children.splice(upd.index, 1);
                                    break;
                                case "REPLACE":
                                    this.children[upd.index].onDetached();
                                    var s = this.renderChild(upd.value);
                                    s.parent = this.settings.parent;
                                    this.children[upd.index] = s;
                                    break;
                            }
                        }
                    }
                }
                else if (Array.isArray(val)){
                    var toAdd: IHtmlNodeComponent[] = [];
                    var newlyAdded = hash.map<IHtmlConfig, IHtmlNodeComponent>();
                    var rendered = hash.map<IHtmlNodeComponent, IHtmlNodeComponent>();
                    for (var i=0; i < val.length; i++) {
                        var v = val[i];
                        var ns = lastAdded.get(v);
                        if (!ns) {
                            ns = this.renderChild(v);
                            ns.parent = this.settings.parent;
                            rendered.put(ns, ns);
                        }
                        else {
                            lastAdded.remove(v);
                        }
                        toAdd.push(ns);
                        newlyAdded.put(v, ns);
                    }
                    for (var k in lastAdded.objects){
                        var kv = lastAdded.objects[k];
                        kv.value.onDetached();
                    }
                    this.children = [];
                    for (var i=0; i < toAdd.length; i++){
                        var ta = toAdd[i];
                        this.children.push(ta);
                        var added = false;
                        if (rendered.get(ta)){
                            added = true;
                        }
                    }
                    lastAdded = newlyAdded;
                }
                else if (val){
                    if (val !== lastVal){
                        var child = <IHtmlNodeShape>this.renderChild(val);
                        child.parent = this.settings.parent;
                        this.children.push(child);
                    }
                }
            }
            else {
                this.children = [];
                lastAdded = hash.map<IHtmlConfig, IHtmlNodeShape>();
            }
            lastVal = val;
        });
        this.proc = childProc;
    }

    public renderChild(config: IHtmlShapeTypes){
        return renderHTML(config);
    }

}

export interface IChildRendererSettings{
    child: IHtmlConfig["child"];
    parent: IHtmlNodeComponent;
}

/**
 *
 */
export interface IChildRenderer{
    update();
    cancel();
    children: IHtmlNodeComponent[];
}

/**
 *
 * @param {IChildRendererSettings} settings
 * @returns {IChildRenderer}
 */
export default function(settings: IChildRendererSettings): IChildRenderer{
    return new ChildManager(settings);
}