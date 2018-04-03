/*
 * Copyright (c) 2018. Christoph Rodak  (https://reactivechart.com)
 */

import {array} from "@reactivelib/reactive";
import {transaction} from "@reactivelib/reactive";
import {expect} from "chai";
import attach = require("../../../index");
import {stub} from '@reactivelib/test';

class ToAttach{

    public isAttached = 0;
    public isDetached = 0;

    public onAttached(){
        this.isAttached++;
    }

    public onDetached(){
        this.isDetached++;
    }

}

function getElementIndex(node) {
    var index = 0;
    while ( (node = node.previousElementSibling) ) {
        index++;
    }
    return index;
}

describe("rendering of children", () => {

    var time = stub.time();

    it("should only call onAttached on newly added shapes", () => {
        var els = array<any>();
        var g = {
            tag: "div",
            get child(){
                return els.values;
            }
        }
        attach(document.body, g);
        var t1 = <any>new ToAttach();
        var t2 = <any>new ToAttach();
        transaction(() => {
            els.push(t1);
            els.push(t2);
        });

        time.runAll();

        expect(t1.isAttached).to.equal(1);
        expect(t2.isAttached).to.equal(1);

        expect(getElementIndex(t1.node.element)).to.equal(0);
        expect(getElementIndex(t2.node.element), "node numero 2").to.equal(1);

        var t3 = <any>new ToAttach();
        els.insert(1, t3);
        time.runAll();
        expect(t1.isAttached, "attach 1").to.equal(1);
        expect(t2.isAttached).to.equal(1);
        expect(t3.isAttached).to.equal(1);

        expect(t1.isDetached).to.equal(0);
        expect(t2.isDetached).to.equal(0);
        expect(t3.isDetached).to.equal(0);

        expect(t2.node.element).to.not.equal(t3.node.element);

        expect(getElementIndex(t1.node.element)).to.equal(0);
        expect(getElementIndex(t2.node.element)).to.equal(2);
        expect(getElementIndex(t3.node.element), "node numero 3").to.equal(1);

        els.remove(0);
        time.runAll();

        expect(t1.isAttached, "attach 1").to.equal(1);
        expect(t2.isAttached).to.equal(1);
        expect(t3.isAttached).to.equal(1);
        expect(t1.isDetached).to.equal(1);
        expect(t2.isDetached).to.equal(0);
        expect(t3.isDetached).to.equal(0);

        expect(getElementIndex(t2.node.element)).to.equal(1);
        expect(getElementIndex(t3.node.element), "node numero 3").to.equal(0);

    });
})