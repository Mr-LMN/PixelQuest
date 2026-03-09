import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Boss } from '../entities/Boss';
import { NPC } from '../entities/NPC';
import { CombatSystem } from '../systems/CombatSystem';
import { QuestSystem } from '../systems/QuestSystem';
import { ZoneSystem } from '../systems/ZoneSystem';

// MainScene owns world creation and connects game entities to lightweight systems.
export class MainScene extends Phaser.Scene {
  constructor({ uiHooks = {} } = {}) {
    super('MainScene');
    this.uiHooks = uiHooks;
  }

  create() {
    this.createPlaceholderTextures();

    const map = this.createPlaceholderMap();
    const tileset = map.addTilesetImage('tiles', 'tiles', 32, 32, 0, 0, 1);
    const layer = map.createLayer(0, tileset, 0, 0);
    layer.setCollision(1);

    this.player = new Player(this, 64, 64);
    this.boss = new Boss(this, 700, 480);
    this.npc = new NPC(this, 260, 240, 'Guide Mira');

    this.physics.add.collider(this.player, layer);
    this.physics.add.collider(this.player, this.boss.sprite);

    this.combatSystem = new CombatSystem(this, this.player, this.boss);
    this.questSystem = new QuestSystem(this.player, this.boss, this.npc);
    this.zoneSystem = new ZoneSystem(this);

    this.cameras.main.startFollow(this.player, true, 0.15, 0.15);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    this.publishUi();
  }

  update() {
    this.player?.update();
    this.combatSystem?.update();

    const zoneInfo = this.zoneSystem?.update(this.player.x, this.player.y);
    const dialogue = this.questSystem?.update({
      playerX: this.player.x,
      playerY: this.player.y,
      bossDefeated: this.boss.isDefeated(),
      inCombatZone: zoneInfo?.zoneId === 'combat-trial',
    });

    if (dialogue || zoneInfo) {
      this.publishUi(dialogue, zoneInfo);
    }
  }

  publishUi(dialogueOverride, zoneInfo) {
    const { onQuestUpdate, onBossUpdate, onDialogueUpdate, onExerciseUpdate } = this.uiHooks;

    onQuestUpdate?.({ activeQuests: this.questSystem.getActiveQuests() });
    onBossUpdate?.({
      name: this.boss.name,
      currentHp: this.boss.currentHp,
      maxHp: this.boss.maxHp,
      isActive: this.combatSystem.inRange,
    });
    onDialogueUpdate?.(dialogueOverride ?? this.questSystem.getDialogueState());
    onExerciseUpdate?.({
      title: 'Bodyweight Trial',
      repGoal: 12,
      completedReps: this.combatSystem.repCount,
      zoneName: zoneInfo?.name ?? this.zoneSystem.getCurrentZoneName(),
    });
  }

  createPlaceholderTextures() {
    const tileAtlas = this.textures.createCanvas('tiles', 64, 32);
    const tileContext = tileAtlas.getContext();

    tileContext.fillStyle = '#567d46';
    tileContext.fillRect(0, 0, 32, 32);
    tileContext.fillStyle = '#3b2e2a';
    tileContext.fillRect(32, 0, 32, 32);
    tileAtlas.refresh();

    this.createTextureBlock('player', 0x2e95ff, 24, 28);
    this.createTextureBlock('boss', 0xff6b6b, 46, 52);
    this.createTextureBlock('npc', 0xf7cd4b, 18, 26);
  }

  createTextureBlock(key, color, width, height) {
    const block = this.make.graphics({ x: 0, y: 0, add: false });
    block.fillStyle(color, 1);
    block.fillRect(0, 0, width, height);
    block.generateTexture(key, width, height);
    block.destroy();
  }

  createPlaceholderMap() {
    const mapData = Array.from({ length: 30 }, (_, y) =>
      Array.from({ length: 40 }, (_, x) => {
        const borderTile = x === 0 || y === 0 || x === 39 || y === 29;
        const obstacleTile = x % 11 === 0 && y > 3 && y < 26;
        return borderTile || obstacleTile ? 1 : 0;
      })
    );

    return this.make.tilemap({
      data: mapData,
      tileWidth: 32,
      tileHeight: 32,
    });
  }
}
