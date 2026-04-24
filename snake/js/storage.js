const HIGHSCORE_KEY = "snake-highscore";

export function loadHighscore() {
  const saved = Number.parseInt(window.localStorage.getItem(HIGHSCORE_KEY) ?? "0", 10);
  return Number.isFinite(saved) ? saved : 0;
}

export function saveHighscore(score) {
  window.localStorage.setItem(HIGHSCORE_KEY, String(score));
}
