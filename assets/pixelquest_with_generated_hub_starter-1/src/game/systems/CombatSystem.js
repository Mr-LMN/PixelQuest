import { HERO_WORKOUT_BASE_DAMAGE } from '../../config/exercises';

const MIN_DAMAGE = 5;
const RAW_PLAYER_STATS = {
  strengthStat: 5,
  cardioStat: 5,
  powerStat: 1,
  recoveryStat: 1,
};

// CombatSystem receives structured workout payloads and converts them into boss combat outcomes.
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

  getAttributeMultiplier(rawStat) {
    // Attribute multiplier formula: 1 + (rawStat / 20).
    return 1 + (Math.max(0, rawStat) / 20);
  }

  getBossModifier(exercisePayload) {
    if (!this.boss) return { modifier: 1, matchedWeakness: false, matchedResistance: false };

    const { category, bossDamageType } = exercisePayload;
    const weaknessMatch = this.boss.weakness === category || this.boss.weakness === bossDamageType;
    const resistanceMatch = this.boss.resistance === category || this.boss.resistance === bossDamageType;

    if (weaknessMatch) return { modifier: 1.5, matchedWeakness: true, matchedResistance: false };
    if (resistanceMatch) return { modifier: 0.5, matchedWeakness: false, matchedResistance: true };

    return { modifier: 1, matchedWeakness: false, matchedResistance: false };
  }

  calculateDamage(exercisePayload) {
    const strengthMultiplier = this.getAttributeMultiplier(RAW_PLAYER_STATS.strengthStat);
    const cardioMultiplier = this.getAttributeMultiplier(RAW_PLAYER_STATS.cardioStat);
    const powerMultiplier = this.getAttributeMultiplier(RAW_PLAYER_STATS.powerStat);

    // Damage formulas by category/input mode.
    if (exercisePayload.category === 'strength') {
      const effectiveWeight = exercisePayload.weightKg && exercisePayload.weightKg > 0 ? exercisePayload.weightKg : 1;
      const sets = exercisePayload.sets ?? 0;
      const reps = exercisePayload.reps ?? 0;
      const baseDamage = (sets * reps * effectiveWeight) / 10;
      return Math.max(MIN_DAMAGE, Math.round(baseDamage * strengthMultiplier));
    }

    if (exercisePayload.category === 'cardio') {
      const baseDamage =
        exercisePayload.kcal && exercisePayload.kcal > 0
          ? exercisePayload.kcal
          : exercisePayload.distanceKm && exercisePayload.distanceKm > 0
            ? exercisePayload.distanceKm * 20
            : MIN_DAMAGE;
      return Math.max(MIN_DAMAGE, Math.round(baseDamage * cardioMultiplier));
    }

    if (exercisePayload.category === 'conditioning') {
      const reps = exercisePayload.reps ?? 0;
      const baseDamage = reps * 2;
      return Math.max(MIN_DAMAGE, Math.round(baseDamage * powerMultiplier));
    }

    if (exercisePayload.category === 'hero') {
      // Hero workouts are fixed challenge events with predefined base damage.
      const heroBaseDamage = HERO_WORKOUT_BASE_DAMAGE[exercisePayload.exerciseId] ?? 100;
      return Math.max(MIN_DAMAGE, Math.round(heroBaseDamage * 1.2));
    }

    // Recovery workout category is a support action and does not damage bosses yet.
    return 0;
  }

  logExercise(exercisePayload) {
    if (!this.boss || this.boss.isDefeated()) return 'The boss is already defeated.';

    const { modifier, matchedWeakness, matchedResistance } = this.getBossModifier(exercisePayload);
    const unmodifiedDamage = this.calculateDamage(exercisePayload);

    if (exercisePayload.category === 'recovery') {
      const recoveryResult = {
        type: 'recovery',
        performedBy: exercisePayload.verifiedBy,
        durationMinutes: exercisePayload.durationMinutes,
        timestamp: exercisePayload.timestamp,
      };
      console.log('[CombatSystem] Recovery performed:', recoveryResult);

      const recoveryMessage = `${exercisePayload.verifiedBy} verified the workout. Recovery logged. No boss damage dealt.`;
      this.exerciseLogs.push({ ...exercisePayload, damage: 0, recoveryResult, logMessage: recoveryMessage });
      this.lastCombatLogMessage = recoveryMessage;
      return recoveryMessage;
    }

    const finalDamage = Math.max(MIN_DAMAGE, Math.round(unmodifiedDamage * modifier));

    this.exerciseLogs.push({
      ...exercisePayload,
      damage: finalDamage,
      matchedWeakness,
      matchedResistance,
    });

    this.repCount += exercisePayload.reps ?? 0;
    this.boss.takeDamage(finalDamage);

    const messages = [
      `${exercisePayload.verifiedBy} verified the workout.`,
      `${exercisePayload.exerciseName} dealt ${finalDamage} damage.`,
    ];

    if (exercisePayload.category === 'hero') {
      messages.push('Hero Workout completed! Massive damage dealt.');
    }

    if (matchedWeakness) {
      messages.push(`${exercisePayload.exerciseName} was super effective!`);
    }

    if (matchedResistance) {
      messages.push(`${this.boss.name} resisted ${exercisePayload.bossDamageType}.`);
    }

    this.lastCombatLogMessage = messages.join(' ');
    return this.lastCombatLogMessage;
  }
}
