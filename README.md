[![npm version](https://badge.fury.io/js/flatten-offset.svg)](https://badge.fury.io/js/flatten-offset)
[![Build Status](https://travis-ci.org/alexbol99/flatten-offset.svg?branch=master)](https://travis-ci.org/alexbol99/flatten-offset)

# Offset polygon

This package implements algorithm of equidistant offset of polygon. It relies on the  [FlattenJS](<https://github.com/alexbol99/flatten-js>)
library and its polygon model, which is multi polygon comprised from a number of islands and holes, 
see [this](https://beta.observablehq.com/@alexbol99/flattenjs-tutorials-polygons) interactive notebook for more  details.

Algorithm is based on the idea of morphological offset, when each edge of the polygon is mapped to its offset,
and then [boolean operation](https://github.com/alexbol99/flatten-boolean-op) performed between original contour and offset edges.
When offset value is positive, offset edges are united with original contour, when negative - they are
subtracted from original contour.

## Installation

You have to install flatten-offset package together with [FlattenJS](<https://github.com/alexbol99/flatten-js>) library, in order to use its polygon creation methods.
  
    npm install --save flatten-js flatten-offset 

## Usage

The package expose single method *offset*, which is added to Flatten.Polygon prototype.
So we can use it in the way:
```javascript
    let offsetPolygon = polygon.offset(offset_value)
```

Example:
```javascript
    let Flatten = require('flatten-js');
    require('flatten-offset');
    
    // Create polygon
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
    
    // Apply polygon offset
    let offsetPolygon = polygon.offset(20);
```

See [Offset Polygon](https://beta.observablehq.com/@alexbol99/offset-polygon-test/2) interactive notebook
to explore this algorithm in work.
 