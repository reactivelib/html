/**
 * 
 * Represents a css style. Used to style @api{render.IHtmlNodeShape, html shapes}. 
 * Each property defined is assumed to represent a style in a css-declaration, e.g.
 * 
 * 
 * ```.javascript
 *  {
 *      backgroundColor: "rgb(255, 0, 0)",
 *      font: "20px arial"
 *  }
 * ```
 * Equivalent to following css style
 * ```.css
 * 
 * {
 *  background-color: rgb(255, 0, 0);
 *  font: 20px arial;
 * }
 * 
 * ```
 
 * 
 */
export interface ICSSStyle{
    [s: string]: any;
}