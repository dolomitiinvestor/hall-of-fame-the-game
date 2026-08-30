// LocalStorage persistence. This is the only module that talks to
// localStorage, so swapping in a backend/multiplayer sync layer later
// means replacing this file, not hunting through the app.

const STORAGE_KEY = "dynastyHOF.v1.state";

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn("Failed to save state:", err);
  }
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.warn("Failed to load state:", err);
    return null;
  }
}

export function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn("Failed to clear state:", err);
  }
}
