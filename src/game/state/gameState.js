const createInitialGameState = () => ({
  progression: {
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
  },
  quests: {
    active: [],
    completed: [],
  },
  playerStats: {
    level: 1,
    hp: 100,
    stamina: 100,
  },
});

const gameState = createInitialGameState();

const cloneQuest = (quest) => ({ ...quest });

const findQuest = (questList, questId) => questList.find((quest) => quest.id === questId) ?? null;

export const getGameState = () => gameState;

export const getProgressionState = () => gameState.progression;

export const getQuestState = () => gameState.quests;

export const getUnlockedWings = () => gameState.progression.unlockedWings;

export const isWingUnlocked = (wingKey) => Boolean(gameState.progression.unlockedWings?.[wingKey]);

export const isZoneUnlocked = (zoneKey) => Boolean(gameState.progression.unlockedZones?.[zoneKey]);

export const hasDefeatedBoss = (bossKey) => Boolean(gameState.progression.defeatedBosses?.[bossKey]);

export const getActiveQuests = () => gameState.quests.active;

export const getCompletedQuests = () => gameState.quests.completed;

export const getQuestById = (questId) => findQuest(gameState.quests.active, questId) ?? findQuest(gameState.quests.completed, questId);

export const setWingUnlocked = (wingKey, unlocked = true) => {
  if (!(wingKey in gameState.progression.unlockedWings)) return;
  gameState.progression.unlockedWings[wingKey] = Boolean(unlocked);
};

export const setZoneUnlocked = (zoneKey, unlocked = true) => {
  if (!(zoneKey in gameState.progression.unlockedZones)) return;
  gameState.progression.unlockedZones[zoneKey] = Boolean(unlocked);
};

export const setBossDefeated = (bossKey, defeated = true) => {
  if (!(bossKey in gameState.progression.defeatedBosses)) return;
  gameState.progression.defeatedBosses[bossKey] = Boolean(defeated);
};

export const markPeBossDefeated = () => {
  setBossDefeated('peBoss', true);
  setWingUnlocked('scienceWing', true);
  setZoneUnlocked('peFitnessSuite', true);
};

export const activateQuest = (quest) => {
  if (!quest?.id) return null;

  const existingActiveQuest = findQuest(gameState.quests.active, quest.id);
  if (existingActiveQuest) return existingActiveQuest;

  const existingCompletedQuest = findQuest(gameState.quests.completed, quest.id);
  if (existingCompletedQuest) return existingCompletedQuest;

  const nextQuest = {
    ...quest,
    completed: Boolean(quest.completed),
  };

  gameState.quests.active = [...gameState.quests.active, nextQuest];
  return nextQuest;
};

export const completeQuest = (questId) => {
  if (!questId) return null;

  const activeQuest = findQuest(gameState.quests.active, questId);
  const existingCompletedQuest = findQuest(gameState.quests.completed, questId);
  if (!activeQuest && existingCompletedQuest) return existingCompletedQuest;
  if (!activeQuest) return null;

  const completedQuest = {
    ...activeQuest,
    completed: true,
    objective: 'Completed',
  };

  gameState.quests.active = gameState.quests.active.filter((quest) => quest.id !== questId);
  gameState.quests.completed = [...gameState.quests.completed.filter((quest) => quest.id !== questId), completedQuest];

  return completedQuest;
};

export const getQuestLog = () => [...gameState.quests.active.map(cloneQuest), ...gameState.quests.completed.map(cloneQuest)];

export const updatePlayerStats = (statsPatch) => {
  gameState.playerStats = {
    ...gameState.playerStats,
    ...statsPatch,
  };
};
