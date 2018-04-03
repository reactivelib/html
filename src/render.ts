/**
 * Base interface for all virtual dom element nodes. For html or svg, a virtual node generally represents a html tag, like "div" or "table".
 * 
 */
export interface IBaseShape{

    /**
     * The parent of this.
     */
    parent: IBaseShape;

}

/**
 * Base configuration for a virtual dom element.
 */
export interface IShapeConfig{
    /**
     * The tag name
     */
    tag?: string;
}