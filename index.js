
/**
 * Created by Alex Bol on 12/02/2018.
 */
"use strict";
let Flatten = require("flatten-js");
let BooleanOp = require("flatten-boolean-op");

let {Point, Segment, Vector, Line, Box, Arc, Polygon, Face} = Flatten;
let {point, segment, arc, vector} = Flatten;

/**
 * Class Offset implements offset of polygons
 */
class Offset {
    /**
     * Offset polygon by given value
     * @param {Polygon} polygon - input polygon
     * @param {number} value - offset value, may be positive or negative
     */
    static offset(polygon, value) {
        let w = value;

        let edges = [...polygon.edges];
        let offsetPolygon = polygon.clone();
        let offsetEdge;

        if (w != 0) {

            for (let edge of edges) {
                if (edge.isSegment()) {
                    offsetEdge = Offset.offsetSegment(edge.shape, w);
                }
                else {
                    offsetEdge = Offset.offsetArc(edge.shape, w);
                }

                if (w > 0) {
                    offsetPolygon = BooleanOp.unify(offsetPolygon, offsetEdge);
                }
                else {
                    offsetPolygon = BooleanOp.subtract(offsetPolygon, offsetEdge);
                }
            }
        }

        return offsetPolygon;
    }

    static offsetSegment(seg, value) {
        let w = Math.abs(value);

        let polygon = new Polygon();
        let v_seg = vector(seg.start, seg.end);
        let v_seg_unit = v_seg.normalize();
        let v_left = v_seg_unit.rotate90CCW().multiply(w);
        let v_right = v_seg_unit.rotate90CW().multiply(w);
        let seg_left = seg.translate(v_left);
        let seg_right = seg.translate(v_right).reverse();
        let cap1 = Offset.arcSE(seg.end, seg_left.end, seg_right.start, Flatten.CW);
        let cap2 = Offset.arcSE(seg.start, seg_right.end, seg_left.start, Flatten.CW);

        polygon.addFace([seg_left, cap1, seg_right, cap2]);
        return polygon;
    }

    static offsetArc(arc, value) {
        let edges = [];

        let w = Math.abs(value);

        // Define outline polygon
        let polygon = new Polygon();
        let arc_cap1,arc_cap2;

        let arc_outer = arc.clone();
        arc_outer.r = arc.r + w;

        arc_cap1 = Offset.arcStartSweep(arc.end, arc_outer.end, Math.PI, arc.counterClockwise);
        arc_cap2 = Offset.arcEndSweep(arc.start, arc_outer.start, Math.PI, arc.counterClockwise);

        let arc_inner = undefined;
        if (arc.r > w) {
            arc_inner = new Arc(arc.pc, arc.r - w, arc.endAngle, arc.startAngle,
                arc.counterClockwise === Flatten.CW ? Flatten.CCW : Flatten.CW);
        }
        else {
            // arc_inner = new Arc(arc.pc, w - arc.r, arc.startAngle, arc.endAngle, arc.counterClockwise);
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
            BooleanOp.addToIntPoints(edge_cap1, pt, int_points);
            BooleanOp.addToIntPoints(edge_cap2, pt, int_points);
        }

        // Sort intersection points and insert them as new vertices
        let int_points_sorted = BooleanOp.getSortedArray(int_points);
        BooleanOp.splitByIntersections(polygon, int_points_sorted);


        // Set BV flags
        let bv = Flatten.OUTSIDE;
        for (let int_point of int_points_sorted) {
            int_point.edge_before.bv = bv;
            int_point.edge_after.bv = (bv == Flatten.OUTSIDE ? Flatten.INSIDE : Flatten.OUTSIDE);
            bv = int_point.edge_after.bv;   // invert flag on each iteration
        }

        // Remove inner "chains"
        let op = Flatten.BOOLEAN_UNION;
        BooleanOp.removeNotRelevantChains(polygon, op, int_points_sorted, true);

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
            BooleanOp.removeOldFaces(polygon, int_points);
            // restore faces
            BooleanOp.restoreFaces(polygon, int_points, int_points);
        }

        let face0 = [...polygon.faces][0];
        if (face0.orientation() === Flatten.ORIENTATION.CCW) {
            polygon.reverse();
        }
        return polygon;
    }

    static arcSE(center, start, end, counterClockwise) {
        let startAngle = vector(center,start).slope;
        let endAngle = vector(center, end).slope;
        if (Flatten.Utils.EQ(startAngle, endAngle)) {
            endAngle += 2*Math.PI;
            counterClockwise = true;
        }
        let r = vector(center, start).length;

        return new Arc(center, r, startAngle, endAngle, counterClockwise);
    }

    static arcStartSweep(center, start, sweep, counterClockwise) {
        let startAngle = vector(center,start).slope;
        let endAngle = startAngle + sweep;
        if (Flatten.Utils.EQ(startAngle, endAngle)) {
            endAngle += 2*Math.PI;
            counterClockwise = true;
        }
        let r = vector(center, start).length;

        return new Arc(center, r, startAngle, endAngle, counterClockwise);
    }

    static arcEndSweep(center, end, sweep, counterClockwise) {
        let {vector, Arc} = Flatten;
        let endAngle = vector(center,end).slope;
        let startAngle = endAngle - sweep;
        if (Flatten.Utils.EQ(startAngle, endAngle)) {
            endAngle += 2*Math.PI;
            counterClockwise = true;
        }
        let r = vector(center, end).length;

        return new Arc(center, r, startAngle, endAngle, counterClockwise);
    }
}

Flatten.Polygon.prototype.offset = function(value) {
    return Offset.offset(this, value);
};

Offset.Flatten = Flatten;

module.exports = Offset;

