import Phaser from 'phaser';
import { Player } from '../entities/Player';

const HUB_WIDTH = 960;
const HUB_HEIGHT = 640;

export class HubScene extends Phaser.Scene {
  constructor({ uiHooks = {} } = {}) {
    super('HubScene');
    this.uiHooks = uiHooks;
  }

  create() {
    this.createPlaceholderTextures();

    this.physics.world.setBounds(0, 0, HUB_WIDTH, HUB_HEIGHT);

    this.add.rectangle(HUB_WIDTH / 2, HUB_HEIGHT / 2, HUB_WIDTH, HUB_HEIGHT, 0x3f6b56, 0.35).setStrokeStyle(3, 0x9fc7b7, 0.85);

    this.add
      .text(HUB_WIDTH / 2, 40, 'Central Courtyard / Canteen Hub', {
        fontFamily: 'monospace',
        fontSize: '26px',
        color: '#ffffff',
        backgroundColor: '#00000066',
        padding: { x: 10, y: 8 },
      })
      .setOrigin(0.5);

    this.player = new Player(this, HUB_WIDTH / 2, HUB_HEIGHT - 120);

    this.doors = [
      {
        id: 'pe-wing',
        label: 'PE Wing',
        x: 170,
        y: 145,
        width: 120,
        height: 80,
        color: 0x3c8c46,
        locked: false,
        target: 'PEWingScene',
      },
      {
        id: 'science-wing',
        label: 'Science Wing',
        x: 380,
        y: 145,
        width: 120,
        height: 80,
        color: 0x6d737d,
        locked: true,
      },
      {
        id: 'maths-corridor',
        label: 'Maths Corridor',
        x: 590,
        y: 145,
        width: 120,
        height: 80,
        color: 0x6d737d,
        locked: true,
      },
      {
        id: 'outdoor-fields',
        label: 'Outdoor Fields',
        x: 800,
        y: 145,
        width: 120,
        height: 80,
        color: 0x6d737d,
        locked: true,
      },
    ];

    this.doors.forEach((door) => {
      door.rect = this.add
        .rectangle(door.x, door.y, door.width, door.height, door.color, 0.95)
        .setStrokeStyle(3, 0x111827, 1);

      this.add
        .text(door.x, door.y - 66, door.locked ? `${door.label} (Locked)` : door.label, {
          fontFamily: 'monospace',
          fontSize: '18px',
          align: 'center',
          color: '#ffffff',
          backgroundColor: '#00000066',
          padding: { x: 6, y: 4 },
        })
        .setOrigin(0.5);
    });

    this.promptText = this.add
      .text(HUB_WIDTH / 2, HUB_HEIGHT - 36, '', {
        fontFamily: 'monospace',
        fontSize: '18px',
        color: '#f4f6fb',
        backgroundColor: '#00000088',
        padding: { x: 8, y: 6 },
      })
      .setOrigin(0.5);

    this.setInteractionPrompt();

    this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    this.uiHooks.onQuestUpdate?.({ activeQuests: [] });
    this.uiHooks.onBossUpdate?.(null);
    this.uiHooks.onDialogueUpdate?.(null);
    this.uiHooks.onExerciseUpdate?.(null);
  }

  update() {
    this.player?.update(false);

    this.setInteractionPrompt();

    if (!Phaser.Input.Keyboard.JustDown(this.interactKey)) return;

    const nearbyDoor = this.findNearbyDoor();
    if (!nearbyDoor) return;

    if (nearbyDoor.locked) {
      return;
    }

    this.scene.start(nearbyDoor.target);
  }

  findNearbyDoor() {
    return this.doors.find((door) => Phaser.Math.Distance.Between(this.player.x, this.player.y, door.x, door.y) <= 95);
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
