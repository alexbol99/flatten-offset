'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var core = require('@flatten-js/core');

function arcSE(center, start, end, counterClockwise) {
    let startAngle = core.vector(center,start).slope;
    let endAngle = core.vector(center, end).slope;
    if (core.Utils.EQ(startAngle, endAngle)) {
        endAngle += 2*Math.PI;
        counterClockwise = true;
    }
    let r = core.vector(center, start).length;

    return new core.Arc(center, r, startAngle, endAngle, counterClockwise);
}

function arcStartSweep(center, start, sweep, counterClockwise) {
    let startAngle = core.vector(center,start).slope;
    let endAngle = startAngle + sweep;
    if (core.Utils.EQ(startAngle, endAngle)) {
        endAngle += 2*Math.PI;
        counterClockwise = true;
    }
    else if (core.Utils.GT(endAngle, 2*Math.PI)) {
        endAngle -= 2*Math.PI;
    }
    else if (core.Utils.LT(endAngle, -2*Math.PI)) {
        endAngle += 2*Math.PI;
    }
    let r = core.vector(center, start).length;

    return new core.Arc(center, r, startAngle, endAngle, counterClockwise);
}

function arcEndSweep(center, end, sweep, counterClockwise) {
    let endAngle = core.vector(center,end).slope;
    let startAngle = endAngle - sweep;
    if (core.Utils.EQ(startAngle, endAngle)) {
        startAngle += 2*Math.PI;
        counterClockwise = true;
    }
    else if (core.Utils.GT(startAngle, 2*Math.PI)) {
        startAngle -= 2*Math.PI;
    }
    else if (core.Utils.LT(startAngle, -2*Math.PI)) {
        startAngle += 2*Math.PI;
    }

    let r = core.vector(center, end).length;

    return new core.Arc(center, r, startAngle, endAngle, counterClockwise);
}

/**
 * Created by Alex Bol on 12/02/2018.
 */


const {unify, subtract, BOOLEAN_UNION} = core.BooleanOperations;
const {addToIntPoints, getSortedArray, splitByIntersections} = core.SmartIntersections;
const {removeNotRelevantChains, removeOldFaces, restoreFaces} = core.BooleanOperations;

/**
 * Offset polygon by given value
 * @param {Polygon} polygon - input polygon
 * @param {number} value - offset value, may be positive or negative
 * @returns {Polygon} offsetPolygon
 */

/**
 *
 * @param polygon
 * @param value
 *
 */
function offset(polygon, value) {
    let w = value;

    let edges = [...polygon.edges];
    let offsetPolygon = polygon.clone();
    let offsetEdge;

    if (w != 0) {
        // let counter = 0
        for (let edge of edges) {
            if (edge.isSegment()) {
                offsetEdge = offsetSegment(edge.shape, w);
            }
            else {
                offsetEdge = offsetArc(edge.shape, w);
            }

            if (w > 0) {
                offsetPolygon = unify(offsetPolygon, offsetEdge);
            }
            else {
                offsetPolygon = subtract(offsetPolygon, offsetEdge);
            }
            // counter++;
        }
    }

    return offsetPolygon;
}

function offsetArc(arc, value) {

    let w = Math.abs(value);

    // Define outline polygon
    let polygon = new core.Polygon();
    let arc_cap1,arc_cap2;

    let arc_outer = arc.clone();
    arc_outer.r = arc.r + w;

    arc_cap1 = arcStartSweep(arc.end, arc_outer.end, Math.PI, arc.counterClockwise);
    arc_cap2 = arcEndSweep(arc.start, arc_outer.start, Math.PI, arc.counterClockwise);

    let arc_inner = undefined;
    if (arc.r > w) {
        arc_inner = new core.Arc(arc.pc, arc.r - w, arc.endAngle, arc.startAngle,
            arc.counterClockwise === core.CW ? core.CCW : core.CW);
    }
    else {
        arc_inner = new core.Segment(arc_cap1.end, arc_cap2.start);
    }

    polygon.addFace([arc_outer, arc_cap1, arc_inner, arc_cap2]);
    [...polygon.faces][0].setArcLength();

    // Create intersection points
    let ips = core.Face.getSelfIntersections([...polygon.faces][0], polygon.edges, false);

    // TODO: getSelfIntersections returns points with correspondent edges - avoid duplication
    ips = ips.slice(0,ips.length/2);    // for now slice array to avoid duplication in points

    let int_points = [];
    let edge_cap1;
    let edge_cap2;

    edge_cap1 = [...polygon.edges][1];
    edge_cap2 = [...polygon.edges][3];

    for (let pt of ips) {
        addToIntPoints(edge_cap1, pt, int_points);
        addToIntPoints(edge_cap2, pt, int_points);
    }

    // Sort intersection points and insert them as new vertices
    let int_points_sorted = getSortedArray(int_points);
    splitByIntersections(polygon, int_points_sorted);


    // Set BV flags
    let bv = core.OUTSIDE;
    for (let int_point of int_points_sorted) {
        int_point.edge_before.bv = bv;
        int_point.edge_after.bv = (bv == core.OUTSIDE ? core.INSIDE : core.OUTSIDE);
        bv = int_point.edge_after.bv;   // invert flag on each iteration
    }

    // Remove inner "chains"
    let op = BOOLEAN_UNION;
    removeNotRelevantChains(polygon, op, int_points_sorted, true);

    // return int_points_sorted;
    // Swap links
    let num = int_points.length;
    if (num > 0) {
        let edge_before;
        let edge_after;
        // 0 => 3
        edge_before = int_points_sorted[0].edge_before;
        edge_after = int_points_sorted[num-1].edge_after;
        edge_before.next = edge_after;
        edge_after.prev = edge_before;

        // Fill in missed links in intersection points
        int_points_sorted[0].edge_after = int_points_sorted[num-1].edge_after;
        int_points_sorted[num-1].edge_before = int_points_sorted[0].edge_before;

        if (num == 4) {
            // 2 => 1
            edge_before = int_points_sorted[2].edge_before;
            edge_after = int_points_sorted[1].edge_after;
            edge_before.next = edge_after;
            edge_after.prev = edge_before;

            // Fill in missed links in intersection points
            int_points_sorted[2].edge_after = int_points_sorted[1].edge_after;
            int_points_sorted[1].edge_before = int_points_sorted[2].edge_before;
        }

        // remove old faces
        removeOldFaces(polygon, int_points);
        // restore faces
        restoreFaces(polygon, int_points, int_points);
    }

    let face0 = [...polygon.faces][0];
    if (face0.orientation() === core.ORIENTATION.CCW) {
        polygon.reverse();
    }
    return polygon;
}

function offsetSegment(seg, value) {
    let w = Math.abs(value);

    let polygon = new core.Polygon();
    let v_seg = new core.Vector(seg.end.x-seg.start.x, seg.end.y-seg.start.y);
    let v_seg_unit = v_seg.normalize();
    let v_left = v_seg_unit.rotate90CCW().multiply(w);
    let v_right = v_seg_unit.rotate90CW().multiply(w);
    let seg_left = seg.translate(v_left);
    let seg_right = seg.translate(v_right).reverse();
    let cap1 = arcSE(seg.end, seg_left.end, seg_right.start, core.CW);
    let cap2 = arcSE(seg.start, seg_right.end, seg_left.start, core.CW);

    polygon.addFace([seg_left, cap1, seg_right, cap2]);
    return polygon;
}

exports.default = offset;
