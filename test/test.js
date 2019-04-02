'use strict';

import {expect} from 'chai';
// import Flatten from '@flatten-js/core/dist/main.umd.js';
import {Polygon} from "@flatten-js/core";
import {point, segment, arc, circle, CW, CCW} from "@flatten-js/core";

import {offset} from "../index.js";
import {arcSE} from "../src/createArcs";

describe('#Algorithms.Offset Polygon', function () {
    it('Function offset defined', function () {
        expect(offset).to.exist;
        expect(offset).to.be.a('function');
    });
    it('Method offset can enlarge polygon. Case 1. Offset to one-faced polygon', function () {
        let shapes = [
            segment(point(200,100), point(200,300)),
            segment(point(200,300), point(440,300)),
            segment(point(440,300), point(300,200)),
            segment(point(300,200), point(440,150)),
            segment(point(440,150), point(500,150)),
            segment(point(500,150), point(640,200)),
            segment(point(640,200), point(500,300)),
            segment(point(500,300), point(740,300)),
            segment(point(740,300), point(740,100)),
            segment(point(740,100), point(200,100))
        ];

        let polygon = new Polygon();
        polygon.addFace(shapes);
        let offsetPolygon = offset(polygon,20);
        expect(offsetPolygon.faces.size).to.be.equal(1);
        expect([...offsetPolygon.faces][0].size).to.be.equal(16);
    });
    it('Method offset can enlarge polygon. Case 2. Offset to polygon with  hole', function () {
        let shapes = [
            segment(point(200,100), point(200,300)),
            segment(point(200,300), point(440,300)),
            segment(point(440,300), point(300,200)),
            segment(point(300,200), point(440,150)),
            segment(point(440,150), point(500,150)),
            segment(point(500,150), point(640,200)),
            segment(point(640,200), point(500,300)),
            segment(point(500,300), point(740,300)),
            segment(point(740,300), point(740,100)),
            segment(point(740,100), point(200,100))
        ];

        let polygon = new Polygon();
        polygon.addFace(shapes);
        let offsetPolygon = offset(polygon,40);
        expect(offsetPolygon.faces.size).to.be.equal(2);
        expect([...offsetPolygon.faces][0].size).to.be.equal(7);
        expect([...offsetPolygon.faces][1].size).to.be.equal(11);
    });
    it('Method offset can enlarge polygon. Case 3. Offset to polygon inner hole shrinked to zero', function () {
        let shapes = [
            segment(point(200,100), point(200,300)),
            segment(point(200,300), point(440,300)),
            segment(point(440,300), point(300,200)),
            segment(point(300,200), point(440,150)),
            segment(point(440,150), point(500,150)),
            segment(point(500,150), point(640,200)),
            segment(point(640,200), point(500,300)),
            segment(point(500,300), point(740,300)),
            segment(point(740,300), point(740,100)),
            segment(point(740,100), point(200,100))
        ];

        let polygon = new Polygon();
        polygon.addFace(shapes);
        let offsetPolygon = offset(polygon,80);
        expect(offsetPolygon.faces.size).to.be.equal(1);
        expect([...offsetPolygon.faces][0].size).to.be.equal(11);
    });
    it('Method offset can shrink polygon. Case 4. Offset to single-faced polygon', function () {
        let shapes = [
            segment(point(200,100), point(200,300)),
            segment(point(200,300), point(440,300)),
            segment(point(440,300), point(300,200)),
            segment(point(300,200), point(440,150)),
            segment(point(440,150), point(500,150)),
            segment(point(500,150), point(640,200)),
            segment(point(640,200), point(500,300)),
            segment(point(500,300), point(740,300)),
            segment(point(740,300), point(740,100)),
            segment(point(740,100), point(200,100))
        ];

        let polygon = new Polygon();
        polygon.addFace(shapes);
        let offsetPolygon = offset(polygon,-20);
        expect(offsetPolygon.faces.size).to.be.equal(1);
        expect([...offsetPolygon.faces][0].size).to.be.equal(14);
    });
    it('Method offset can shrink polygon. Case 5. Offset split into two-faced polygon', function () {
        let shapes = [
            segment(point(200,100), point(200,300)),
            segment(point(200,300), point(440,300)),
            segment(point(440,300), point(300,200)),
            segment(point(300,200), point(440,150)),
            segment(point(440,150), point(500,150)),
            segment(point(500,150), point(640,200)),
            segment(point(640,200), point(500,300)),
            segment(point(500,300), point(740,300)),
            segment(point(740,300), point(740,100)),
            segment(point(740,100), point(200,100))
        ];

        let polygon = new Polygon();
        polygon.addFace(shapes);
        let offsetPolygon = offset(polygon,-30);
        expect(offsetPolygon.faces.size).to.be.equal(2);
        expect([...offsetPolygon.faces][0].size).to.be.equal(6);
        expect([...offsetPolygon.faces][1].size).to.be.equal(6);
    });
    it('Method offset can shrink polygon. Case 6. Offset split into 4-faced polygon', function () {
        let shapes = [
            segment(point(200,100), point(200,300)),
            segment(point(200,300), point(440,300)),
            segment(point(440,300), point(300,200)),
            segment(point(300,200), point(440,150)),
            segment(point(440,150), point(500,150)),
            segment(point(500,150), point(640,200)),
            segment(point(640,200), point(500,300)),
            segment(point(500,300), point(740,300)),
            segment(point(740,300), point(740,100)),
            segment(point(740,100), point(200,100))
        ];

        let polygon = new Polygon();
        polygon.addFace(shapes);
        let offsetPolygon = offset(polygon,-55);
        expect(offsetPolygon.faces.size).to.be.equal(4);
        expect([...offsetPolygon.faces][0].size).to.be.equal(4);
        expect([...offsetPolygon.faces][1].size).to.be.equal(4);
        expect([...offsetPolygon.faces][2].size).to.be.equal(3);
        expect([...offsetPolygon.faces][3].size).to.be.equal(3);
    });
    it('Method offset can shrink polygon. Case 7. Shrink to zero polygon', function () {
        let shapes = [
            segment(point(200, 100), point(200, 300)),
            segment(point(200, 300), point(440, 300)),
            segment(point(440, 300), point(300, 200)),
            segment(point(300, 200), point(440, 150)),
            segment(point(440, 150), point(500, 150)),
            segment(point(500, 150), point(640, 200)),
            segment(point(640, 200), point(500, 300)),
            segment(point(500, 300), point(740, 300)),
            segment(point(740, 300), point(740, 100)),
            segment(point(740, 100), point(200, 100))
        ];

        let polygon = new Polygon();
        polygon.addFace(shapes);
        let offsetPolygon = offset(polygon,-80);
        expect(offsetPolygon.faces.size).to.be.equal(0);
        // bug: 4 edges left
        expect(offsetPolygon.edges.size).to.be.equal(0);
    });

    it('Method offset can shrink polygon. Case 8. Cluster of duplicated intersection point', function () {
        let shapes = [
            segment(point(200, 100), point(200, 300)),
            segment(point(200, 300), point(440, 300)),
            segment(point(440, 300), point(300, 200)),
            segment(point(300, 200), point(440, 150)),
            segment(point(440, 150), point(500, 150)),
            segment(point(500, 150), point(640, 200)),
            segment(point(640, 200), point(500, 300)),
            segment(point(500, 300), point(740, 300)),
            segment(point(740, 300), point(740, 100)),
            segment(point(740, 100), point(200, 100))
        ];

        let polygon = new Polygon();
        polygon.addFace(shapes);
        let offsetPolygon = offset(polygon,-50);
        expect(offsetPolygon.faces.size).to.be.equal(2);
        expect([...offsetPolygon.faces][0].size).to.be.equal(8);
        expect([...offsetPolygon.faces][1].size).to.be.equal(8);
    });
    it('Method offset can enlarge polygon with arcs. Case 9 create inner hole', function () {
        let shapes = [
            segment(point(200,100), point(200,300)),
            segment(point(200,300), point(440,300)),
            arcSE(point(470,225),point(440,300), point(440,150), CCW),

            segment(point(440,150), point(500,150)),
            arcSE(point(470,225),point(500,150), point(500,300), CCW),

            segment(point(500,300), point(740,300)),
            segment(point(740,300), point(740,100)),
            segment(point(740,100), point(200,100))
        ];

        let polygon = new Polygon();
        polygon.addFace(shapes);
        let offsetPolygon = offset(polygon,33);
        expect(offsetPolygon.faces.size).to.be.equal(2);
        expect([...offsetPolygon.faces][0].size).to.be.equal(5);
        expect([...offsetPolygon.faces][1].size).to.be.equal(11);
    });
});
