/**
 * Created by Alex Bol on 12/02/2018.
 */

"use strict";
import {Segment, Arc, Vector, Polygon, Face} from "@flatten-js/core";
import {CW, CCW, INSIDE, OUTSIDE, ORIENTATION} from "@flatten-js/core";
import {SmartIntersections, BooleanOperations} from "@flatten-js/core";
import {arcSE, arcStartSweep, arcEndSweep} from "./createArcs";

const {unify, subtract, BOOLEAN_UNION} = BooleanOperations;
const {addToIntPoints, getSortedArray, splitByIntersections} = SmartIntersections;
const {removeNotRelevantChains, removeOldFaces, restoreFaces} = BooleanOperations;

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
export function offset(polygon, value) {
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

export function offsetArc(arc, value) {
    let edges = [];

    let w = Math.abs(value);

    // Define outline polygon
    let polygon = new Polygon();
    let arc_cap1,arc_cap2;

    let arc_outer = arc.clone();
    arc_outer.r = arc.r + w;

    arc_cap1 = arcStartSweep(arc.end, arc_outer.end, Math.PI, arc.counterClockwise);
    arc_cap2 = arcEndSweep(arc.start, arc_outer.start, Math.PI, arc.counterClockwise);

    let arc_inner = undefined;
    if (arc.r > w) {
        arc_inner = new Arc(arc.pc, arc.r - w, arc.endAngle, arc.startAngle,
            arc.counterClockwise === CW ? CCW : CW);
    }
    else {
        arc_inner = new Segment(arc_cap1.end, arc_cap2.start);
    }

    polygon.addFace([arc_outer, arc_cap1, arc_inner, arc_cap2]);
    [...polygon.faces][0].setArcLength();

    // Create intersection points
    let ips = Face.getSelfIntersections([...polygon.faces][0], polygon.edges, false);

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
    let bv = OUTSIDE;
    for (let int_point of int_points_sorted) {
        int_point.edge_before.bv = bv;
        int_point.edge_after.bv = (bv == OUTSIDE ? INSIDE : OUTSIDE);
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
    if (face0.orientation() === ORIENTATION.CCW) {
        polygon.reverse();
    }
    return polygon;
}

export function offsetSegment(seg, value) {
    let w = Math.abs(value);

    let polygon = new Polygon();
    let v_seg = new Vector(seg.end.x-seg.start.x, seg.end.y-seg.start.y);
    let v_seg_unit = v_seg.normalize();
    let v_left = v_seg_unit.rotate90CCW().multiply(w);
    let v_right = v_seg_unit.rotate90CW().multiply(w);
    let seg_left = seg.translate(v_left);
    let seg_right = seg.translate(v_right).reverse();
    let cap1 = arcSE(seg.end, seg_left.end, seg_right.start, CW);
    let cap2 = arcSE(seg.start, seg_right.end, seg_left.start, CW);

    polygon.addFace([seg_left, cap1, seg_right, cap2]);
    return polygon;
}
