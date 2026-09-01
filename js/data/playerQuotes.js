// Real player quotes, shown on the Games tab next to a player after
// they've played that week -- same infrastructure and pattern as
// js/data/coachQuotes.js (COACH_QUOTES). Empty for now: no player
// quote data has been supplied yet.
//
// Add quotes here keyed by player id (array of real, attributed quote
// strings, like COACH_QUOTES) and they start showing automatically --
// picked deterministically per player-per-week (see playerQuoteFor()
// in js/app.js), no other code changes needed:
//
//   export const PLAYER_QUOTES = {
//     "jerry-rice": ["\"Today I will do what others won't, so tomorrow I can do what others can't.\""],
//   };
export const PLAYER_QUOTES = {};
