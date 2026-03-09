// ExercisePanel shows placeholder workout progress tied to combat actions.
const ExercisePanel = ({ exercise }) => {
  if (!exercise) return null;

  return (
    <article className="ui-panel">
      <h2>Exercise Trial</h2>
      <p>{exercise.title}</p>
      <p>
        Reps: {exercise.completedReps}/{exercise.repGoal}
      </p>
      <p>Zone: {exercise.zoneName}</p>
    </article>
  );
};

export default ExercisePanel;
