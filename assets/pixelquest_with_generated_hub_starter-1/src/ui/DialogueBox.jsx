import React from 'react';

// DialogueBox renders lightweight NPC conversation text from quest state.
const DialogueBox = ({ dialogue }) => {
  if (!dialogue) return null;

  return (
    <article className="ui-panel">
      <h2>{dialogue.speaker}</h2>
      <p>{dialogue.text}</p>
      {dialogue.acceptLabel ? (
        <button className="ui-button" type="button" onClick={dialogue.onAccept}>
          {dialogue.acceptLabel}
        </button>
      ) : null}
    </article>
  );
};

export default DialogueBox;
