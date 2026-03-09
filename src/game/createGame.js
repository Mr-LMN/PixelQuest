import Phaser from 'phaser';
import { MainScene } from './scenes/MainScene';

export const createGame = (parent) =>
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
    scene: [MainScene],
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
  });
