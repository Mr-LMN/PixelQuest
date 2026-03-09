const MIN_DAMAGE = 5;
const RAW_STAT_CAP = 20;

const STRENGTH_EXERCISES = new Set(['squat', 'pushup']);
const CARDIO_EXERCISES = new Set(['bike', 'treadmill', 'rower', 'skipping']);
const POWER_EXERCISES = new Set(['burpee']);

const PLAYER_STATS = {
  strengthStat: 5,
  cardioStat: 5,
  powerStat: 1,
  recoveryStat: 1,
};

// CombatSystem converts teacher-entered exercises into attribute-scaled boss damage.
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

  getWeightFactor(weightKg) {
    if (weightKg <= 0) return 1;
    if (weightKg <= 10) return 1.25;
    if (weightKg <= 20) return 1.5;
    if (weightKg <= 30) return 1.75;
    if (weightKg <= 40) return 2;
    return 2.25;
  }

  getAttributeMultiplier(rawStat) {
    const cappedStat = Math.max(0, Math.min(rawStat, RAW_STAT_CAP));

    // Prototype scaling: convert raw stat (0-20) to a clean 1.0x-2.0x multiplier.
    return 1 + cappedStat / RAW_STAT_CAP;
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

    const strengthMultiplier = this.getAttributeMultiplier(PLAYER_STATS.strengthStat);
    const cardioMultiplier = this.getAttributeMultiplier(PLAYER_STATS.cardioStat);
    const powerMultiplier = this.getAttributeMultiplier(PLAYER_STATS.powerStat);

    let baseDamage = 0;
    let critTriggered = false;

    if (category === 'strength') {
      baseDamage = reps * this.getWeightFactor(weightKg) * strengthMultiplier;
    }

    if (category === 'cardio') {
      baseDamage = kcal * cardioMultiplier;
    }

    if (category === 'power') {
      baseDamage = reps * 1.5 * powerMultiplier;
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
