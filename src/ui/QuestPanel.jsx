const quests = [
  'Explore the ruins to the east',
  'Collect 3 crystal shards',
  'Return to the village elder',
];

const QuestPanel = () => {
  return (
    <aside className="quest-panel">
      <h2>Active Quests</h2>
      <ul>
        {quests.map((quest) => (
          <li key={quest}>{quest}</li>
        ))}
      </ul>
    </aside>
  );
};

export default QuestPanel;
