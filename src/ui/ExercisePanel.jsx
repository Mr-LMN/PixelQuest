import React, { useEffect, useMemo, useRef, useState } from 'react';
import { EXERCISES } from '../config/exercises';
import { PROTOTYPE_TEACHER } from '../config/teacherVerification';

const ENABLED_EXERCISES = EXERCISES.filter((exercise) => exercise.enabled);

const initialFormState = {
  exerciseId: ENABLED_EXERCISES[0]?.id ?? '',
  sets: '',
  reps: '',
  weightKg: '',
  durationMinutes: '',
  distanceKm: '',
  kcal: '',
  verificationCode: '',
};

const toOptionalNumber = (value) => {
  if (value === '' || value === null || value === undefined) return null;
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : null;
};

const ExercisePanel = ({ isBossFightActive, onSubmitExercise, exercise, onFormFocusChange }) => {
  const [formState, setFormState] = useState(initialFormState);
  const [error, setError] = useState('');
  const formRef = useRef(null);

  const selectedExercise = useMemo(
    () => ENABLED_EXERCISES.find((entry) => entry.id === formState.exerciseId) ?? ENABLED_EXERCISES[0],
    [formState.exerciseId]
  );

  useEffect(() => {
    if (!isBossFightActive) {
      onFormFocusChange?.(false);
    }

    return () => onFormFocusChange?.(false);
  }, [isBossFightActive, onFormFocusChange]);

  if (!isBossFightActive) return null;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((previous) => ({ ...previous, [name]: value }));
  };

  const handleExerciseChange = (event) => {
    const nextExerciseId = event.target.value;
    setError('');
    setFormState((previous) => ({
      ...previous,
      exerciseId: nextExerciseId,
      sets: '',
      reps: '',
      weightKg: '',
      durationMinutes: '',
      distanceKm: '',
      kcal: '',
    }));
  };

  const handleFocus = () => {
    onFormFocusChange?.(true);
  };

  const handleBlur = (event) => {
    const nextFocusedElement = event.relatedTarget;
    const isStillInForm = formRef.current?.contains(nextFocusedElement);
    onFormFocusChange?.(Boolean(isStillInForm));
  };

  const validateForm = (exerciseDefinition, payload) => {
    const { inputMode, id } = exerciseDefinition;

    if (inputMode === 'strength_sets_reps_weight') {
      if (!payload.sets || payload.sets <= 0) return 'Sets are required.';
      if (!payload.reps || payload.reps <= 0) return 'Reps are required.';

      const isBodyweightExercise = id === 'bodyweight_squat';
      const hasWeightValue = payload.weightKg !== null;
      if (!isBodyweightExercise && (!hasWeightValue || payload.weightKg <= 0)) {
        return 'Weight (kg) is required for this strength exercise.';
      }
    }

    if (inputMode === 'cardio_distance_or_kcal') {
      const hasDistance = payload.distanceKm !== null && payload.distanceKm > 0;
      const hasKcal = payload.kcal !== null && payload.kcal > 0;
      if (!hasDistance && !hasKcal) {
        return 'Enter at least one cardio value: distance (km) or kcal.';
      }
    }

    if (inputMode === 'reps_only' && (!payload.reps || payload.reps <= 0)) {
      return 'Reps are required.';
    }

    if (inputMode === 'minutes_only' && (!payload.durationMinutes || payload.durationMinutes <= 0)) {
      return 'Duration in minutes is required.';
    }

    return '';
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const enteredCode = formState.verificationCode.trim();
    if (!enteredCode) {
      setError('Teacher verification code is required.');
      return;
    }

    if (enteredCode !== PROTOTYPE_TEACHER.code) {
      setError('Invalid verification code');
      return;
    }

    const payload = {
      exerciseId: selectedExercise.id,
      exerciseName: selectedExercise.name,
      category: selectedExercise.category,
      tags: selectedExercise.tags,
      inputMode: selectedExercise.inputMode,
      bossDamageType: selectedExercise.bossDamageType,
      sets: toOptionalNumber(formState.sets),
      reps: toOptionalNumber(formState.reps),
      weightKg: toOptionalNumber(formState.weightKg),
      durationMinutes: toOptionalNumber(formState.durationMinutes),
      distanceKm: toOptionalNumber(formState.distanceKm),
      kcal: toOptionalNumber(formState.kcal),
      verifiedBy: PROTOTYPE_TEACHER.name,
      verificationMethod: 'teacher_code',
      timestamp: Date.now(),
    };

    const validationError = validateForm(selectedExercise, payload);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    onSubmitExercise?.(payload);

    setFormState((previous) => ({
      ...previous,
      sets: '',
      reps: '',
      weightKg: '',
      durationMinutes: '',
      distanceKm: '',
      kcal: '',
      verificationCode: '',
    }));
  };

  const renderInputFields = () => {
    switch (selectedExercise.inputMode) {
      case 'strength_sets_reps_weight':
        return (
          <>
            <label>
              Sets
              <input name="sets" type="number" min="0" value={formState.sets} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur} />
            </label>
            <label>
              Reps
              <input name="reps" type="number" min="0" value={formState.reps} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur} />
            </label>
            <label>
              Weight (kg)
              <input name="weightKg" type="number" min="0" value={formState.weightKg} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur} />
            </label>
          </>
        );
      case 'cardio_distance_or_kcal':
        return (
          <>
            <label>
              Duration (minutes, optional)
              <input name="durationMinutes" type="number" min="0" value={formState.durationMinutes} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur} />
            </label>
            <label>
              Distance (km, optional)
              <input name="distanceKm" type="number" min="0" step="0.1" value={formState.distanceKm} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur} />
            </label>
            <label>
              kcal (optional)
              <input name="kcal" type="number" min="0" value={formState.kcal} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur} />
            </label>
          </>
        );
      case 'reps_only':
        return (
          <label>
            Reps
            <input name="reps" type="number" min="0" value={formState.reps} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur} />
          </label>
        );
      case 'minutes_only':
        return (
          <label>
            Duration (minutes)
            <input
              name="durationMinutes"
              type="number"
              min="0"
              value={formState.durationMinutes}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
          </label>
        );
      case 'hero_fixed':
        return (
          <div>
            <p>
              {selectedExercise.challengeDescription ??
                'Hero workout uses a fixed challenge payload for this prototype.'}
            </p>
            <p>No freeform numbers are required for hero workouts.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <article className="ui-panel">
      <h2>Teacher Exercise Log</h2>
      <form className="exercise-form" onSubmit={handleSubmit} ref={formRef}>
        <label>
          Exercise
          <select name="exerciseId" value={formState.exerciseId} onChange={handleExerciseChange} onFocus={handleFocus} onBlur={handleBlur}>
            {ENABLED_EXERCISES.map((exerciseOption) => (
              <option key={exerciseOption.id} value={exerciseOption.id}>
                {exerciseOption.name}
              </option>
            ))}
          </select>
        </label>

        {renderInputFields()}

        <h3>Teacher Verification</h3>
        <p>Verified by: {PROTOTYPE_TEACHER.name}</p>

        <label>
          Verification Code
          <input
            name="verificationCode"
            type="text"
            value={formState.verificationCode}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder="Enter teacher code"
            autoComplete="off"
          />
        </label>

        {error ? <p>{error}</p> : null}
        <button className="ui-button" type="submit">
          {selectedExercise.inputMode === 'hero_fixed' ? 'Complete Hero Workout' : 'Log Exercise'}
        </button>
      </form>
      <p>Keyboard-first prototype: teacher verification is required before exercise damage is applied.</p>
      {exercise?.combatLogMessage ? <p>{exercise.combatLogMessage}</p> : null}
      {exercise?.lastLoggedExercise ? (
        <p>
          Last: {exercise.lastLoggedExercise.exerciseName} by {exercise.lastLoggedExercise.verifiedBy}
        </p>
      ) : null}
    </article>
  );
};

export default ExercisePanel;
