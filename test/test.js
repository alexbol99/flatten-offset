'use strict';

import {expect} from 'chai';
import {Polygon} from "@flatten-js/core";
import {point, segment, arc, circle, CW, CCW} from "@flatten-js/core";

import offset from "../index.js";
import {arcSE} from "../src/createArcs";
import {offsetArc} from "../src/polygonOffset";

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

    it('Method offset arc can create legal polygon. Simple case', function () {
        let testArc = arc(point(133434061, 124903644), 400000, 0, 4.71238898038469, CW );
        let testOffsetArc = offsetArc(testArc, 20);
        expect(testOffsetArc.faces.size).to.be.equal(1);
    });
    it('Method offset can enlarge to small value', function () {
        // let shapes = [
        //     point(0, 0), point(200, 0), point(200, 200), point(0, 200)
        // ];

        let shapes = [
            segment(point(0, 0), point(200, 0)),
            segment(point(200, 0), point(200, 200)),
            segment(point(200, 200), point(0, 200)),
            segment(point(0, 200), point(0, 0))
        ];

        let polygon = new Polygon(shapes);
        polygon.reverse()
        let offsetPolygon = offset(polygon, 2);

        expect(offsetPolygon.faces.size).to.be.equal(1);
        expect(offsetPolygon.edges.size).to.be.equal(8);
    });
    it('Offset sometimes not working Issue #11', () => {
        let points = [
            [554.4, 420.1],
            [637.3, 414.7],
            [710.3, 411.7],
            [746.5, 408.9],
            [782.5, 404.1],
            [808.1, 398],
            [833.2, 390.2],
            [857.7, 381],
            [881.6, 370.2],
            [903.4, 358.1],
            [924.3, 344.6],
            [944.4, 330],
            [963.8, 314.3],
            [992.6, 286.4],
            [1019, 256.1],
            [1036.8, 233.7],
            [1053, 210.2],
            [1065.6, 188.6],
            [1077, 166.4],
            [1108.7, 95.7],
            [872.4, 0],
            [845.2, 48],
            [833.4, 66.9],
            [820.3, 84.9],
            [801.9, 104.7],
            [781.4, 122.6],
            [766.8, 132.7],
            [751.4, 141.1],
            [733.1, 149.2],
            [714, 155],
            [690.1, 158.5],
            [666, 160.2],
            [617.5, 161.4],
            [554.4, 162.3],
            [491.2, 161.4],
            [442.8, 160.2],
            [418.7, 158.5],
            [394.8, 155],
            [375.6, 149.2],
            [357.3, 141.1],
            [341.9, 132.7],
            [327.3, 122.6],
            [306.8, 104.7],
            [288.4, 84.9],
            [275.3, 66.9],
            [263.5, 48],
            [236.4, 0],
            [0, 95.7],
            [31.7, 166.4],
            [43.1, 188.6],
            [55.7, 210.2],
            [71.9, 233.7],
            [89.7, 256.1],
            [116.2, 286.4],
            [144.9, 314.3],
            [164.3, 330],
            [184.4, 344.6],
            [205.3, 358.1],
            [227.1, 370.2],
            [251, 381],
            [275.5, 390.2],
            [300.7, 398],
            [326.2, 404.1],
            [362.2, 408.9],
            [398.4, 411.7],
            [471.4, 414.7]
        ]

        // for (let scale = 0.3; scale <= 1; scale += 0.025) {
            const scale = 0.75;
            const scaledPoints = points.map((pp) => [pp[0] * scale, pp[1] * scale]);

            // Calculate offset.
            const polygon = new Polygon(scaledPoints);

            const offsetPolygon = offset(polygon, -3);

            expect(offsetPolygon.faces.size).to.be.equal(1);
        // }

    });
});
