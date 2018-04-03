/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {IBaseShape} from "../../render";
import {IHTMLChildrenRenderer, IHtmlConfig, IHtmlNodeComponent} from "../node";
import {HTMLChildrenRenderer} from '../node/shape';
import {isNode} from "../../util";
import {createTextShape} from "../node/text";
import {IHtmlShape} from "../node/index";

export var svgns = "http://www.w3.org/2000/svg";

export function renderSVG(config: ISVGConfig | string | IBaseShape): IHtmlNodeComponent{
    if (isNode(config)){
        return <IHtmlNodeComponent>config;
    }
    if (typeof config !== "object")
    {
        return createTextShape(<string>config);
    }
    var r =  createSVGShape(<ISVGConfig>config);
    return r;
}


export default renderSVG;

/**
 * A virtual dom element representing a svg element.
 */
export interface ISVGConfig extends IHtmlConfig{

}

/**
 * A virtual dom element node representing a svg element
 */
export interface ISvgShape extends IHtmlShape{
    element: SVGSVGElement;
}

interface ISVGChildrenRenderer extends IHTMLChildrenRenderer{

    element:SVGSVGElement;

}

export class SVGRenderer extends HTMLChildrenRenderer implements ISVGChildrenRenderer{

    public element:SVGSVGElement;
    public children: SVGRenderer[];

    constructor(config: IHtmlConfig) {
        super(config);
    }
    
    public renderChild(config: ISVGConfig){
        return <SVGRenderer>renderSVG(<any>config);
    }

    createElement(){
        var t = this.settings.tag;
        return createSvgElement(t);
    }

}

export function createSvgElement(tag: string){
    var element = <SVGSVGElement> document.createElementNS(svgns, tag in svgGroupNodeNames ? "g" : tag);
    return element;
}

var svgGroupNodeNames = {
    g: "g",
    group: "g",
    div: "g",
    span: "g"
}

export function createSVGShape(config: ISVGConfig): ISvgShape{
    var r = new SVGRenderer(config);
    config.node = r;
    return r;
}