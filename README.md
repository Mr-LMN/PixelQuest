# PixelQuest Prototype

React + Phaser 3 prototype where React renders the overlay UI and Phaser runs gameplay.

## Tech split
- **React:** app shell + quest panel overlay UI
- **Phaser 3:** `MainScene`, player movement, camera follow, tilemap, collisions

## Project structure

```text
src/
  game/
    createGame.js
    scenes/
      MainScene.js
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
