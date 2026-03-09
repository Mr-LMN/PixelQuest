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
    this.exerciseLogs = [];
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

  logExercise(exerciseInput) {
    if (!this.boss || this.boss.isDefeated()) return;

    const intensityMultiplier = {
      low: 1,
      medium: 1.5,
      high: 2,
    };

    const reps = Number(exerciseInput.reps) || 0;
    const weightKg = Number(exerciseInput.weightKg) || 0;
    const kcal = Number(exerciseInput.kcal) || 0;
    const multiplier = intensityMultiplier[exerciseInput.intensity] ?? 1;
    const baseScore = reps + weightKg * 0.5 + kcal * 0.2;
    const damage = Math.max(1, Math.round(baseScore * multiplier));

    this.exerciseLogs.push({ ...exerciseInput, damage });
    this.repCount += reps;
    this.boss.takeDamage(damage);
  }
}
