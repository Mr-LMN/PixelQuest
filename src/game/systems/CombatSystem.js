import Phaser from 'phaser';

const ATTACK_RANGE = 120;

// CombatSystem converts spacebar presses into boss damage when in range.
export class CombatSystem {
  constructor(scene, player, boss) {
    this.scene = scene;
    this.player = player;
    this.boss = boss;
    this.repCount = 0;
    this.inRange = false;

    this.attackKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  }

  update() {
    if (!this.player || !this.boss || this.boss.isDefeated()) return;

    const distance = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      this.boss.sprite.x,
      this.boss.sprite.y
    );

    this.inRange = distance <= ATTACK_RANGE;

    if (this.inRange && Phaser.Input.Keyboard.JustDown(this.attackKey)) {
      this.repCount += 1;
      this.boss.takeDamage(10);
    }
  }
}
