/**
 * Returns true if the given object is a virtual dom element node
 * @param n
 * @returns {any}
 */
export function isNode(n: any){
    if (typeof n === "object"){
        return n.__shape_node;
    }
    return false;
}
