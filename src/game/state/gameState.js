const createInitialGameState = () => ({
  unlockedWings: {
    peWing: true,
    scienceWing: false,
    mathsCorridor: false,
    outdoorFields: false,
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

