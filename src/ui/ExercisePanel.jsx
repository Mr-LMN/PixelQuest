import React, { useEffect, useRef, useState } from 'react';
import { PROTOTYPE_TEACHER } from '../config/teacherVerification';

const EXERCISE_TYPES = ['squat', 'pushup', 'bike', 'treadmill', 'rower', 'skipping', 'burpee'];

// ExercisePanel allows teachers to manually log verified exercise efforts during boss fights.
const ExercisePanel = ({ isBossFightActive, onSubmitExercise, exercise, onFormFocusChange }) => {
  const [formState, setFormState] = useState({
    type: EXERCISE_TYPES[0],
    reps: '',
    weightKg: '',
    kcal: '',
    verificationCode: '',
  });
  const [error, setError] = useState('');
  const formRef = useRef(null);

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

  const handleFocus = () => {
    // Keep Phaser keyboard gameplay input disabled while the user is typing in this form.
    onFormFocusChange?.(true);
  };

  const handleBlur = (event) => {
    const nextFocusedElement = event.relatedTarget;
    const isStillInForm = formRef.current?.contains(nextFocusedElement);
    onFormFocusChange?.(Boolean(isStillInForm));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const reps = Number(formState.reps) || 0;
    const weightKg = Number(formState.weightKg) || 0;
    const kcal = Number(formState.kcal) || 0;

    if (reps <= 0 && weightKg <= 0 && kcal <= 0) {
      setError('Enter at least one value above zero for reps, weight, or kcal.');
      return;
    }

    const enteredCode = formState.verificationCode.trim();
    if (!enteredCode) {
      setError('Teacher verification code is required.');
      return;
    }

    if (enteredCode !== PROTOTYPE_TEACHER.code) {
      setError('Invalid verification code');
      return;
    }

    setError('');
    onSubmitExercise?.({
      type: formState.type,
      reps,
      weightKg,
      kcal,
      verifierName: PROTOTYPE_TEACHER.name,
      verificationCode: enteredCode,
    });

    setFormState((previous) => ({
      ...previous,
      reps: '',
      weightKg: '',
      kcal: '',
      verificationCode: '',
    }));
  };

  return (
    <article className="ui-panel">
      <h2>Teacher Exercise Log</h2>
      <form className="exercise-form" onSubmit={handleSubmit} ref={formRef}>
        <label>
          Exercise Type
          <select name="type" value={formState.type} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur}>
            {EXERCISE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>

        <label>
          Reps
          <input
            name="reps"
            type="number"
            min="0"
            value={formState.reps}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </label>

        <label>
          Weight (kg)
          <input
            name="weightKg"
            type="number"
            min="0"
            value={formState.weightKg}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </label>

        <label>
          kcal
          <input
            name="kcal"
            type="number"
            min="0"
            value={formState.kcal}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </label>

        <h3>Teacher Verification</h3>
        <p>
          Verified by: {PROTOTYPE_TEACHER.name}
        </p>

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
          Log Exercise
        </button>
      </form>
      <p>Keyboard-first prototype: teacher verification is required before exercise damage is applied.</p>
      {exercise?.combatLogMessage ? <p>{exercise.combatLogMessage}</p> : null}
      {exercise?.lastLoggedExercise ? (
        <p>
          Last: {exercise.lastLoggedExercise.type} by {exercise.lastLoggedExercise.verifierName}
        </p>
      ) : null}
    </article>
  );
};

export default ExercisePanel;
