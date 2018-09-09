
const gameBoardSize = 500;

const DIRECTION = {
  NONE: 0,
  LEFT: -1,
  UP: -2,
  RIGHT: 1,
  DOWN: 2,
};

function isPointInsideBoundingBox(pointX, pointY, minX, maxX, minY, maxY) {
  return minX < pointX && pointX < maxX && minY < pointY && pointY < maxY;
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

  this.goLeft = function () {
    this.dir = DIRECTION.LEFT;
  };

  this.goUp = function () {
    this.dir = DIRECTION.UP;
  };

  this.goRight = function () {
    this.dir = DIRECTION.RIGHT;
  };

  this.goDown = function () {
    this.dir = DIRECTION.DOWN;
  };
}

function GameBackground() {
  this.draw = function () {
    background(colors.carolinablue);
  };
};

function GameBoard() {
  this.draw = function () {
    fill(colors.whitesmoke);
    const { x, y } = this.getViewportOrigin();
    rect(x, y, gameBoardSize, gameBoardSize);
  };
};

function Player() {
  this.radius = 10;
  this.speed = 4;
  this.dir = DIRECTION.NONE;

  // TODO: Have a way to determine (relay / display) direction while playing game.
  // TODO: Create initial base / territory.

  this.init = function (x, y) {
    this.setPosition(x, y);
  };

  this.run = function () {
    this.move();
  };

  this.draw = function () {
    fill(colors.red);
    circle(maxWidth / 2, maxHeight / 2, this.radius);
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
};

function Enemy() {
  this.radius = 10;
  this.speed = 4;
  this.dir = DIRECTION.NONE;
  this.color = randomGoldenRatioColor();

  this.init = function (x, y) {
    this.setPosition(x, y);
  };

  this.draw = function () {
    fill(this.color);
    const { x, y } = this.getViewportOrigin();
    circle(x + this.x, y + this.y, this.radius);
  };
};

function Scene() {
  this.gameObjects = [];
  this.player = null;

  this.init = function () {
    this.configurePrototypes();
    this.gameObjects.push(new GameBackground());
    this.gameObjects.push(new GameBoard());
    this.generateEnemy();
    this.generateEnemy();
    this.generateEnemy();
    this.generateEnemy();
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
};

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
