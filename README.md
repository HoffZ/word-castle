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
- Each new collection becomes the active homework batch. All previous collections remain available for editing. Editing an older collection does not make it the latest one.
- Separate acceptable English answers with semicolons. Case and extra whitespace do not matter; spelling does.
- Zombies spawn immediately and then every 10 seconds. Each takes 20 seconds to reach the castle. Multiple zombies can approach together; reaching the castle ends the round.
- The Norwegian prompt sits above the cannon. Correct English answers become cannonballs and hit the nearest zombie. Each defeated zombie earns 100 persistent points, including the boss once defeated. Zombies cleared during the phase transition do not earn points. If the battlefield is empty, the next prompt waits for the scheduled spawn.
- The first mistake gives encouragement; the second reveals a prominent answer beside the input. Zombies keep moving. Hinted answers still earn 100 points.
- Every word must be answered correctly three times. Completing the weekly words clears remaining zombies and triggers four seconds of confetti before a single large boss arrives. The boss takes three hits and uses words from older collections, falling back to the current collection when needed. It has 20 seconds of walking time; movement pauses during cannonball flights. The first two hits trigger “Uff og huff!” (with a speech bubble and an audio fallback); the final hit triggers a comic howl and victory. Retry resets practice progress only. Total points persist in LocalStorage under `word-castle.total-score` across rounds, losses, cancellations and reloads.
- Cannon shots use locally generated Web Audio effects. Hits use a random silly Norwegian reaction when an on-device Norwegian speech voice is available, otherwise a synthesized cartoon yelp. Victory adds a short fanfare and confetti pops; game over plays a short descending cartoon wah-wah. The sound toggle persists across rounds; pausing or leaving the game stops audio.
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
