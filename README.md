[![npm version](https://badge.fury.io/js/%40flatten-js%2Fpolygon-offset.svg)](https://badge.fury.io/js/%40flatten-js%2Fpolygon-offset)
[![Build Status](https://travis-ci.org/alexbol99/flatten-offset.svg?branch=master)](https://travis-ci.org/alexbol99/flatten-offset)
[![Coverage Status](https://coveralls.io/repos/github/alexbol99/flatten-offset/badge.svg?branch=master)](https://coveralls.io/github/alexbol99/flatten-offset?branch=master)

# Offset polygon

This package implements algorithm of equidistant offset of polygon. It relies on the  [flatten-js](<https://github.com/alexbol99/flatten-js>)
library and its polygon model.

Algorithm based on the idea of morphological offset, when each edge of the polygon is mapped to its offset,
and then [boolean operation](https://github.com/alexbol99/flatten-boolean-op) performed between original contour and offset edges.
When offset value is positive, offset edges are unified with original contour, when negative - they are
subtracted from original contour.

## Contacts

Follow me on Twitter [@alex_bol_](https://twitter.com/alex_bol_)


## Installation
```bash  
    npm install --save @flatten-js/polygon-offset
```
    
The package [@flatten-js/core](<https://github.com/alexbol99/flatten-js>) is peer dependency of this package
and have to be installed separately:

```bash
    npm install --save @flatten-js/core
```

## Usage

```javascript
    import offset from "@flatten-js/polygon-offset"

    let offsetPolygon = offset(polygon, offset_value)
```

## Example:
```javascript
    import {segment, point, Polygon} from "@flatten-js/core"
    import offset from "@flatten-js/polygon-offset"

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
    let offsetPolygon = offset(polygon, 20);
```

