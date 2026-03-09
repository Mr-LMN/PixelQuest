import Phaser from 'phaser';

const PLAYER_SPEED = 200;

export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'player');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    this.body.setSize(24, 28);

    this.controls = scene.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });
  }

  update() {
    const velocity = new Phaser.Math.Vector2(0, 0);

    if (this.controls.left.isDown) velocity.x -= 1;
    if (this.controls.right.isDown) velocity.x += 1;
    if (this.controls.up.isDown) velocity.y -= 1;
    if (this.controls.down.isDown) velocity.y += 1;

    velocity.normalize().scale(PLAYER_SPEED);
    this.setVelocity(velocity.x, velocity.y);
  }
}
