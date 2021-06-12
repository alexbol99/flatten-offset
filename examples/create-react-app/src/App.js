import React from 'react';
import {point, segment, Polygon} from "@flatten-js/core";
import offset from "@flatten-js/polygon-offset";

const shapes = [
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

const polygon = new Polygon();
polygon.addFace(shapes);

const App = () => {
  const path = (polygon) => [...polygon.faces].reduce( (d, face) => d + face.svg(), "");
  return (
      <div>
        <h1>Hello Flatten World!</h1>
        <svg width="1500" height="500">
          <path stroke="black" stroke-width="1" fill="lightblue" fill-rule="evenodd" fill-opacity="1"
                d={path(polygon)} >
          </path>
          <path stroke="black" stroke-width="1" fill="lightcyan" fill-rule="evenodd" fill-opacity="0.4"
                d={path(offset(polygon,40))} >
          </path>
        </svg>
      </div>
  );
};

export default App;
