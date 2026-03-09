const MIN_DAMAGE = 5;

const STRENGTH_EXERCISES = new Set(['squat', 'pushup']);
const CARDIO_EXERCISES = new Set(['bike', 'treadmill', 'rower', 'skipping']);
const POWER_EXERCISES = new Set(['burpee']);

const PLAYER_STATS = {
  strength: 1,
  cardio: 1,
  power: 1,
};

// CombatSystem converts teacher-entered exercises into category-based boss damage.
export class CombatSystem {
  constructor(scene, player, boss) {
    this.scene = scene;
    this.player = player;
    this.boss = boss;
    this.repCount = 0;
    this.inRange = false;
    this.exerciseLogs = [];
    this.lastCombatLogMessage = null;
  }

  update() {
    if (!this.player || !this.boss || this.boss.isDefeated()) return;
  }

  getStrengthMultiplier(weightKg) {
    if (weightKg <= 0) return 1;
    if (weightKg <= 10) return 1.2;
    if (weightKg <= 20) return 1.5;
    if (weightKg <= 40) return 2;
    return 2.5;
  }

  getIntensityMultiplier(intensity) {
    const intensityMultipliers = {
      low: 1,
      medium: 1.25,
      high: 1.5,
    };

    return intensityMultipliers[intensity] ?? 1;
  }

  getExerciseCategory(exerciseType) {
    if (STRENGTH_EXERCISES.has(exerciseType)) return 'strength';
    if (CARDIO_EXERCISES.has(exerciseType)) return 'cardio';
    if (POWER_EXERCISES.has(exerciseType)) return 'power';
    return 'strength';
  }

  getCategoryMultiplier(category) {
    if (!this.boss) return 1;
    if (this.boss.weakness === category) return 1.5;
    if (this.boss.resistance === category) return 0.5;
    return 1;
  }

  logExercise(exerciseInput) {
    if (!this.boss || this.boss.isDefeated()) return 'The boss is already defeated.';

    const reps = Number(exerciseInput.reps) || 0;
    const weightKg = Number(exerciseInput.weightKg) || 0;
    const kcal = Number(exerciseInput.kcal) || 0;
    const type = exerciseInput.type;

    const category = this.getExerciseCategory(type);
    const categoryMultiplier = this.getCategoryMultiplier(category);

    let baseDamage = 0;
    let critTriggered = false;

    if (category === 'strength') {
      const strengthMultiplier = this.getStrengthMultiplier(weightKg);
      baseDamage = reps * strengthMultiplier * PLAYER_STATS.strength;
    }

    if (category === 'cardio') {
      const intensityMultiplier = this.getIntensityMultiplier(exerciseInput.intensity);
      baseDamage = kcal * intensityMultiplier * PLAYER_STATS.cardio;
    }

    if (category === 'power') {
      baseDamage = reps * PLAYER_STATS.power;
      critTriggered = Math.random() < 0.2;
      if (critTriggered) baseDamage *= 2;
    }

    const damage = Math.max(MIN_DAMAGE, Math.round(baseDamage * categoryMultiplier));

    this.exerciseLogs.push({
      ...exerciseInput,
      category,
      critTriggered,
      damage,
    });

    this.repCount += reps;
    this.boss.takeDamage(damage);

    const critText = critTriggered ? ' CRITICAL HIT! ' : ' ';
    const effectivenessText =
      categoryMultiplier > 1
        ? "It's super effective!"
        : categoryMultiplier < 1
          ? "It's not very effective..."
          : '';

    this.lastCombatLogMessage = `${type.toUpperCase()} dealt ${damage} damage.${critText}${effectivenessText}`.trim();

    return this.lastCombatLogMessage;
  }
}
