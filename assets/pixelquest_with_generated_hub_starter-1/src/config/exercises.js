// Exercise categories used by the prototype combat pipeline.
export const EXERCISE_CATEGORIES = ['strength', 'cardio', 'conditioning', 'recovery', 'hero'];

// Input modes define which fields the ExercisePanel should render and validate.
export const EXERCISE_INPUT_MODES = [
  'strength_sets_reps_weight',
  'cardio_distance_or_kcal',
  'reps_only',
  'minutes_only',
  'hero_fixed',
];

export const EXERCISES = [
  { id: 'bodyweight_squat', name: 'Bodyweight Squat', category: 'strength', tags: ['lower_body', 'bodyweight'], inputMode: 'strength_sets_reps_weight', bossDamageType: 'strength', enabled: true },
  { id: 'goblet_squat', name: 'Goblet Squat', category: 'strength', tags: ['lower_body', 'free_weight', 'dumbbell'], inputMode: 'strength_sets_reps_weight', bossDamageType: 'strength', enabled: true },
  { id: 'barbell_squat', name: 'Barbell Squat', category: 'strength', tags: ['lower_body', 'free_weight', 'barbell'], inputMode: 'strength_sets_reps_weight', bossDamageType: 'strength', enabled: true },
  { id: 'smith_machine_squat', name: 'Smith Machine Squat', category: 'strength', tags: ['lower_body', 'machine', 'barbell'], inputMode: 'strength_sets_reps_weight', bossDamageType: 'strength', enabled: true },
  { id: 'leg_extension', name: 'Leg Extension', category: 'strength', tags: ['lower_body', 'machine', 'isolation'], inputMode: 'strength_sets_reps_weight', bossDamageType: 'strength', enabled: true },
  { id: 'leg_curl', name: 'Leg Curl', category: 'strength', tags: ['lower_body', 'machine', 'posterior_chain'], inputMode: 'strength_sets_reps_weight', bossDamageType: 'strength', enabled: true },
  { id: 'dumbbell_bench_press', name: 'Dumbbell Bench Press', category: 'strength', tags: ['upper_body', 'free_weight', 'dumbbell'], inputMode: 'strength_sets_reps_weight', bossDamageType: 'strength', enabled: true },
  { id: 'barbell_bench_press', name: 'Barbell Bench Press', category: 'strength', tags: ['upper_body', 'free_weight', 'barbell'], inputMode: 'strength_sets_reps_weight', bossDamageType: 'strength', enabled: true },
  { id: 'cable_row', name: 'Cable Row', category: 'strength', tags: ['upper_body', 'machine', 'pull'], inputMode: 'strength_sets_reps_weight', bossDamageType: 'strength', enabled: true },
  { id: 'lat_pulldown', name: 'Lat Pulldown', category: 'strength', tags: ['upper_body', 'machine', 'pull'], inputMode: 'strength_sets_reps_weight', bossDamageType: 'strength', enabled: true },
  { id: 'kettlebell_swing', name: 'Kettlebell Swing', category: 'strength', tags: ['full_body', 'free_weight', 'kettlebell'], inputMode: 'strength_sets_reps_weight', bossDamageType: 'strength', enabled: true },
  { id: 'sandbag_carry', name: 'Sandbag Carry', category: 'strength', tags: ['full_body', 'functional', 'sandbag'], inputMode: 'strength_sets_reps_weight', bossDamageType: 'strength', enabled: true },
  { id: 'med_ball_slam', name: 'Med Ball Slam', category: 'strength', tags: ['full_body', 'power', 'med_ball'], inputMode: 'strength_sets_reps_weight', bossDamageType: 'strength', enabled: true },

  { id: 'treadmill_run', name: 'Treadmill Run', category: 'cardio', tags: ['machine', 'endurance'], inputMode: 'cardio_distance_or_kcal', bossDamageType: 'cardio', enabled: true },
  { id: 'row_machine', name: 'Row Machine', category: 'cardio', tags: ['machine', 'full_body', 'endurance'], inputMode: 'cardio_distance_or_kcal', bossDamageType: 'cardio', enabled: true },
  { id: 'ski_erg', name: 'Ski Erg', category: 'cardio', tags: ['machine', 'upper_body', 'endurance'], inputMode: 'cardio_distance_or_kcal', bossDamageType: 'cardio', enabled: true },
  { id: 'assault_bike', name: 'Assault Bike', category: 'cardio', tags: ['machine', 'intervals'], inputMode: 'cardio_distance_or_kcal', bossDamageType: 'cardio', enabled: true },
  { id: 'upright_bike', name: 'Upright Bike', category: 'cardio', tags: ['machine', 'endurance'], inputMode: 'cardio_distance_or_kcal', bossDamageType: 'cardio', enabled: true },
  { id: 'cross_trainer', name: 'Cross Trainer', category: 'cardio', tags: ['machine', 'low_impact'], inputMode: 'cardio_distance_or_kcal', bossDamageType: 'cardio', enabled: true },
  { id: 'skipping', name: 'Skipping', category: 'cardio', tags: ['bodyweight', 'coordination', 'conditioning'], inputMode: 'cardio_distance_or_kcal', bossDamageType: 'cardio', enabled: true },

  { id: 'burpee', name: 'Burpee', category: 'conditioning', tags: ['bodyweight', 'full_body'], inputMode: 'reps_only', bossDamageType: 'conditioning', enabled: true },
  { id: 'kettlebell_complex', name: 'Kettlebell Complex', category: 'conditioning', tags: ['full_body', 'kettlebell'], inputMode: 'reps_only', bossDamageType: 'conditioning', enabled: true },
  { id: 'sandbag_circuit', name: 'Sandbag Circuit', category: 'conditioning', tags: ['full_body', 'sandbag'], inputMode: 'reps_only', bossDamageType: 'conditioning', enabled: true },
  { id: 'med_ball_conditioning', name: 'Med Ball Conditioning', category: 'conditioning', tags: ['full_body', 'med_ball'], inputMode: 'reps_only', bossDamageType: 'conditioning', enabled: true },

  { id: 'cooldown_walk', name: 'Cooldown Walk', category: 'recovery', tags: ['low_intensity', 'cardio_recovery'], inputMode: 'minutes_only', bossDamageType: 'recovery', enabled: true },
  { id: 'light_cycle', name: 'Light Cycle', category: 'recovery', tags: ['machine', 'low_intensity'], inputMode: 'minutes_only', bossDamageType: 'recovery', enabled: true },
  { id: 'stretching', name: 'Stretching', category: 'recovery', tags: ['mobility', 'low_intensity'], inputMode: 'minutes_only', bossDamageType: 'recovery', enabled: true },

  {
    id: 'hero_drone_shutdown',
    name: 'Hero Workout: Drone Shutdown',
    category: 'hero',
    tags: ['story', 'challenge', 'fixed'],
    inputMode: 'hero_fixed',
    bossDamageType: 'hero',
    enabled: true,
    challengeDescription: 'Complete the Sports Hall emergency shutdown sequence under pressure.',
  },
  {
    id: 'hero_pe_escape',
    name: 'Hero Workout: PE Escape',
    category: 'hero',
    tags: ['story', 'challenge', 'fixed'],
    inputMode: 'hero_fixed',
    bossDamageType: 'hero',
    enabled: true,
    challengeDescription: 'Complete the PE corridor sprint-escape simulation as a timed challenge.',
  },
  {
    id: 'hero_martin_challenge',
    name: 'Hero Workout: Martin Challenge',
    category: 'hero',
    tags: ['story', 'challenge', 'fixed'],
    inputMode: 'hero_fixed',
    bossDamageType: 'hero',
    enabled: true,
    challengeDescription: 'Finish Mr Martin’s elite gauntlet with strict form and pacing checks.',
  },
];

export const EXERCISES_BY_ID = EXERCISES.reduce((lookup, exercise) => {
  lookup[exercise.id] = exercise;
  return lookup;
}, {});

// Prototype fixed damage table for hero workouts.
export const HERO_WORKOUT_BASE_DAMAGE = {
  hero_drone_shutdown: 120,
  hero_pe_escape: 80,
  hero_martin_challenge: 150,
};
