import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Boss } from '../entities/Boss';
import { ZoneSystem } from '../systems/ZoneSystem';
import { NpcInteractionSystem } from '../systems/NpcInteractionSystem';
import { CombatSystem } from '../systems/CombatSystem';
import {
  activateQuest,
  completeQuest as completeSharedQuest,
  getActiveQuests,
  hasDefeatedBoss,
  isZoneUnlocked,
  markPeBossDefeated,
} from '../state/gameState';

const WORLD_WIDTH = 1600;
const WORLD_HEIGHT = 960;
const RETURN_DOOR_INTERACT_DISTANCE = 100;
const DEFEAT_POPUP_LINES = ['Sedentary Security Drone defeated!', 'Fitness Suite Unlocked', 'Science Wing Unlocked'];
const PE_SPAWN_POINTS = {
  default: { x: 170, y: 170 },
  fromHub: { x: 170, y: 170 },
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

const DEFEATED_BOSS_UI_STATE = {
  name: 'Sedentary Security Drone',
  maxHp: 150,
  currentHp: 0,
  weakness: 'cardio',
  resistance: 'strength',
  isActive: false,
  isDefeated: true,
};

const TRAINER_NPC_CONFIG = {
  id: 'fitness-trainer',
  name: 'Fitness Trainer',
  x: 1260,
  y: 700,
  zoneId: 'fitness-suite',
  dialogue: 'Power restored. You can now train here.',
};

function getSpawnPoint(spawnKey) {
  return spawnKey ? PE_SPAWN_POINTS[spawnKey] ?? PE_SPAWN_POINTS.default : PE_SPAWN_POINTS.default;
}

export class PEWingScene extends Phaser.Scene {
  constructor({ uiHooks = {} } = {}) {
    super('PEWingScene');
    this.uiHooks = uiHooks;
    this.pendingSpawnPoint = PE_SPAWN_POINTS.default;
  }

    preload() {
    this.load.spritesheet('player', 'assets/characters/player/fitness_teacher_sprite_sheet.png', { frameWidth: 48, frameHeight: 48 });
  }

  init(data) {
    this.pendingSpawnPoint = getSpawnPoint(data?.spawnKey);
  }

  create() {
    this.createPlaceholderTextures();
    this.drawPlaceholderAreas();
    this.createPlayerAndBoss();
    this.createCollisionWorld();
    this.createSystems();
    this.createCamera();
    this.createSceneUi();
    this.registerSceneEvents();

    this.syncFromGameState();
    this.publishUi();
  }

  update() {
    this.updatePlayerAndNpc();
    this.combatSystem?.update();

    this.checkBossDefeat();
    this.handleReturnToHubPrompt();
    this.handleZoneUpdate();
  }

  createPlayerAndBoss() {
    this.player = new Player(this, this.pendingSpawnPoint.x, this.pendingSpawnPoint.y);
    this.boss = new Boss(this, 1230, 250);
    this.hasHandledBossDefeat = false;
    this.bossCombatActive = true;
    this.isTypingInForm = false;
  }

  createCollisionWorld() {
    this.wallGroup = this.physics.add.staticGroup();
    this.createWorldBoundaries();
    this.createInternalWalls();
    this.physics.add.collider(this.player, this.wallGroup);
    this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
  }

  createSystems() {
    this.combatSystem = new CombatSystem(this, this.player, this.boss);
    this.zoneSystem = new ZoneSystem(AREA_DEFINITIONS, 'changing-rooms');

    this.npcSystem = new NpcInteractionSystem(this, this.player, this.uiHooks, {
      onQuestAccepted: (quest) => this.addQuest(quest),
    });

    this.spawnPrimaryQuestNpc();
  }

  spawnPrimaryQuestNpc() {
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
  }

  createCamera() {
    this.cameras.main.startFollow(this.player, true, 0.15, 0.15);
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
  }

  createSceneUi() {
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

    this.returnDoor = this.add.rectangle(70, 620, 88, 118, 0x26405c, 0.9).setStrokeStyle(3, 0xc4def5, 1);
    this.add
      .text(70, 548, 'Return to Hub', {
        fontFamily: 'monospace',
        fontSize: '16px',
        color: '#ffffff',
        backgroundColor: '#00000066',
        padding: { x: 6, y: 4 },
      })
      .setOrigin(0.5)
      .setDepth(3);

    this.returnPromptText = this.add
      .text(480, 610, '', {
        fontFamily: 'monospace',
        fontSize: '18px',
        color: '#f4f6fb',
        backgroundColor: '#00000088',
        padding: { x: 8, y: 6 },
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1000);

    this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
  }

  registerSceneEvents() {
    this.events.on('wake', this.handleWake, this);
    this.events.once('shutdown', this.handleShutdown, this);
  }

  updatePlayerAndNpc() {
    if (this.isTypingInForm) {
      this.player?.update(true);
      return;
    }

    this.player?.update(false);
    this.npcSystem?.update(false);
  }

  handleReturnToHubPrompt() {
    const isNearExit = this.isNearReturnDoor();
    this.updateReturnPrompt(isNearExit);

    if (Phaser.Input.Keyboard.JustDown(this.interactKey) && isNearExit) {
      this.scene.switch('HubScene', { spawnKey: 'fromPEWing' });
    }
  }

  handleZoneUpdate() {
    const zoneInfo = this.zoneSystem?.update(this.player.x, this.player.y);
    if (!zoneInfo) return;

    this.areaText.setText(`Area: ${zoneInfo.name}`);
    this.publishUi(zoneInfo);
  }

  isNearReturnDoor() {
    return Phaser.Math.Distance.Between(this.player.x, this.player.y, this.returnDoor.x, this.returnDoor.y) <= RETURN_DOOR_INTERACT_DISTANCE;
  }

  updateReturnPrompt(isNearExit = this.isNearReturnDoor()) {
    if (!this.returnPromptText) return;
    this.returnPromptText.setText(isNearExit ? 'Press E to return to Hub' : '');
  }

  handleWake(_sys, data = {}) {
    const spawnPoint = getSpawnPoint(data?.spawnKey);
    this.player?.setPosition(spawnPoint.x, spawnPoint.y);
    this.player?.setVelocity(0, 0);

    this.syncFromGameState();
    this.updateReturnPrompt();
    this.publishUi();
  }

  handleShutdown() {
    this.events.off('wake', this.handleWake, this);
  }

  buildUiState(zoneInfo) {
    const zoneName = zoneInfo?.name ?? this.zoneSystem.getCurrentZoneName();
    const hasActiveBoss = this.hasActiveBossCombat();
    const isInSportsHall = zoneName === 'Sports Hall';

    return {
      quest: { activeQuests: getActiveQuests() },
      boss: this.buildBossUiState({ isInSportsHall, hasActiveBoss }),
      dialogue: null,
      exercise: hasActiveBoss
        ? {
            totalReps: this.combatSystem?.repCount ?? 0,
            zoneName,
            lastLoggedExercise: this.combatSystem?.exerciseLogs?.[this.combatSystem.exerciseLogs.length - 1] ?? null,
            combatLogMessage: this.combatSystem?.lastCombatLogMessage ?? null,
          }
        : null,
    };
  }

  buildBossUiState({ isInSportsHall, hasActiveBoss }) {
    if (!isInSportsHall) return null;
    if (hasActiveBoss) return this.boss.toUiState(true);
    return this.bossDefeated ? DEFEATED_BOSS_UI_STATE : null;
  }

  publishUi(zoneInfo) {
    const uiState = this.buildUiState(zoneInfo);
    this.uiHooks.onQuestUpdate?.(uiState.quest);
    this.uiHooks.onBossUpdate?.(uiState.boss);
    this.uiHooks.onDialogueUpdate?.(uiState.dialogue);
    this.uiHooks.onExerciseUpdate?.(uiState.exercise);
  }

  hasActiveBossCombat() {
    return this.bossCombatActive && this.boss && !this.boss.isDefeated();
  }

  setTypingInForm(isTypingInForm) {
    this.isTypingInForm = Boolean(isTypingInForm);

    if (this.input?.keyboard) {
      this.input.keyboard.enabled = !this.isTypingInForm;
    }
  }

  handleExerciseLog(exerciseInput) {
    const zoneName = this.zoneSystem.getCurrentZoneName();
    if (zoneName !== 'Sports Hall' || !this.hasActiveBossCombat()) {
      return;
    }

    this.combatSystem?.logExercise(exerciseInput);
    this.checkBossDefeat();
    this.publishUi();
  }

  addQuest(quest) {
    if (!quest) return;
    const acceptedQuest = activateQuest(quest);
    if (!acceptedQuest || acceptedQuest.completed) return;

    this.uiHooks.onQuestUpdate?.({ activeQuests: getActiveQuests() });
  }

  syncFromGameState() {
    if (hasDefeatedBoss('peBoss')) {
      this.handleBossDefeat({ fromSharedState: true });
      return;
    }

    if (isZoneUnlocked('peFitnessSuite')) {
      this.unlockFitnessSuite();
    }
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
    if (this.hasHandledBossDefeat || !this.boss || !this.boss.isDefeated()) return;
    this.handleBossDefeat();
  }

  handleBossDefeat({ fromSharedState = false } = {}) {
    if (this.hasHandledBossDefeat) return;
    this.hasHandledBossDefeat = true;

    this.applyBossDefeatConsequences();

    if (!fromSharedState) {
      this.showDefeatPopup(DEFEAT_POPUP_LINES);
    }

    this.publishUi();
  }

  applyBossDefeatConsequences() {
    this.markBossDefeated();
    this.completeQuest('restore-sports-hall');
    this.unlockFitnessSuite();
    this.spawnFollowUpNpc();
    this.disableBossCombat();
  }

  markBossDefeated() {
    this.bossDefeated = true;
    markPeBossDefeated();
  }

  completeQuest(questId) {
    completeSharedQuest(questId);
    this.uiHooks.onQuestUpdate?.({ activeQuests: getActiveQuests() });
  }

  unlockFitnessSuite() {
    this.zoneSystem.unlockZone('fitness-suite');
    this.updateFitnessSuiteVisuals();
    this.removeFitnessDoorWall();
  }

  updateFitnessSuiteVisuals() {
    const fitnessVisuals = this.zoneVisuals?.['fitness-suite'];
    fitnessVisuals?.lockOverlay?.destroy();
    if (fitnessVisuals?.label) {
      fitnessVisuals.label.setText('Fitness Suite');
    }
  }

  removeFitnessDoorWall() {
    if (!this.fitnessDoorWall) return;

    this.wallGroup.remove(this.fitnessDoorWall);
    this.fitnessDoorWall.destroy();
    this.fitnessDoorWall = null;
  }

  spawnFollowUpNpc() {
    if (this.hasSpawnedTrainerNpc) return;
    this.npcSystem.createNpc(TRAINER_NPC_CONFIG);
    this.hasSpawnedTrainerNpc = true;
  }

  disableBossCombat() {
    this.bossCombatActive = false;

    if (this.boss?.sprite) {
      this.boss.sprite.disableBody(true, true);
    }

    this.boss = null;
    this.combatSystem.boss = null;
    this.setTypingInForm(false);
  }

  showDefeatPopup(lines) {
    if (this.defeatPopupContainer) {
      this.defeatPopupContainer.destroy(true);
      this.defeatPopupContainer = null;
    }

    const overlay = this.add
      .rectangle(480, 320, 640, 280, 0x000000, 0.84)
      .setScrollFactor(0)
      .setDepth(1200)
      .setStrokeStyle(3, 0xe7ffe5, 0.95);

    const title = this.add
      .text(480, 250, lines[0], {
        fontFamily: 'monospace',
        fontSize: '28px',
        color: '#e7ffe5',
        align: 'center',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1201);

    const detail = this.add
      .text(480, 320, lines.slice(1).join('\n'), {
        fontFamily: 'monospace',
        fontSize: '22px',
        color: '#f4f6fb',
        align: 'center',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1201);

    const closeHint = this.add
      .text(480, 390, 'Press SPACE or click to continue', {
        fontFamily: 'monospace',
        fontSize: '18px',
        color: '#ffe8a3',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1201);

    this.defeatPopupContainer = this.add.container(0, 0, [overlay, title, detail, closeHint]).setDepth(1200);

    const closePopup = () => {
      this.defeatPopupContainer?.destroy(true);
      this.defeatPopupContainer = null;
      spaceKey?.off('down', closePopup);
      this.input.off('pointerdown', closePopup);
    };

    const spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    spaceKey.once('down', closePopup);
    this.input.once('pointerdown', closePopup);
  }

  createPlaceholderTextures() {
    this.createTextureBlock('player', 0x2e95ff, 24, 28);
    this.createTextureBlock('boss', 0xb93232, 72, 72);
  }

  createTextureBlock(key, color, width, height) {
    if (this.textures.exists(key)) {
      return;
    }

    const block = this.make.graphics({ x: 0, y: 0, add: false });
    block.fillStyle(color, 1);
    block.fillRect(0, 0, width, height);
    block.generateTexture(key, width, height);
    block.destroy();
  }
}
