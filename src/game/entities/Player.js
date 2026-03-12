import Phaser from 'phaser';

const PLAYER_SPEED = 200;

// Player handles movement input and represents the controllable character.
export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'player');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    this.setDepth(2);
    this.body.setSize(24, 28);
    this.body.setOffset(12, 18);

    // Register WASD controls
    this.controls = scene.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });

    // Create animations if they don’t already exist
    const anims = scene.anims;
    if (!anims.get('walk-down')) {
      anims.create({
        key: 'walk-down',
        frames: anims.generateFrameNumbers('player', { start: 0, end: 5 }),
        frameRate: 8,
        repeat: -1,
      });
      anims.create({
        key: 'walk-left',
        frames: anims.generateFrameNumbers('player', { start: 6, end: 11 }),
        frameRate: 8,
        repeat: -1,
      });
      anims.create({
        key: 'walk-right',
        frames: anims.generateFrameNumbers('player', { start: 12, end: 17 }),
        frameRate: 8,
        repeat: -1,
      });
      anims.create({
        key: 'walk-up',
        frames: anims.generateFrameNumbers('player', { start: 18, end: 23 }),
        frameRate: 8,
        repeat: -1,
      });
    }
  }

  update(isTypingInForm = false) {
    // If the user is typing in a form, lock movement.
    if (isTypingInForm) {
      this.setVelocity(0, 0);
      this.anims.stop();
      return;
    }

    // Build a movement vector based on controls
    const velocity = new Phaser.Math.Vector2(0, 0);
    if (this.controls.left.isDown) velocity.x -= 1;
    if (this.controls.right.isDown) velocity.x += 1;
    if (this.controls.up.isDown) velocity.y -= 1;
    if (this.controls.down.isDown) velocity.y += 1;

    // Only normalize and scale when there is movement, otherwise leave velocity at (0,0)
    if (velocity.length() > 0) {
      velocity.normalize().scale(PLAYER_SPEED);
    }

    // Apply the velocity to the physics body
    this.setVelocity(velocity.x, velocity.y);

    // Play the appropriate walking animation or stop when idle
    if (velocity.x !== 0 || velocity.y !== 0) {
      if (Math.abs(velocity.x) > Math.abs(velocity.y)) {
        this.anims.play(velocity.x > 0 ? 'walk-right' : 'walk-left', true);
      } else {
        this.anims.play(velocity.y > 0 ? 'walk-down' : 'walk-up', true);
      }
    } else {
      this.anims.stop();
    }
  }
}
