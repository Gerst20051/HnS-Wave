// const gameBoardSize = 5000;
const gameBoardSize = 500;

const DIRECTION = {
  NONE: 0,
  LEFT: -1,
  UP: -2,
  RIGHT: 1,
  DOWN: 2,
};

// http://jsfromhell.com/math/is-point-in-poly
// https://gist.github.com/Sigmus/4318354
// https://gist.github.com/fallenartist/538244d124448365a6fd
// https://stackoverflow.com/questions/22521982/check-if-point-is-inside-a-polygon
// https://en.wikipedia.org/wiki/Point_in_polygon
// https://www.inkfood.com/collision-detection-with-svg
function isPointInPoly(poly, pt) {
  for (var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
    ((poly[i].y <= pt.y && pt.y < poly[j].y) || (poly[j].y <= pt.y && pt.y < poly[i].y))
    && (pt.x < (poly[j].x - poly[i].x) * (pt.y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x)
    && (c = !c);
  return c;
}

function chooseRandomDirection() {
  return randomElement([ DIRECTION.LEFT, DIRECTION.UP, DIRECTION.RIGHT, DIRECTION.DOWN ]);
}

function isPointInsideBoundingBox(pointX, pointY, minX, maxX, minY, maxY) {
  return minX < pointX && pointX < maxX && minY < pointY && pointY < maxY;
}

function getBoundingBoxFromPoints(points) {
  let minX, maxX, minY, maxY;
  points.forEach(point => {
    if (typeof minX === 'undefined' || point.x < minX) minX = point.x;
    if (typeof maxX === 'undefined' || point.x > maxX) maxX = point.x;
    if (typeof minY === 'undefined' || point.y < minY) minY = point.y;
    if (typeof maxY === 'undefined' || point.y > maxY) maxY = point.y;
  });
  return [ minX, maxX, minY, maxY ];
}

function getCenterOfBoundingBox(boundingBox) {
  return {
    x: boundingBox[0] + (boundingBox[1] - boundingBox[0]) / 2,
    y: boundingBox[2] + (boundingBox[3] - boundingBox[2]) / 2,
  };
}

function addAngleToCenterPointToPoints(center, points) {
  for (let i = 0; i < points.length; i++) {
    points[i].angle = Math.acos((points[i].x - center.x) / lineDistance(center, points[i]));
    if (points[i].y > center.y) {
      points[i].angle = TWO_PI - points[i].angle;
    }
  }
}

function sortPointsByAngleFromCenter(points) {
  points = points.sort((a, b) => a.angle - b.angle);
}

function GameObject() {
  this.x = 0;
  this.y = 0;

  this.setPosition = function (x, y) {
    this.x = x;
    this.y = y;
  };

  this.getViewportOrigin = function () {
    return {
      x: (maxWidth / 2) - (gameBoardSize / 2) + ((gameBoardSize / 2) - mainScene.player.x),
      y: (maxHeight / 2) - (gameBoardSize / 2) + ((gameBoardSize / 2) - mainScene.player.y),
    };
  };

  this.init = noop;
  this.run = noop;
  this.draw = noop;
}

function MovableGameObject() {
  this.speed = 0;
  this.dir = DIRECTION.NONE;
  this.nextDir = DIRECTION.NONE;

  this.goLeft = function () {
    this.nextDir = DIRECTION.LEFT;
  };

  this.goUp = function () {
    this.nextDir = DIRECTION.UP;
  };

  this.goRight = function () {
    this.nextDir = DIRECTION.RIGHT;
  };

  this.goDown = function () {
    this.nextDir = DIRECTION.DOWN;
  };
}

function GameBackground() {
  this.draw = function () {
    background(colors.carolinablue);
  };
}

function GameBoard() {
  this.draw = function () {
    const { x, y } = this.getViewportOrigin();
    fill(colors.whitesmoke);
    rect(x, y, gameBoardSize, gameBoardSize);
  };
}

function Player() {
  this.radius = 10;
  this.speed = 1;
  this.dir = DIRECTION.NONE;
  this.color = randomGoldenRatioColor();
  this.territory = [];
  this.territories = [];
  this.territoryColor = [];
  this.tail = [];
  this.wasInsideTerritory = true;

  this.init = function (x, y) {
    this.setPosition(x, y);
    this.dir = chooseRandomDirection();
    this.createInitialTerritory();
  };

  this.createInitialTerritory = function () {
    this.territory = [
      { x: this.x - (3 * this.radius), y: this.y - (3 * this.radius) },
      { x: this.x + (3 * this.radius), y: this.y - (3 * this.radius) },
      { x: this.x + (3 * this.radius), y: this.y + (3 * this.radius) },
      { x: this.x - (3 * this.radius), y: this.y + (3 * this.radius) },
      // { x: this.x - (3 * this.radius), y: this.y - (3 * this.radius) },
    ];
  };

  this.run = function () {
    this.checkTail();
    this.checkDirection();
    this.move();
  };

  this.draw = function () {
    const { x, y } = this.getViewportOrigin();
    fill(this.color);
    if (this.territory.length) {
      // closePath();
      path(this.territory.map(point => { return { x: x + point.x, y: y + point.y }; }));
      // noClosePath();
    }
    this.territory.forEach(point => {
      fill(colors.black);
      circle(x + point.x, y + point.y, 4);
    });
    // if (this.territories.length) {
    //   this.territories.forEach(function (territory, i) {
    //     fill(this.territoryColor[i]);
    //     closePath();
    //     path(territory.map(point => { return { x: x + point.x, y: y + point.y }; }));
    //     noClosePath();
    //   }.bind(this));
    // }
    fill(colors.red);
    if (this.tail.length) {
      // closePath();
      path(this.tail.map(point => { return { x: x + point.x, y: y + point.y }; }));
      // noClosePath();
    }
    stroke();
    circle(maxWidth / 2, maxHeight / 2, this.radius);
    noStroke();
  };

  this.hasChangedDirection = function () {
    return !(this.nextDir === DIRECTION.NONE || this.nextDir === this.dir);
  };

  this.checkDirection = function () {
    if (!this.hasChangedDirection()) return;
    this.dir = this.nextDir;
    this.nextDir = DIRECTION.NONE;
  };

  this.checkTail = function () {
    if (this.tail.length) {
      if (this.isInsideTerritory()) {
        this.tail.push({ x: this.x, y: this.y }, this.tail[0]);
        // this.territoryColor.push(randomGoldenRatioColor());
        // this.territories.push(this.tail);
        // this.territory = simplify(martinez.union(
        //   this.territory.map(point => [ point.x, point.y ]),
        //   this.tail.map(point => [ point.x, point.y ])
        // ).map(point => { return { x: point[0], y: point[1] }; }));
        console.log('territory.length', this.territory.length);
        console.log('tail.length', this.tail.length);
        var alt = simplify(PolygonTools.polygon.union(
          this.territory.map(point => [ point.x, point.y ]),
          this.tail.map(point => [ point.x, point.y ])
        )[0].map(point => { return { x: point[0], y: point[1] }; }));
        console.log('alt1.length', alt.length);
        if (alt.length < (this.territory.length / 2)) {
          alt = simplify(PolygonTools.polygon.union(
            this.tail.map(point => [ point.x, point.y ]),
            this.territory.map(point => [ point.x, point.y ]),
          )[0].map(point => { return { x: point[0], y: point[1] }; }));
          console.log('alt2.length', alt.length);
        }
        this.territory = alt;
        console.log('BEFORE this.territory', this.territory);
        // const boundingBox = getBoundingBoxFromPoints(this.territory);
        // const center = getCenterOfBoundingBox(boundingBox);
        // addAngleToCenterPointToPoints(center, this.territory);
        // sortPointsByAngleFromCenter(this.territory);
        // console.log('AFTER this.territory', this.territory);
        this.tail = [];
        return;
      }
      const lastPoint = last(this.tail);
      if (lastPoint.x === this.x && lastPoint.y === this.y) return;
    }
    if (!this.isInsideTerritory() && (this.wasInsideTerritory || this.hasChangedDirection())) {
      const previousCoordinate = this.getPreviousCoordinate();
      this.tail.push({
        x: this.wasInsideTerritory ? previousCoordinate.x : this.x,
        y: this.wasInsideTerritory ? previousCoordinate.y : this.y,
      });
      this.wasInsideTerritory = false;
    }
  };

  this.isInsideTerritory = function () {
    const isInsideTerritory = !!isPointInPoly(this.territory, { x: this.x, y: this.y });
    if (isInsideTerritory) this.wasInsideTerritory = true;
    return isInsideTerritory;
  };

  this.getPreviousCoordinate = function () {
    if (this.dir === DIRECTION.NONE) return;
    const prevX = this.x - (this.speed * this.dir);
    const prevY = this.y - (this.speed * (this.dir < 0 ? -1 : 1));
    return {
      x: abs(this.dir) === 1 ? prevX : this.x,
      y: abs(this.dir) === 1 ? this.y : prevY,
    };
  };

  this.move = function () {
    if (this.dir === DIRECTION.NONE) return;
    const newX = this.x + (this.speed * this.dir);
    const newY = this.y + (this.speed * (this.dir < 0 ? -1 : 1));
    if (abs(this.dir) === 1) {
      if (isPointInsideBoundingBox(newX, this.y, 0, gameBoardSize, 0, gameBoardSize)) this.x = newX;
    } else {
      if (isPointInsideBoundingBox(this.x, newY, 0, gameBoardSize, 0, gameBoardSize)) this.y = newY;
    }
  };
}

function Enemy() {
  this.radius = 10;
  this.speed = 4;
  this.dir = DIRECTION.NONE;
  this.color = randomGoldenRatioColor();
  this.territory = [];

  this.init = function (x, y) {
    this.setPosition(x, y);
    this.createInitialTerritory();
  };

  this.createInitialTerritory = function () {
    this.territory.push([
      this.x - (3 * this.radius), // minX
      this.x + (3 * this.radius), // maxX
      this.y - (3 * this.radius), // minY
      this.y + (3 * this.radius), // maxY
    ]);
  };

  this.draw = function () {
    const { x, y } = this.getViewportOrigin();
    fill(this.color);
    this.territory.forEach(area => {
      rect(x + area[0], y + area[2], area[1] - area[0], area[3] - area[2]); // minX, maxX, minY, maxY
    });
    stroke();
    circle(x + this.x, y + this.y, this.radius);
    noStroke();
  };
}

function Scene() {
  this.gameObjects = [];
  this.player = null;

  this.init = function () {
    this.configurePrototypes();
    this.gameObjects.push(new GameBackground());
    this.gameObjects.push(new GameBoard());
    // this.generateEnemy();
    // this.generateEnemy();
    // this.generateEnemy();
    // this.generateEnemy();
    this.generatePlayer();
  };

  this.configurePrototypes = function () {
      MovableGameObject.prototype = new GameObject();
      GameBoard.prototype = new GameObject();
      Player.prototype = new MovableGameObject();
      Enemy.prototype = new MovableGameObject();
  };

  this.generatePlayer = function () {
    this.player = new Player();
    this.player.init(random(0, gameBoardSize), random(0, gameBoardSize));
    this.gameObjects.push(this.player);
  };

  this.generateEnemy = function () {
    const enemy = new Enemy();
    // TODO: Make sure position is a specified distance away from the player and other enemies.
    // Make sure position is inside the game board by a specified distance (based on initial radius of territory).
    enemy.init(random(0, gameBoardSize), random(0, gameBoardSize));
    this.gameObjects.push(enemy);
  };

  this.draw = function () {
    this.gameObjects.forEach(function (obj) {
      obj.run && obj.run();
      obj.draw && obj.draw();
    });
  };
}

var setup = () => {
  fullScreen();
  noStroke();
};

var draw = () => {
  monitorKeys();
  mainScene.draw();
};

function monitorKeys() {
  if (keyCodeList[keys.LEFT] === true || keyCodeList[keys.A] === true) {
    mainScene.player.goLeft();
  }
  if (keyCodeList[keys.UP] === true || keyCodeList[keys.W] === true) {
    mainScene.player.goUp();
  }
  if (keyCodeList[keys.RIGHT] === true || keyCodeList[keys.D] === true) {
    mainScene.player.goRight();
  }
  if (keyCodeList[keys.DOWN] === true || keyCodeList[keys.S] === true) {
    mainScene.player.goDown();
  }
}

var mainScene = new Scene();
mainScene.init();
