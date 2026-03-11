import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { getActiveQuests, getUnlockedWings } from '../state/gameState';

const HUB_MAP_KEY = 'hub-map';
const HUB_TILESET_KEY = 'hub-tileset';
const HUB_TILESET_NAME = 'pencoedtre_generated_tileset';
const HUB_MAP_PATH = 'assets/maps/hub/pencoedtre_hub_starter.json';
const HUB_TILESET_PATH = 'assets/tilesets/generated-school/pencoedtre_generated_tileset.png';
const DEFAULT_SPAWN_OFFSET = { x: 640, y: 672 };
const HUB_SPAWN_POINTS = {
  default: DEFAULT_SPAWN_OFFSET,
  fromPEWing: { x: 560, y: 390 },
};

const HUB_DOOR_CONFIG = {
  pe_wing_door: { label: 'PE Wing', stateKey: 'peWing', target: 'PEWingScene' },
  science_wing_door: { label: 'Science Wing', stateKey: 'scienceWing' },
  outdoor_fields_door: { label: 'Outdoor Fields', stateKey: 'outdoorFields' },
};

export class HubScene extends Phaser.Scene {
  constructor({ uiHooks = {} } = {}) {
    super('HubScene');
    this.uiHooks = uiHooks;
    this.pendingSpawnPoint = HUB_SPAWN_POINTS.default;
  }

  preload() {
    this.load.image(HUB_TILESET_KEY, HUB_TILESET_PATH);
    this.load.tilemapTiledJSON(HUB_MAP_KEY, HUB_MAP_PATH);
        this.load.spritesheet('player', 'assets/characters/player/fitness_teacher_sprite_sheet.png', { frameWidth: 48, frameHeight: 48 });
    
  }

  init(data) {
  }

  create() {
    this.createPlaceholderTextures();
    this.createMap();

    const playerSpawn = this.markerPositions.player_spawn ?? this.pendingSpawnPoint;
    this.player = new Player(this, playerSpawn.x, playerSpawn.y);

    this.createCollisionWorld();
    this.createDoorZones();
    this.createUi();
    this.createCamera();

    this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    this.events.on('wake', this.handleWake, this);
    this.events.once('shutdown', this.handleShutdown, this);

    this.uiHooks.onQuestUpdate?.({ activeQuests: getActiveQuests() });
    this.uiHooks.onBossUpdate?.(null);
    this.uiHooks.onDialogueUpdate?.(null);
    this.uiHooks.onExerciseUpdate?.(null);
  }

  update() {
    this.player?.update(false);
    this.setInteractionPrompt();

    if (!Phaser.Input.Keyboard.JustDown(this.interactKey)) return;

    const nearbyDoor = this.findNearbyDoor();
    if (!nearbyDoor || nearbyDoor.locked || !nearbyDoor.target) return;

    this.scene.switch(nearbyDoor.target, { spawnKey: 'fromHub' });
  }

  createMap() {
    this.map = this.make.tilemap({ key: HUB_MAP_KEY });
    const tileset = this.map.addTilesetImage(HUB_TILESET_NAME, HUB_TILESET_KEY);

    if (!tileset) {
      throw new Error('Failed to create hub tileset from Tiled map data.');
    }

    this.mapLayers = {
      ground: this.map.createLayer('Ground', tileset, 0, 0),
      campus: this.map.createLayer('Campus', tileset, 0, 0),
      props: this.map.createLayer('Props', tileset, 0, 0),
    };

    this.mapLayers.ground?.setDepth(0);
    this.mapLayers.campus?.setDepth(1);
    this.mapLayers.props?.setDepth(3);

    this.markerPositions = this.readMarkerLayer();

    this.worldWidth = this.map.widthInPixels;
    this.worldHeight = this.map.heightInPixels;
    this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight);
  }

  createCollisionWorld() {
    const collisionLayer = this.map.getObjectLayer('Collision');
    this.collisionBodies = [];

    if (!collisionLayer) return;

    collisionLayer.objects.forEach((obj) => {
      const width = obj.width ?? 0;
      const height = obj.height ?? 0;
      if (width <= 0 || height <= 0) return;

      const collider = this.add.rectangle(obj.x + width / 2, obj.y + height / 2, width, height, 0x000000, 0);
      this.physics.add.existing(collider, true);
      this.collisionBodies.push(collider);
    });

    this.collisionBodies.forEach((collider) => {
      this.physics.add.collider(this.player, collider);
    });
  }

  readMarkerLayer() {
    const markerLayer = this.map.getObjectLayer('Markers');
    if (!markerLayer) return {};

    return markerLayer.objects.reduce((markers, marker) => {
      markers[marker.name] = {
        x: marker.x,
        y: marker.y,
        width: marker.width ?? 0,
        height: marker.height ?? 0,
      };
      return markers;
    }, {});
  }

  createDoorZones() {
    this.lastDoorLockStates = {};

    this.doors = Object.entries(HUB_DOOR_CONFIG)
      .map(([markerKey, config]) => {
        const marker = this.markerPositions[markerKey];
        if (!marker) return null;

        const width = marker.width || 64;
        const height = marker.height || 64;
        const centerX = marker.x + width / 2;
        const centerY = marker.y + height / 2;

        return {
          id: markerKey,
          ...config,
          x: centerX,
          y: centerY,
          area: new Phaser.Geom.Rectangle(marker.x, marker.y, width, height),
        };
      })
      .filter(Boolean);

    this.renderDoors();
  }

  createUi() {
    this.promptText = this.add
      .text(this.scale.width / 2, this.scale.height - 36, '', {
        fontFamily: 'monospace',
        fontSize: '18px',
        color: '#f4f6fb',
        backgroundColor: '#00000088',
        padding: { x: 8, y: 6 },
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1000);

    this.setInteractionPrompt();
  }

  createCamera() {
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);
  }

  handleWake(_sys, data = {}) {
    const spawnPoint = data?.spawnKey ? HUB_SPAWN_POINTS[data.spawnKey] ?? HUB_SPAWN_POINTS.default : HUB_SPAWN_POINTS.default;
    this.player?.setPosition(spawnPoint.x, spawnPoint.y);
    this.player?.setVelocity(0, 0);
    this.renderDoors();
    this.setInteractionPrompt();
    this.uiHooks.onQuestUpdate?.({ activeQuests: getActiveQuests() });
    this.uiHooks.onBossUpdate?.(null);
    this.uiHooks.onDialogueUpdate?.(null);
    this.uiHooks.onExerciseUpdate?.(null);
  }

  handleShutdown() {
    this.events.off('wake', this.handleWake, this);
  }

  renderDoors() {
    const wingState = getUnlockedWings();

    this.doors.forEach((door) => {
      const isUnlocked = wingState[door.stateKey] ?? false;
      const wasLocked = this.lastDoorLockStates[door.stateKey];
      door.locked = !isUnlocked;

      if (door.stateKey === 'scienceWing' && wasLocked === true && !door.locked) {
        this.showUnlockMessage('Science Wing Unlocked');
      }

      this.lastDoorLockStates[door.stateKey] = door.locked;
    });
  }

  showUnlockMessage(message) {
    if (this.unlockMessageText) {
      this.unlockMessageText.destroy();
      this.unlockMessageText = null;
    }

    this.unlockMessageText = this.add
      .text(this.scale.width / 2, 86, message, {
        fontFamily: 'monospace',
        fontSize: '28px',
        color: '#e7ffe5',
        backgroundColor: '#1c4126ee',
        padding: { x: 14, y: 8 },
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1000);

    this.tweens.add({
      targets: this.unlockMessageText,
      alpha: 0,
      ease: 'Quad.easeIn',
      delay: 1500,
      duration: 700,
      onComplete: () => {
        this.unlockMessageText?.destroy();
        this.unlockMessageText = null;
      },
    });
  }

  findNearbyDoor() {
    return this.doors.find((door) => {
      if (Phaser.Geom.Rectangle.Contains(door.area, this.player.x, this.player.y)) return true;
      return Phaser.Math.Distance.Between(this.player.x, this.player.y, door.x, door.y) <= 72;
    });
  }

  setInteractionPrompt() {
    const nearbyDoor = this.findNearbyDoor();

    if (!nearbyDoor) {
      this.promptText.setText('');
      return;
    }

    if (nearbyDoor.locked) {
      this.promptText.setText(`${nearbyDoor.label} is locked`);
      return;
    }

    if (!nearbyDoor.target) {
      this.promptText.setText(`${nearbyDoor.label} is unlocked (coming soon)`);
      return;
    }

    this.promptText.setText(`Press E to enter ${nearbyDoor.label}`);
  }

  createPlaceholderTextures() {
    if (!this.textures.exists('player')) {
      const block = this.make.graphics({ x: 0, y: 0, add: false });
      block.fillStyle(0x2e95ff, 1);
      block.fillRect(0, 0, 24, 28);
      block.generateTexture('player', 24, 28);
      block.destroy();
    }
  }
}
