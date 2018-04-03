/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import * as htmlModule from './src/html';
import * as svgMod from './src/html/svg';
import * as nodeMod from "./src/html/node";
import * as util from "./src/util";
import {cachingMapper} from './src/children/map';
import * as childMod from "./src/html/node/child";
import * as contextMod from "./src/html/node/context";
import * as baseMod from './src/render';
import * as styleMod from './src/html/style';


/**
 * Attaches the given virtual dom object to the DOM
 * @param {Node} element the DOM element
 * @param {IHtmlShapeTypes} config The virtual DOM object
 * @returns {IHtmlNodeComponent} The virtual DOM object node
 */
function attach(element: Node, config: nodeMod.IHtmlShapeTypes): nodeMod.IHtmlNodeComponent{
    return htmlModule.attach(element, config);
}

namespace attach{

    export type IBaseShape = baseMod.IBaseShape;
    export type IShapeConfig = baseMod.IShapeConfig;

    /**
     * Create the node for a virtual DOM object
     * @param {IHtmlShapeTypes} config The virtual dom object
     * @returns {IHtmlNodeComponent} the virtual dom object node
     */
    export function html(config: nodeMod.IHtmlShapeTypes): nodeMod.IHtmlNodeComponent{
        return htmlModule.default(config);
    }

    export namespace html{
        export type IHtmlShape = nodeMod.IHtmlShape;
        export type IHtmlShapeTypes = nodeMod.IHtmlShapeTypes;
        export type IHtmlNodeComponent = nodeMod.IHtmlNodeComponent;
        export type IElementConfig = nodeMod.IElementConfig;
        export type IHtmlConfig = nodeMod.IHtmlConfig;
        export type IHtmlRenderContext = contextMod.IHtmlRenderContext;
        export type IIndexedHtmlRenderContext = contextMod.IIndexedHtmlRenderContext;
        export type ICSSStyle = styleMod.ICSSStyle;
        export const childRenderer = childMod.default;
        export type IChildRenderer = childMod.IChildRenderer;
        export type IChildRendererSettings = childMod.IChildRendererSettings;
        export type IHtmlElementShape = nodeMod.IHtmlElementShape;
        export type IHtmlNodeShape = nodeMod.IHtmlNodeShape;
        export type IHtmlAttributesAndProperties = nodeMod.IHtmlAttributesAndProperties;

        /**
         * Creates a new rendering context for the given node
         * @param {Node} element
         * @returns {IIndexedHtmlRenderContext}
         */
        export function context(element: Node): contextMod.IIndexedHtmlRenderContext{
            return new contextMod.HtmlRenderContext(element);
        }

        /**
         * Registers a new renderer for the given tag
         * @param {string} tag The tag name
         * @param {(config: IElementConfig) => IHtmlNodeComponent} renderer A function returning a virtual dom element node for the given virtual dom element
         */
        export function register(tag: string, renderer: (config: nodeMod.IElementConfig) => nodeMod.IHtmlNodeComponent){
            htmlModule.registerRenderer(tag, renderer);
        }

    }

    /**
     * Creates a svg virtual dom element node for a given svg virtual dom element
     * @param {ISVGConfig | string | attach.IBaseShape} config
     * @returns {attach.html.IHtmlNodeComponent}
     */
    export function svg(config: svgMod.ISVGConfig | string | IBaseShape): html.IHtmlNodeComponent{
        return svgMod.default(config);
    }

    export namespace svg{
        export type ISVGConfig = svgMod.ISVGConfig;
        export type ISvgShape = svgMod.ISvgShape;
    }

    export const detach = htmlModule.detach;
    export const attach = htmlModule.attach;
    export const isNode = util.isNode;
    export const mapper = cachingMapper;

}

export = attach;