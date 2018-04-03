/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {hash} from "@reactivelib/core";

export interface ICachingMapper<E, M>{
    map(vals: E[]): M[];
}

class CachingMapper<E, M>{

    public valToMapped = hash.map<E, M>();
    public onRemoved: (val: M) => void;

    constructor(public mapper: (e: E) => M){

    }

    public map(vals: E[]): M[]{
        var res: M[] = [];
        var newValToMapped = hash.map<E, M>();
        for (var i=0; i < vals.length; i++){
            var v = vals[i];
            var m = this.valToMapped.get(v);
            if (!m){
                m = this.mapper(v);
            }
            res.push(m);
            newValToMapped.put(v, m);
        }
        if (this.onRemoved){
            for (var k in this.valToMapped.objects){
                if (!(k in newValToMapped.objects)){
                    var kv = this.valToMapped.objects[k];
                    this.onRemoved(kv.value);
                }

            }
        }
        this.valToMapped = newValToMapped;
        return res;
    }

}

export interface ICachingMapperOptions<M>{
    onRemoved?: (val: M) => void;
}

export function cachingMapper<E, M>(mapper: (e: E) => M, settings: ICachingMapperOptions<M> = {}): ICachingMapper<E, M>{
    var m = new CachingMapper(mapper);
    if (settings.onRemoved){
        m.onRemoved = settings.onRemoved;
    }
    return m;
}