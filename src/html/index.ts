/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {createHTMLElementShape, IHtmlConfig, IHtmlNodeShape, IHtmlShapeTypes} from "../html/node";
import {isNode} from "../util";
import {createTextShape} from "./node/text";
import renderSVG from "./svg";
import {procedure} from "@reactivelib/reactive";
import {HtmlRootContext} from "./node/context";
import {CustomHTMLShape, ICustomHtmlConfig} from "./node/shape";
import {IElementConfig, IHtmlNodeComponent} from "./node";

const tagToRenderer: {[s: string]: (config: IElementConfig) => IHtmlNodeComponent} = {

}

export function registerRenderer(tag: string, render: (config: IElementConfig) => IHtmlNodeComponent){
    tagToRenderer[tag] = render;
}

export function renderHTML(config: IHtmlShapeTypes): IHtmlNodeComponent{
    if (isNode(config)){
        return <IHtmlNodeShape>config;
    }
    if (typeof config !== "object")
    {
        return createTextShape(<string>config);
    }
    else{
        var conf = tagToRenderer[(<IHtmlConfig>config).tag];
        if (conf){
            return conf(<IHtmlConfig>config);
        }
        switch((<IHtmlConfig>config).tag){
            case "svg":
                return <any>renderSVG(<any> config);
            case "custom":
                var shape = new CustomHTMLShape(<any>config);
                (<ICustomHtmlConfig>config).node = shape;
                return shape;
            default:
                var gr = createHTMLElementShape((<IHtmlConfig>config));
                return gr;
        }
    }
}

var animId = null;

export function animationId(){
    return animId;
}

/**
 * Attaches the given virtual dom element or virtual dom element node to the given element
 * @param {Node} element The element ot attach to
 * @param {IHtmlShapeTypes} config The virtual dom being attached
 * @returns {IHtmlNodeComponent} The virtual dom element node attached
 */
export function attach(element: Node, config: IHtmlShapeTypes): IHtmlNodeComponent{
    if (typeof config !== "string" && !isNode(config) && (<IHtmlConfig | IElementConfig>config).node){
        if ((<any>(<IHtmlConfig | IElementConfig>config).node).__attached){
            return (<IHtmlConfig | IElementConfig>config).node;
        }
    }
    if (isNode(config)){
        if ((<any>(config)).__attached){
            return <IHtmlNodeComponent>config;
        }
    }
    var node = <IHtmlNodeShape>renderHTML(config);
    var ctx = new HtmlRootContext(element);
    (<any>ctx)._isRoot = true;
    var anim = 0;
    (<any>node).__attached = {
        proc: procedure.animationFrame(p => {
            node.render(ctx);
            ctx.stop();
        }),
        ctx: ctx
    }
    return node;
}

/**
 * Removes the given virtual dom element or virtual dom element node from the DOM.
 * @param {IHtmlNodeComponent | IElementConfig} node
 */
export function detach(node: IHtmlNodeComponent | IElementConfig){
    if (!isNode(node)){
        if (isNode((<IElementConfig>node).node)){
            node = (<IElementConfig>node).node;
        }
    }
    if (!(<any>node).__attached){
        return;
    }
    (<any>node).__attached.proc.cancel();
    node.onDetached();
    (<any>node).__attached.ctx.destroy();
    delete (<any>node).__attached;
}

export default renderHTML;