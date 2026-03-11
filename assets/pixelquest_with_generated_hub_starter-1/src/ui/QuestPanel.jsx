import React from 'react';

// QuestPanel renders the active quest list provided by game state.
const QuestPanel = ({ quests }) => {
  return (
    <article className="ui-panel">
      <h2>Active Quests</h2>
      <ul>
        {quests.map((quest) => (
          <li key={quest.id ?? quest}>
            {typeof quest === 'string' ? (
              quest
            ) : (
              <>
                <strong>{quest.title}</strong>
                <div>{quest.objective}</div>
                {quest.completed ? <em>Completed</em> : null}
              </>
            )}
          </li>
        ))}
      </ul>
    </article>
  );
};

export default QuestPanel;
