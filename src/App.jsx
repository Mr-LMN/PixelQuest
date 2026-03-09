import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createGame } from './game/createGame';
import QuestPanel from './ui/QuestPanel';
import ExercisePanel from './ui/ExercisePanel';
import BossHealth from './ui/BossHealth';
import DialogueBox from './ui/DialogueBox';
import './App.css';

// App sets up the Phaser game and coordinates simple React HUD panels.
const App = () => {
  const gameContainerRef = useRef(null);
  const gameRef = useRef(null);
  const [questState, setQuestState] = useState(null);
  const [bossState, setBossState] = useState(null);
  const [dialogueState, setDialogueState] = useState(null);
  const [exerciseState, setExerciseState] = useState(null);
  const [isTypingInForm, setIsTypingInForm] = useState(false);

  const uiHooks = useMemo(
    () => ({
      onQuestUpdate: setQuestState,
      onBossUpdate: setBossState,
      onDialogueUpdate: setDialogueState,
      onExerciseUpdate: setExerciseState,
    }),
    []
  );

  useEffect(() => {
    if (!gameContainerRef.current) return undefined;

    const game = createGame(gameContainerRef.current, uiHooks);
    gameRef.current = game;

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, [uiHooks]);


  const getGameplayScene = () => gameRef.current?.scene?.keys?.PEWingScene ?? gameRef.current?.scene?.keys?.MainScene;

  useEffect(() => {
    const gameplayScene = getGameplayScene();
    gameplayScene?.setTypingInForm?.(isTypingInForm);
  }, [isTypingInForm]);

  const handleExerciseSubmit = (exerciseInput) => {
    const gameplayScene = getGameplayScene();
    gameplayScene?.handleExerciseLog?.(exerciseInput);
  };

  return (
    <main className="app-layout">
      <section className="game-shell">
        <div className="game-canvas" ref={gameContainerRef} />
      </section>
      <section className="ui-shell">
        <QuestPanel quests={questState?.activeQuests ?? []} />
        <ExercisePanel
          exercise={exerciseState}
          isBossFightActive={Boolean(bossState?.isActive)}
          onSubmitExercise={handleExerciseSubmit}
          onFormFocusChange={setIsTypingInForm}
        />
        <BossHealth boss={bossState} />
        <DialogueBox dialogue={dialogueState} />
      </section>
    </main>
  );
};

export default App;
