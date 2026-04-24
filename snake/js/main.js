import { SnakeGame } from "./game.js";
import { loadHighscore, saveHighscore } from "./storage.js";

const boardElement = document.querySelector("#game-board");
const overlayElement = document.querySelector("#overlay");
const overlayTitleElement = document.querySelector("#overlay-title");
const overlayTextElement = document.querySelector("#overlay-text");
const scoreElement = document.querySelector("#score");
const highscoreElement = document.querySelector("#highscore");
const statusElement = document.querySelector("#status");
const gridSizeElement = document.querySelector("#grid-size");
const speedElement = document.querySelector("#speed");
const startButton = document.querySelector("#start-button");
const restartButton = document.querySelector("#restart-button");

let highscore = loadHighscore();
highscoreElement.textContent = String(highscore);

function renderBoard({ gridSize, snake, food }) {
  boardElement.innerHTML = "";
  boardElement.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
  boardElement.style.gridTemplateRows = `repeat(${gridSize}, 1fr)`;

  const snakePositions = new Map(
    snake.map((segment, index) => [`${segment.x}-${segment.y}`, index === 0 ? "head" : "snake"])
  );
  const foodKey = `${food.x}-${food.y}`;

  for (let y = 0; y < gridSize; y += 1) {
    for (let x = 0; x < gridSize; x += 1) {
      const cell = document.createElement("div");
      const key = `${x}-${y}`;
      cell.className = "cell";

      if (snakePositions.has(key)) {
        cell.classList.add(snakePositions.get(key));
      } else if (key === foodKey) {
        cell.classList.add("food");
      }

      boardElement.appendChild(cell);
    }
  }
}

function updateOverlay(title, text, visible) {
  overlayTitleElement.textContent = title;
  overlayTextElement.textContent = text;
  overlayElement.classList.toggle("hidden", !visible);
}

function updateStatus(state) {
  const labels = {
    ready: "Bereit",
    running: "Läuft",
    gameover: "Spiel beendet"
  };
  statusElement.textContent = labels[state] ?? "Bereit";
}

const game = new SnakeGame({
  gridSize: Number.parseInt(gridSizeElement.value, 10),
  speed: Number.parseInt(speedElement.value, 10),
  onUpdate: ({ score, ...gameState }) => {
    scoreElement.textContent = String(score);
    renderBoard(gameState);

    if (score > highscore) {
      highscore = score;
      saveHighscore(highscore);
      highscoreElement.textContent = String(highscore);
    }
  },
  onStateChange: (state) => {
    updateStatus(state);

    if (state === "ready") {
      updateOverlay("Snake starten", "Drücke Start oder eine Pfeiltaste, um zu beginnen.", true);
    }

    if (state === "running") {
      updateOverlay("", "", false);
    }

    if (state === "gameover") {
      updateOverlay("Spiel vorbei", "Starte neu und versuche, deinen Highscore zu schlagen.", true);
    }
  }
});

const directions = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  w: { x: 0, y: -1 },
  s: { x: 0, y: 1 },
  a: { x: -1, y: 0 },
  d: { x: 1, y: 0 }
};

document.addEventListener("keydown", (event) => {
  const direction = directions[event.key];
  if (!direction) {
    return;
  }

  event.preventDefault();
  game.handleInput(direction);
});

function restartWithCurrentSettings() {
  game.stop();
  game.configure({
    gridSize: Number.parseInt(gridSizeElement.value, 10),
    speed: Number.parseInt(speedElement.value, 10)
  });
}

startButton.addEventListener("click", () => {
  game.start();
});

restartButton.addEventListener("click", () => {
  restartWithCurrentSettings();
});

gridSizeElement.addEventListener("change", restartWithCurrentSettings);
speedElement.addEventListener("change", restartWithCurrentSettings);

restartWithCurrentSettings();
