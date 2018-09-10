
let points = [
  {"x":5,"y":431},
  {"x":42,"y":431},
  {"x":42,"y":491},
  {"x":5,"y":491},
  {"x":12,"y":430},
  {"x":12,"y":396},
  {"x":62,"y":396},
  {"x":62,"y":460},
  {"x":41,"y":460},
  {"x":12,"y":430}
  // {x: 40, y: 40},
  // {x: 60, y: 40},
  // {x: 60, y: 60},
  // {x: 40, y: 60},
  // {x: 0, y: 50},
  // {x: 50, y: 0},
  // {x: 50, y: 100},
  // {x: 100, y: 50}
];

const boundingBox = getBoundingBoxFromPoints(points);

function getBoundingBoxFromPoints(points) {
  // var minX = points[0].x;
  // var maxX = points[0].x;
  // var minY = points[0].y;
  // var maxY = points[0].y;

  // for (var i = 1; i < points.length; i++) {
  //     if (points[i].x < minX) minX = points[i].x;
  //     if (points[i].x > maxX) maxX = points[i].x;
  //     if (points[i].y < minY) minY = points[i].y;
  //     if (points[i].y > maxY) maxY = points[i].y;
  // }

  let minX, maxX, minY, maxY;
  points.forEach(point => {
    if (typeof minX === 'undefined' || point.x < minX) minX = point.x;
    if (typeof maxX === 'undefined' || point.x > maxX) maxX = point.x;
    if (typeof minY === 'undefined' || point.y < minY) minY = point.y;
    if (typeof maxY === 'undefined' || point.y > maxY) maxY = point.y;
  });

  // let minX, maxX, minY, maxY;
  // points.forEach(point => {
  //   if (!minX || point.x < minX) minX = point.x;
  //   if (!maxX || point.x > maxX) maxX = point.x;
  //   if (!minY || point.y < minY) minY = point.y;
  //   if (!maxY || point.y > maxY) maxY = point.y;
  // });

  return [ minX, maxX, minY, maxY ];
}

const center = {
  x: boundingBox[0] + (boundingBox[1] - boundingBox[0]) / 2,
  y: boundingBox[2] + (boundingBox[3] - boundingBox[2]) / 2
};

for (let i = 0; i < points.length; i++) {
  points[i].angle = Math.acos((points[i].x - center.x) / lineDistance(center, points[i]));
  if (points[i].y > center.y) {
    points[i].angle = Math.PI + Math.PI - points[i].angle;
  }
}

points = points.sort((a, b) => a.angle - b.angle);

function dist(x1, y1, x2, y2) {
  var xs = x2 - x1, ys = y2 - y1;
  return Math.sqrt(xs * xs + ys * ys);
}

function lineDistance(point1, point2) {
  return dist(point1.x, point1.y, point2.x, point2.y);
}

var setup = () => {
  fullScreen();
  background(255, 0, 0);
  path(points);
};

var draw = () => {

};

var mouseClicked = () => {

};
