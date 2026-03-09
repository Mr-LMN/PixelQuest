// DialogueBox renders lightweight NPC conversation text from quest state.
const DialogueBox = ({ dialogue }) => {
  if (!dialogue) return null;

  return (
    <article className="ui-panel">
      <h2>{dialogue.speaker}</h2>
      <p>{dialogue.text}</p>
    </article>
  );
};

export default DialogueBox;
