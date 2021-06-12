// Just hit "node index.js" in the terminal while you are in the directory of this project
import Flatten from "@flatten-js/core";
import Offset from "@flatten-js/polygon-offset";

let {point, segment, Polygon} = Flatten;
let offset = Offset.default;

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
let polygon = new Polygon(shapes);
let value = 40;

let offset_polygon = offset(polygon, value);

console.log(offset_polygon.faces.size);
console.log(offset_polygon.edges.size);

