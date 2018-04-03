import {ICancellable, nullCancellable, procedure, unobserved} from "@reactivelib/reactive";

export interface IObjectDiffListener{
    
    add(property: string, value: any): void;
    remove(property: string, value: any): void;
    replace(property: string, value: any, old: any): void;
    after?();
    
}

export class ObjectDiffReturn{
    public properties: any;
    public p: procedure.IManualProcedureExecution;
    public listener: IObjectDiffListener;
    public cancel(){
        var p = this.p;
        p.cancel();
        var l = this.listener;
        for (var prop in this.properties){
            l.remove(prop, this.properties[prop]);
        }
    }
}

export function reactiveObjectDiff(object: any, listener: IObjectDiffListener){
    var ret = new ObjectDiffReturn();
    ret.properties = {};
    var p = procedure.manual(() => {
        var lastProperties = ret.properties;
        var newProps: any = {};
        for (var p in object){
            var val = object[p];
            if (val !== undefined){
                if (!(p in lastProperties)){
                    newProps[p] = val;
                    listener.add(p, val);
                }
                else{
                    var old = lastProperties[p];
                    if (old !== val){
                        listener.replace(p, val, old);
                    }
                    newProps[p] = val;
                }
            }
        }
        for (var p in lastProperties){
            if (!(p in newProps)){
                listener.remove(p, lastProperties[p]);
            }
        }
        ret.properties = newProps;
        listener.after && listener.after();
    });
    ret.p = p;
    ret.listener = listener;
    return ret;
}

export interface ISinglePropertyDiffManager{
    create(value: any): void;
    change(value: any, old: any): void;
    cancel(): void;
}

export interface IPropertyDiffSettings{
    [s: string]: (value: any) => ICancellable; 
}

export interface IManualDiffer{
    update(value: any): void;
    cancel(): void;
}

class ManagedPropertyDiffer implements IManualDiffer{
    
    public cancellable: ICancellable;
    public lastVal: any;
    
    constructor(public updater: (value: any) => ICancellable){
        
    }
    
    public update(value: any){
        unobserved(() => {
            if (value === void 0){
                if (this.lastVal !== void 0){
                    this.cancellable.cancel();
                }
            }
            else
            {
                if (this.lastVal === void 0){
                    this.cancellable = this.updater(value);
                }
                else if (value !== this.lastVal){
                    this.cancellable.cancel();
                    this.cancellable = this.updater(value);
                }
            }
            this.lastVal = value;
        });        
    }
    
    public cancel(){
        this.cancellable.cancel();
    }
}

ManagedPropertyDiffer.prototype.cancellable = nullCancellable;
ManagedPropertyDiffer.prototype.lastVal = void 0;

class UnmanagedPropertyDiffer implements IManualDiffer{
    
    public lastVal: any;
    
    constructor(public differ: ISinglePropertyDiffManager){
        
    }
    
    public update(value: any){
        unobserved(() => {
            if (value === void 0){
                if (this.lastVal !== void 0){
                    this.differ.cancel();
                }
            }
            else
            {
                if (this.lastVal === void 0){
                    this.differ.create(value);
                }
                else if (value !== this.lastVal){
                    this.differ.change(this.lastVal, value);
                }
            }
            this.lastVal = value;
        });        
    }
    
    public cancel(){
        if (this.lastVal !== void 0){
            this.differ.cancel();
        }
    }
    
}

UnmanagedPropertyDiffer.prototype.lastVal = void 0;

export function managedDiffer(updater: (value: any) => ICancellable): IManualDiffer{
    return new ManagedPropertyDiffer(updater);
}

export function unmanagedDiffer(differ: ISinglePropertyDiffManager): IManualDiffer{
    return new UnmanagedPropertyDiffer(differ);
}

class ManagedPropertyDiffManager implements ISinglePropertyDiffManager{
    
    public _cancel: ICancellable;
    
    constructor(public factory: (value: any) => ICancellable){
        
    }

    create(value: any): void{
        this._cancel = this.factory(value);
    }
    
    change(value: any, old: any): void{
        this._cancel.cancel();
        this._cancel = this.factory(value);
    }
    
    cancel(): void{
        this._cancel.cancel();
    }
}

ManagedPropertyDiffManager.prototype._cancel = nullCancellable;

class OtherPropertyDiffManager implements ISinglePropertyDiffManager{

    public _cancel: ICancellable;

    constructor(public property:string, public factory: (property: string, value: any) => ICancellable){

    }

    create(value: any): void{
        this._cancel = this.factory(this.property, value);
    }

    change(value: any, old: any): void{
        this._cancel.cancel();
        this._cancel = this.factory(this.property, value);
    }

    cancel(): void{
        this._cancel.cancel();
    }
}

OtherPropertyDiffManager.prototype._cancel = nullCancellable;