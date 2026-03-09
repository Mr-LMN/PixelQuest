// Boss tracks a simple health pool and exposes helper methods for combat.
export class Boss {
  constructor(scene, x, y) {
    this.scene = scene;
    this.name = 'Sedentary Security Drone';
    this.maxHp = 150;
    this.currentHp = 150;
    this.weakness = 'cardio';
    this.resistance = 'strength';

    this.sprite = scene.physics.add.staticImage(x, y, 'boss').setOrigin(0.5, 0.5);
  }

  takeDamage(amount) {
    this.currentHp = Math.max(0, this.currentHp - amount);
  }

  isDefeated() {
    return this.currentHp <= 0;
  }

  toUiState(isActive = false) {
    return {
      name: this.name,
      maxHp: this.maxHp,
      currentHp: this.currentHp,
      weakness: this.weakness,
      resistance: this.resistance,
      isActive,
    };
  }
}
