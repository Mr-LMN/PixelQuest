// QuestPanel renders the active quest list provided by game state.
const QuestPanel = ({ quests }) => {
  return (
    <article className="ui-panel">
      <h2>Active Quests</h2>
      <ul>
        {quests.map((quest) => (
          <li key={quest}>{quest}</li>
        ))}
      </ul>
    </article>
  );
};

export default QuestPanel;
