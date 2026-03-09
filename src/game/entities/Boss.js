// Boss tracks a simple health pool and exposes helper methods for combat.
export class Boss {
  constructor(scene, x, y) {
    this.scene = scene;
    this.name = 'Iron Titan';
    this.maxHp = 120;
    this.currentHp = 120;

    this.sprite = scene.physics.add.staticImage(x, y, 'boss').setOrigin(0.5, 0.5);
  }

  takeDamage(amount) {
    this.currentHp = Math.max(0, this.currentHp - amount);
  }

  isDefeated() {
    return this.currentHp <= 0;
  }
}
