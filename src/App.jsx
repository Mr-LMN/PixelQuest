import { useEffect, useRef } from 'react';
import { createGame } from './game/createGame';
import QuestPanel from './ui/QuestPanel';
import './App.css';

const App = () => {
  const gameContainerRef = useRef(null);

  useEffect(() => {
    if (!gameContainerRef.current) return undefined;

    const game = createGame(gameContainerRef.current);

    return () => {
      game.destroy(true);
    };
  }, []);

  return (
    <main className="app-layout">
      <section className="game-shell">
        <div className="game-canvas" ref={gameContainerRef} />
      </section>
      <QuestPanel />
    </main>
  );
};

export default App;
