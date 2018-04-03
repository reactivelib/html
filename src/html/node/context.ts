/**
 * This interface is used to attach real nodes to other nodes during the rendering of a virtual dom element.
 */
export interface IHtmlRenderContext {

    /**
     * The element nodes will be attached to using "push"
     */
    element: Node;

    /**
     * Attaches the given node to the element.
     * @param {Node} node
     */
    push(node: Node);

    /**
     * Removes the last node from the element.
     * @param {number} nr If specified, removes the last nr of nodes from the element.
     */
    pop(nr?: number);
}

export interface IIndexedHtmlRenderContext extends IHtmlRenderContext{
    /**
     * The current position elements will be attached to
     */
    index: number;

    /**
     * Called after all children have been attached. Removes all nodes that have not been reattached.
     */
    stop();
}

export class HtmlRenderContext implements IIndexedHtmlRenderContext{

    public index = 0;

    constructor(public element: Node){

    }

    public push(node: Node){
        var el = this.element;
        if (this.index ===  el.childNodes.length){
            el.appendChild(node);
        }
        else if (el.childNodes[this.index] !== node){
            el.replaceChild(node, el.childNodes[this.index]);
        }
        this.index++;
    }

    public pop(nr = 1){
        this.index -= nr;
    }

    public stop(){
        var el = this.element;
        var cn = el.childNodes;
        var l = cn.length;
        for (var i=this.index; i < l; i++){
            el.removeChild(cn[cn.length - 1]);
        }
        this.index = 0;
    }

}

export class HtmlRootContext implements IIndexedHtmlRenderContext{

    public index = 0;
    public oldElements: Node[] = [];
    public recalc = false;

    constructor(public element: Node){

    }

    public push(node: Node){
        var el = this.element;
        if (this.index ===  this.oldElements.length){
            el.appendChild(node);
            this.oldElements.push(node);
        }
        else if (this.oldElements[this.index] !== node){
            el.removeChild(this.oldElements[this.index]);
            el.appendChild(node);
            this.oldElements[this.index] = node;
        }
        this.index++;
    }

    public pop(nr = 1){
        this.index -= nr;
    }

    public stop(){
        var el = this.element;
        var l = this.oldElements.length;
        for (var i=this.index; i < l; i++){
            el.removeChild(this.oldElements[i]);
        }
        this.oldElements.length = this.index;
        this.index = 0;
    }


    public destroy(){
        var el = this.element;
        this.oldElements.forEach(oe => {
            el.removeChild(oe);
        });
        this.oldElements = [];
    }

}