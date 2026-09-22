# Word Castle

A cheerful Norwegian-to-English vocabulary game with a Nynorsk interface, built with Vue's Options API, JavaScript and Vite.

## Run locally

Use Node.js 22 or newer.

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. Run `npm test` for game logic checks, `npm run build` for production, and `npm run preview` to preview that build.

## How it works

- The first visit opens the word workshop with ten word-pair rows. Blank rows are ignored; add more rows when needed. At least one complete pair is required.
- Click the weekly collection on the home screen to open a read-only study dialog with Norwegian words and English answers.
- Each new collection becomes the active homework batch. All previous collections remain available for editing. Editing an older collection does not make it the latest one.
- Separate acceptable English answers with semicolons. Case and extra whitespace do not matter; spelling does.
- Each round starts gently: the first zombie enters after 30 seconds, zombies take 60 seconds to reach the castle, and the initial spawn interval is 30 seconds. Three consecutive early hits (before 35% of the walk) without mistakes shorten both timings by one second, down to 20 seconds of walking and 5 seconds between spawns. Hits at 65% or later, or after two mistakes, ease both timings by one second toward the starting values. Speed changes preserve enemy positions. Boss timing stays at 25 seconds. Multiple zombies can approach together; reaching the castle ends the round.
- The Norwegian prompt sits above the cannon. Correct English answers become cannonballs and hit the nearest zombie. Each defeated zombie earns 100 persistent points, including the boss once defeated. Zombies cleared during the phase transition do not earn points. If the last zombie is hit, a replacement enters immediately. Scheduled spawns follow the adaptive interval. Replacements stop when weekly practice ends or the boss fight begins.
- The first mistake gives encouragement; the second reveals a prominent answer beside the input. Zombies keep moving. Hinted answers still earn 100 points.
- Every word must be answered correctly three times. Completing the weekly words clears remaining zombies and triggers four seconds of confetti before a single large boss arrives. The boss takes three hits and uses words from older collections, falling back to the current collection when needed. It has 25 seconds of walking time; movement pauses during cannonball flights. The first two hits trigger the boss-hit recording and an “Uff og huff!” speech bubble; the final hit triggers a comic howl and victory. Retry resets practice progress only. Total points persist in LocalStorage under `word-castle.total-score` across rounds, losses, cancellations and reloads.
- Cannon shots use locally generated Web Audio effects. Normal hits use a random recording from `src/sounds/ouch/`. No synthetic speech is used. Supported recordings (`.mp3`, `.wav`, `.ogg`, `.m4a`) in that folder are included automatically by Vite and preloaded when a round starts. Only the first two boss impacts play `src/sounds/boss/boss-hit.mp3`; it keeps its “Uff og huff!” speech bubble and distinct final death howl. Each zombie entrance (initial, timed, replacement, or boss) plays a random recording from `src/sounds/spawn/`. Victory adds a short fanfare and confetti pops; game over plays a short descending cartoon wah-wah. The sound toggle persists across rounds; pausing or leaving the game stops audio.
- Pause is available at any time. Switching away from the browser tab automatically pauses the game.
- Vocabulary persists in LocalStorage under `word-castle.v1`. Round progress is kept in memory; leaving the game or refreshing starts a new round. Collections belong to the current browser and origin. Clearing browser data removes them.

## Project structure

- `src/views/`: word workshop and game screen orchestration.
- `src/components/vocabulary/`: editable batch form.
- `src/components/game/`: scene, score/progress display, answer form and result screen.
- `src/game/castleGame.js`: answer matching, word selection and tuning constants.
- `src/services/vocabularyStorage.js`: saved vocabulary validation and persistence.
- `src/styles/main.css`: shared styling and responsive layouts.
- `src/App.vue`: navigation, collection state and home screen.

Vue components exclusively use the Options API. There is no TypeScript, state library or router. To change zombie speed and spawn timing, adjust `APPROACH_SECONDS` and `SPAWN_SECONDS` in `src/game/castleGame.js`.

## GitHub Pages

The Vite configuration uses a relative asset base so production files work at a repository subpath. No history-routing rewrite is needed.

When ready to deploy, build with `npm ci && npm run build`, then publish the contents of `dist/` using a GitHub Pages deployment workflow. In repository Settings → Pages, choose GitHub Actions as the source. Use the official Pages configure, upload-artifact (with `path: dist`) and deploy actions. Deployment is not configured or performed yet.

Fonts load from Google Fonts, with local sans-serif fallbacks. Scene artwork uses native emoji and CSS; emoji appearance varies by device. The app itself has no backend and does not send vocabulary to a server.
