import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Boss } from '../entities/Boss';
import { ZoneSystem } from '../systems/ZoneSystem';
import { NpcInteractionSystem } from '../systems/NpcInteractionSystem';
import { CombatSystem } from '../systems/CombatSystem';

const WORLD_WIDTH = 1600;
const WORLD_HEIGHT = 960;
const TEACHER_VERIFICATION_CODES = {
  'MR MARTIN': 'PE-101',
  'FITNESS TRAINER': 'GYM-202',
};

const AREA_DEFINITIONS = [
  { zoneId: 'changing-rooms', name: 'Changing Rooms', x: 40, y: 40, width: 340, height: 260, color: 0x5b7cfa },
  { zoneId: 'pe-corridor', name: 'PE Corridor', x: 380, y: 120, width: 260, height: 140, color: 0x42b883 },
  { zoneId: 'sports-hall', name: 'Sports Hall', x: 640, y: 40, width: 900, height: 460, color: 0xf4b400 },
  {
    zoneId: 'fitness-suite',
    name: 'Fitness Suite',
    x: 1040,
    y: 520,
    width: 500,
    height: 360,
    color: 0xde5b6d,
    locked: true,
  },
  { zoneId: 'canteen-hub', name: 'Canteen Hub', x: 40, y: 360, width: 980, height: 520, color: 0x8f6ed5 },
];

// MainScene draws a placeholder top-down map that can later be swapped with a tilemap.
export class MainScene extends Phaser.Scene {
  constructor({ uiHooks = {} } = {}) {
    super('MainScene');
    this.uiHooks = uiHooks;
  }

  create() {
    this.createPlaceholderTextures();
    this.drawPlaceholderAreas();

    this.player = new Player(this, 170, 170);
    this.boss = new Boss(this, 1230, 250);

    this.wallGroup = this.physics.add.staticGroup();
    this.createWorldBoundaries();
    this.createInternalWalls();

    this.physics.add.collider(this.player, this.wallGroup);
    this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    this.combatSystem = new CombatSystem(this, this.player, this.boss);
    this.hasHandledBossDefeat = false;

    this.zoneSystem = new ZoneSystem(AREA_DEFINITIONS, 'changing-rooms');
    this.activeQuests = [];
    this.setupZoneUnlockRules();

    this.npcSystem = new NpcInteractionSystem(this, this.player, this.uiHooks, {
      onQuestAccepted: (quest) => this.addQuest(quest),
    });
    this.npcSystem.createNpc({
      id: 'mr-martin',
      name: 'Mr Martin',
      x: 500,
      y: 182,
      zoneId: 'pe-corridor',
      dialogue:
        'The school is in lockdown. Restore power to the Sports Hall by defeating the Sedentary Security Drone.',
      quest: {
        id: 'restore-sports-hall',
        title: 'Restore the Sports Hall',
        objective: 'Deal 150 damage to the Sedentary Security Drone',
      },
    });

    this.cameras.main.startFollow(this.player, true, 0.15, 0.15);
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    this.areaText = this.add
      .text(20, 20, `Area: ${this.zoneSystem.getCurrentZoneName()}`, {
        fontFamily: 'monospace',
        fontSize: '24px',
        color: '#f4f6fb',
        backgroundColor: '#00000088',
        padding: { x: 10, y: 8 },
      })
      .setScrollFactor(0)
      .setDepth(1000);

    this.publishUi();
  }

  update() {
    this.player?.update();
    this.npcSystem?.update();
    this.combatSystem?.update();

    this.checkBossDefeat();

    const zoneInfo = this.zoneSystem?.update(this.player.x, this.player.y);
    if (zoneInfo) {
      this.areaText.setText(`Area: ${zoneInfo.name}`);
      this.publishUi(zoneInfo);
    }
  }

  publishUi(zoneInfo) {
    const { onQuestUpdate, onBossUpdate, onDialogueUpdate, onExerciseUpdate } = this.uiHooks;
    const zoneName = zoneInfo?.name ?? this.zoneSystem.getCurrentZoneName();
    const isInSportsHall = zoneName === 'Sports Hall';

    onQuestUpdate?.({ activeQuests: this.activeQuests });
    onBossUpdate?.(isInSportsHall ? this.boss.toUiState(true) : null);
    onDialogueUpdate?.(null);
    onExerciseUpdate?.(
      isInSportsHall
        ? {
            totalReps: this.combatSystem?.repCount ?? 0,
            zoneName,
            lastLoggedExercise:
              this.combatSystem?.exerciseLogs?.[this.combatSystem.exerciseLogs.length - 1] ?? null,
            combatLogMessage: this.combatSystem?.lastCombatLogMessage ?? null,
          }
        : null
    );
  }

  handleExerciseLog(exerciseInput) {
    const zoneName = this.zoneSystem.getCurrentZoneName();
    if (zoneName !== 'Sports Hall') return;

    const verifierName = exerciseInput?.verifierName?.trim()?.toUpperCase();
    const expectedCode = TEACHER_VERIFICATION_CODES[verifierName];
    const enteredCode = exerciseInput?.verificationCode?.trim()?.toUpperCase();

    if (!expectedCode || enteredCode !== expectedCode) {
      this.combatSystem.lastCombatLogMessage = 'Verification failed. Ask a PE teacher to confirm the exercise log.';
      this.publishUi();
      return;
    }

    this.combatSystem?.logExercise(exerciseInput);
    this.publishUi();
  }

  addQuest(quest) {
    if (!quest) return;
    const questAlreadyActive = this.activeQuests.some((activeQuest) => activeQuest.id === quest.id);
    if (questAlreadyActive) return;

    this.activeQuests = [...this.activeQuests, quest];
    this.uiHooks.onQuestUpdate?.({ activeQuests: this.activeQuests });
  }

  drawPlaceholderAreas() {
    this.zoneVisuals = {};

    AREA_DEFINITIONS.forEach((area) => {
      const areaBlock = this.add.rectangle(
        area.x + area.width / 2,
        area.y + area.height / 2,
        area.width,
        area.height,
        area.color,
        0.28
      );
      areaBlock.setStrokeStyle(3, area.color, 0.9);

      const labelText = area.locked ? `${area.name}\n(LOCKED)` : area.name;
      const label = this.add
        .text(area.x + 16, area.y + 14, labelText, {
          fontFamily: 'monospace',
          fontSize: '20px',
          color: '#ffffff',
          backgroundColor: '#00000066',
          padding: { x: 6, y: 4 },
        })
        .setDepth(2);

      const lockOverlay = area.locked
        ? this.add
            .rectangle(area.x + area.width / 2, area.y + area.height / 2, area.width, area.height, 0x090b10, 0.5)
            .setDepth(1)
        : null;

      this.zoneVisuals[area.zoneId] = {
        area,
        label,
        lockOverlay,
      };
    });
  }

  createWorldBoundaries() {
    this.createWall(0, 0, WORLD_WIDTH, 24);
    this.createWall(0, WORLD_HEIGHT - 24, WORLD_WIDTH, 24);
    this.createWall(0, 0, 24, WORLD_HEIGHT);
    this.createWall(WORLD_WIDTH - 24, 0, 24, WORLD_HEIGHT);
  }

  createInternalWalls() {
    this.createWall(360, 40, 20, 220);
    this.createWall(380, 100, 220, 20);
    this.createWall(620, 260, 20, 240);
    this.createWall(620, 500, 420, 20);

    // Fitness Suite door is closed for now.
    this.fitnessDoorWall = this.createWall(1040, 640, 24, 120);
    this.createWall(1040, 520, 220, 20);
  }

  createWall(x, y, width, height) {
    const wallVisual = this.add.rectangle(x + width / 2, y + height / 2, width, height, 0x1f2a37, 1);
    this.physics.add.existing(wallVisual, true);
    this.wallGroup.add(wallVisual);
    return wallVisual;
  }

  checkBossDefeat() {
    if (this.hasHandledBossDefeat || !this.boss?.isDefeated()) return;
    this.hasHandledBossDefeat = true;

    this.zoneSystem.trigger('boss:sedentary-security-drone-defeated', {
      markBossDefeated: () => this.markBossDefeated(),
      completeQuest: (questId) => this.completeQuest(questId),
      unlockFitnessSuite: () => this.unlockFitnessSuite(),
      createNpc: (npcConfig) => this.npcSystem.createNpc(npcConfig),
      showMessage: (message) => this.showUnlockMessage(message),
    });
  }


  setupZoneUnlockRules() {
    this.zoneSystem.registerUnlockRule({
      triggerId: 'boss:sedentary-security-drone-defeated',
      onTrigger: ({ markBossDefeated, completeQuest, unlockFitnessSuite, createNpc, showMessage }) => {
        markBossDefeated?.();
        completeQuest?.('restore-sports-hall');
        unlockFitnessSuite?.();
        createNpc?.({
          id: 'fitness-trainer',
          name: 'Fitness Trainer',
          x: 1260,
          y: 700,
          zoneId: 'fitness-suite',
          dialogue: 'Power restored. You can now train here.',
        });
        showMessage?.('Fitness Suite Unlocked');
        return { zoneId: 'fitness-suite', message: 'Fitness Suite Unlocked' };
      },
    });
  }

  markBossDefeated() {
    this.bossDefeated = true;
  }

  completeQuest(questId) {
    this.activeQuests = this.activeQuests.map((quest) =>
      quest.id === questId ? { ...quest, completed: true, objective: 'Completed' } : quest
    );
    this.uiHooks.onQuestUpdate?.({ activeQuests: this.activeQuests });
  }

  unlockFitnessSuite() {
    this.zoneSystem.unlockZone('fitness-suite');

    const fitnessVisuals = this.zoneVisuals?.['fitness-suite'];
    fitnessVisuals?.lockOverlay?.destroy();
    if (fitnessVisuals?.label) {
      fitnessVisuals.label.setText('Fitness Suite');
    }

    if (this.fitnessDoorWall) {
      this.wallGroup.remove(this.fitnessDoorWall);
      this.fitnessDoorWall.destroy();
      this.fitnessDoorWall = null;
    }

  }

  showUnlockMessage(message) {
    const text = this.add
      .text(480, 84, message, {
        fontFamily: 'monospace',
        fontSize: '28px',
        color: '#e7ffe5',
        backgroundColor: '#1c4126ee',
        padding: { x: 14, y: 8 },
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1100);

    this.tweens.add({
      targets: text,
      alpha: 0,
      ease: 'Quad.easeIn',
      delay: 1500,
      duration: 700,
      onComplete: () => text.destroy(),
    });
  }

  createPlaceholderTextures() {
    this.createTextureBlock('player', 0x2e95ff, 24, 28);
    this.createTextureBlock('boss', 0xb93232, 72, 72);
  }

  createTextureBlock(key, color, width, height) {
    const block = this.make.graphics({ x: 0, y: 0, add: false });
    block.fillStyle(color, 1);
    block.fillRect(0, 0, width, height);
    block.generateTexture(key, width, height);
    block.destroy();
  }
}
