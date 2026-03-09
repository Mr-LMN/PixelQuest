import { useState } from 'react';

const EXERCISE_TYPES = ['squat', 'pushup', 'bike', 'treadmill', 'rower', 'skipping', 'burpee'];
const INTENSITY_OPTIONS = ['low', 'medium', 'high'];

// ExercisePanel allows teachers to manually log verified exercise efforts during boss fights.
const ExercisePanel = ({ isBossFightActive, onSubmitExercise, exercise }) => {
  const [formState, setFormState] = useState({
    type: EXERCISE_TYPES[0],
    reps: '',
    weightKg: '',
    kcal: '',
    intensity: INTENSITY_OPTIONS[0],
    verifierName: '',
    verificationCode: '',
  });
  const [error, setError] = useState('');

  if (!isBossFightActive) return null;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((previous) => ({ ...previous, [name]: value }));
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

    if (!formState.verifierName.trim() || !formState.verificationCode.trim()) {
      setError('Teacher name and verification code are required.');
      return;
    }

    setError('');
    onSubmitExercise?.({
      type: formState.type,
      reps,
      weightKg,
      kcal,
      intensity: formState.intensity,
      verifierName: formState.verifierName.trim(),
      verificationCode: formState.verificationCode.trim().toUpperCase(),
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
      <form className="exercise-form" onSubmit={handleSubmit}>
        <label>
          Exercise Type
          <select name="type" value={formState.type} onChange={handleChange}>
            {EXERCISE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>

        <label>
          Reps
          <input name="reps" type="number" min="0" value={formState.reps} onChange={handleChange} />
        </label>

        <label>
          Weight (kg)
          <input name="weightKg" type="number" min="0" value={formState.weightKg} onChange={handleChange} />
        </label>

        <label>
          kcal
          <input name="kcal" type="number" min="0" value={formState.kcal} onChange={handleChange} />
        </label>

        <label>
          Intensity
          <select name="intensity" value={formState.intensity} onChange={handleChange}>
            {INTENSITY_OPTIONS.map((intensity) => (
              <option key={intensity} value={intensity}>
                {intensity}
              </option>
            ))}
          </select>
        </label>

        <label>
          Verifying Teacher
          <input
            name="verifierName"
            type="text"
            value={formState.verifierName}
            onChange={handleChange}
            placeholder="e.g. Mr Martin"
            autoComplete="off"
          />
        </label>

        <label>
          Verification Code
          <input
            name="verificationCode"
            type="text"
            value={formState.verificationCode}
            onChange={handleChange}
            placeholder="e.g. PE-101"
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
          Last: {exercise.lastLoggedExercise.type} ({exercise.lastLoggedExercise.intensity}) by{' '}
          {exercise.lastLoggedExercise.verifierName}
        </p>
      ) : null}
    </article>
  );
};

export default ExercisePanel;
