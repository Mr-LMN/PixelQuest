import Phaser from 'phaser';
import { HubScene } from './scenes/HubScene';
import { PEWingScene } from './scenes/PEWingScene';

// createGame builds and returns the Phaser game instance used by React.
export const createGame = (parent, uiHooks = {}) =>
  new Phaser.Game({
    type: Phaser.AUTO,
    width: 960,
    height: 640,
    parent,
    backgroundColor: '#1b1f2a',
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 0 },
        debug: false,
      },
    },
    scene: [new HubScene({ uiHooks }), new PEWingScene({ uiHooks })],
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
  });
