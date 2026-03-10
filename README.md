# PixelQuest Prototype

React + Phaser 3 prototype where React renders the overlay UI and Phaser runs gameplay.

## Tech split
- **React:** app shell + quest panel overlay UI
- **Phaser 3:** `HubScene` + `PEWingScene`, player movement, camera follow, collisions

## Project structure

```text
src/
  game/
    createGame.js
    scenes/
      HubScene.js
      PEWingScene.js
    entities/
      Player.js
  ui/
    QuestPanel.jsx
```

## Run locally

```bash
npm install
npm run dev
```
