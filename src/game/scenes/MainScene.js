import Phaser from 'phaser';
import { Player } from '../entities/Player';

export class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene');
  }

  create() {
    this.createPlaceholderTextures();

    const map = this.createPlaceholderMap();
    const tileset = map.addTilesetImage('tiles', 'tiles', 32, 32, 0, 0, 1);
    const layer = map.createLayer(0, tileset, 0, 0);

    layer.setCollision(1);

    this.player = new Player(this, 64, 64);
    this.physics.add.collider(this.player, layer);

    this.cameras.main.startFollow(this.player, true, 0.15, 0.15);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
  }

  update() {
    this.player?.update();
  }

  createPlaceholderTextures() {
    const tileAtlas = this.textures.createCanvas('tiles', 64, 32);
    const context = tileAtlas.getContext();

    context.fillStyle = '#567d46';
    context.fillRect(0, 0, 32, 32);

    context.fillStyle = '#3b2e2a';
    context.fillRect(32, 0, 32, 32);

    tileAtlas.refresh();

    const player = this.make.graphics({ x: 0, y: 0, add: false });
    player.fillStyle(0x2e95ff, 1);
    player.fillRect(0, 0, 24, 28);
    player.generateTexture('player', 24, 28);
    player.destroy();
  }

  createPlaceholderMap() {
    const mapData = Array.from({ length: 30 }, (_, y) =>
      Array.from({ length: 40 }, (_, x) => {
        const borderTile = x === 0 || y === 0 || x === 39 || y === 29;
        const obstacleTile = x % 11 === 0 && y > 3 && y < 26;
        return borderTile || obstacleTile ? 1 : 0;
      })
    );

    return this.make.tilemap({
      data: mapData,
      tileWidth: 32,
      tileHeight: 32,
    });
  }
}
