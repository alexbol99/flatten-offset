import {Utils, Arc, vector} from "@flatten-js/core";

export function arcSE(center, start, end, counterClockwise) {
    let startAngle = vector(center,start).slope;
    let endAngle = vector(center, end).slope;
    if (Utils.EQ(startAngle, endAngle)) {
        endAngle += 2*Math.PI;
        counterClockwise = true;
    }
    let r = vector(center, start).length;

    return new Arc(center, r, startAngle, endAngle, counterClockwise);
}

export function arcStartSweep(center, start, sweep, counterClockwise) {
    let startAngle = vector(center,start).slope;
    let endAngle = startAngle + sweep;
    if (Utils.EQ(startAngle, endAngle)) {
        endAngle += 2*Math.PI;
        counterClockwise = true;
    }
    else if (Utils.GT(endAngle, 2*Math.PI)) {
        endAngle -= 2*Math.PI;
    }
    else if (Utils.LT(endAngle, -2*Math.PI)) {
        endAngle += 2*Math.PI;
    }
    let r = vector(center, start).length;

    return new Arc(center, r, startAngle, endAngle, counterClockwise);
}

export function arcEndSweep(center, end, sweep, counterClockwise) {
    let endAngle = vector(center,end).slope;
    let startAngle = endAngle - sweep;
    if (Utils.EQ(startAngle, endAngle)) {
        startAngle += 2*Math.PI;
        counterClockwise = true;
    }
    else if (Utils.GT(startAngle, 2*Math.PI)) {
        startAngle -= 2*Math.PI;
    }
    else if (Utils.LT(startAngle, -2*Math.PI)) {
        startAngle += 2*Math.PI;
    }

    let r = vector(center, end).length;

    return new Arc(center, r, startAngle, endAngle, counterClockwise);
}

