const createInitialGameState = () => ({
  unlockedWings: {
    peWing: true,
    scienceWing: false,
    mathsCorridor: false,
    outdoorFields: false,
  },
  unlockedZones: {
    peFitnessSuite: false,
  },
  defeatedBosses: {
    peBoss: false,
  },
  activeQuest: null,
  playerStats: {
    level: 1,
    hp: 100,
    stamina: 100,
  },
});

const gameState = createInitialGameState();

export const getGameState = () => gameState;

export const markPeBossDefeated = () => {
  gameState.defeatedBosses.peBoss = true;
  gameState.unlockedWings.scienceWing = true;
  gameState.unlockedZones.peFitnessSuite = true;
};

export const completeActiveQuest = (questId) => {
  if (!gameState.activeQuest || gameState.activeQuest.id !== questId) return;

  gameState.activeQuest = {
    ...gameState.activeQuest,
    completed: true,
    objective: 'Completed',
  };
};

export const setActiveQuest = (quest) => {
  gameState.activeQuest = quest;
};

export const updatePlayerStats = (statsPatch) => {
  gameState.playerStats = {
    ...gameState.playerStats,
    ...statsPatch,
  };
};
