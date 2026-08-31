// LocalStorage persistence. This is the only module that talks to
// localStorage, so swapping in a backend/multiplayer sync layer later
// means replacing this file, not hunting through the app.

const STORAGE_KEY = "dynastyHOF.v1.state";
const SPLASH_SEEN_KEY = "dynastyHOF.v1.splashSeen";

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

// Splash-screen "seen" flag lives under its own key, separate from
// league state, so Reset League doesn't bring the splash back.
export function hasSeenSplash() {
  try {
    return localStorage.getItem(SPLASH_SEEN_KEY) === "1";
  } catch (err) {
    console.warn("Failed to read splash-seen flag:", err);
    return true; // fail open: don't block the app on a storage error
  }
}

export function markSplashSeen() {
  try {
    localStorage.setItem(SPLASH_SEEN_KEY, "1");
  } catch (err) {
    console.warn("Failed to save splash-seen flag:", err);
  }
}
