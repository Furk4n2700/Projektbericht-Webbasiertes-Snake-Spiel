export class SnakeGame {
  constructor({ gridSize = 20, speed = 150, onUpdate, onStateChange }) {
    this.gridSize = gridSize;
    this.speed = speed;
    this.onUpdate = onUpdate;
    this.onStateChange = onStateChange;
    this.timerId = null;
    this.reset();
  }

  reset() {
    const center = Math.floor(this.gridSize / 2);
    this.snake = [
      { x: center, y: center },
      { x: center - 1, y: center },
      { x: center - 2, y: center }
    ];
    this.direction = { x: 1, y: 0 };
    this.nextDirection = { x: 1, y: 0 };
    this.score = 0;
    this.gameOver = false;
    this.running = false;
    this.food = this.createFood();
    this.emitUpdate();
    this.emitState("ready");
  }

  configure({ gridSize, speed }) {
    const sizeChanged = typeof gridSize === "number" && gridSize !== this.gridSize;
    if (typeof gridSize === "number") {
      this.gridSize = gridSize;
    }
    if (typeof speed === "number") {
      this.speed = speed;
    }
    if (sizeChanged) {
      this.stop();
    }
    this.reset();
  }

  start() {
    if (this.running || this.gameOver) {
      return;
    }
    this.running = true;
    this.emitState("running");
    this.runLoop();
  }

  stop() {
    if (this.timerId) {
      window.clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.running = false;
  }

  setDirection(direction) {
    const reversed =
      direction.x === -this.direction.x && direction.y === -this.direction.y;
    if (!reversed) {
      this.nextDirection = direction;
    }
  }

  handleInput(direction) {
    this.setDirection(direction);
    if (!this.running && !this.gameOver) {
      this.start();
    }
  }

  runLoop() {
    if (!this.running) {
      return;
    }

    this.step();

    if (this.running) {
      this.timerId = window.setTimeout(() => this.runLoop(), this.speed);
    }
  }

  step() {
    this.direction = this.nextDirection;
    const nextHead = {
      x: this.snake[0].x + this.direction.x,
      y: this.snake[0].y + this.direction.y
    };
    const isEating = nextHead.x === this.food.x && nextHead.y === this.food.y;

    if (this.isWallCollision(nextHead) || this.isSelfCollision(nextHead, isEating)) {
      this.gameOver = true;
      this.stop();
      this.emitUpdate();
      this.emitState("gameover");
      return;
    }

    this.snake.unshift(nextHead);

    if (isEating) {
      this.score += 1;
      this.food = this.createFood();
    } else {
      this.snake.pop();
    }

    this.emitUpdate();
  }

  isWallCollision(position) {
    return (
      position.x < 0 ||
      position.y < 0 ||
      position.x >= this.gridSize ||
      position.y >= this.gridSize
    );
  }

  isSelfCollision(position, isEating) {
    const segmentsToCheck = isEating ? this.snake : this.snake.slice(0, -1);
    return segmentsToCheck.some(
      (segment) => segment.x === position.x && segment.y === position.y
    );
  }

  createFood() {
    const availableCells = [];
    for (let y = 0; y < this.gridSize; y += 1) {
      for (let x = 0; x < this.gridSize; x += 1) {
        const occupied = this.snake.some((segment) => segment.x === x && segment.y === y);
        if (!occupied) {
          availableCells.push({ x, y });
        }
      }
    }

    if (availableCells.length === 0) {
      return this.snake[0];
    }

    const randomIndex = Math.floor(Math.random() * availableCells.length);
    return availableCells[randomIndex];
  }

  emitUpdate() {
    this.onUpdate?.({
      gridSize: this.gridSize,
      snake: this.snake,
      food: this.food,
      score: this.score,
      running: this.running,
      gameOver: this.gameOver
    });
  }

  emitState(state) {
    this.onStateChange?.(state, {
      score: this.score,
      speed: this.speed,
      gridSize: this.gridSize
    });
  }
}
