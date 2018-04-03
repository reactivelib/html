import {IBaseShape} from "../../render";
import {IHtmlNodeShape} from "./index";
import {IHtmlRenderContext} from "./context";

export class HTMLTextRenderer implements IBaseShape
{
    
    public element: Text;
    public parent: IHtmlNodeShape;
    public __shape_node: boolean;
    public settings = null;

    constructor() {
        this.element = document.createTextNode("");
    }

    public render(ctx: IHtmlRenderContext){
        ctx.push(this.element);
    }

    get parentModel(){
        return this.parent && this.parent.settings;
    }

    public destroy(){
    }

    set text(t: string){
        this.element.nodeValue = t;
    }

    get text(){
        return this.element.wholeText;
    }

    onDetached(){

    }

    onAttached(){

    }


}

HTMLTextRenderer.prototype.__shape_node = true;

export function createTextShape(config: string){
    var txt = new HTMLTextRenderer();
    txt.text = config;
    return txt;

}