import Phaser from 'phaser';

// QuestSystem keeps a tiny state machine for quest text and dialogue output.
export class QuestSystem {
  constructor(player, boss, npc) {
    this.player = player;
    this.boss = boss;
    this.npc = npc;

    this.activeQuests = [
      'Talk to Guide Mira',
      'Enter the combat trial zone',
      'Defeat Iron Titan with 12 exercise strikes',
    ];

    this.dialogueState = { speaker: npc.name, text: npc.lines[0] };
  }

  update({ playerX, playerY, bossDefeated, inCombatZone }) {
    const nearNpc = Phaser.Math.Distance.Between(playerX, playerY, this.npc.sprite.x, this.npc.sprite.y) < 90;

    if (bossDefeated) {
      this.dialogueState = { speaker: this.npc.name, text: 'Amazing work! You completed the prototype quest.' };
      this.activeQuests = ['Return for the next prototype challenge'];
      return this.dialogueState;
    }

    if (inCombatZone) {
      this.dialogueState = { speaker: this.npc.name, text: 'Great! Strike the boss with SPACE to log reps.' };
      return this.dialogueState;
    }

    if (nearNpc) {
      this.dialogueState = { speaker: this.npc.name, text: this.npc.lines[1] };
      return this.dialogueState;
    }

    return null;
  }

  getActiveQuests() {
    return this.activeQuests;
  }

  getDialogueState() {
    return this.dialogueState;
  }
}
