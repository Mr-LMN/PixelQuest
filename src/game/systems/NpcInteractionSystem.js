import Phaser from 'phaser';

const DEFAULT_INTERACTION_DISTANCE = 84;

// NpcInteractionSystem manages reusable NPC proximity checks and interaction handling.
export class NpcInteractionSystem {
  constructor(scene, player, uiHooks = {}, options = {}) {
    this.scene = scene;
    this.player = player;
    this.uiHooks = uiHooks;
    this.options = options;

    this.npcs = [];
    this.nearbyNpc = null;
    this.activeDialogueNpcId = null;
    this.interactionDistance = options.interactionDistance ?? DEFAULT_INTERACTION_DISTANCE;

    this.interactKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
  }

  createNpc(config) {
    const marker = this.scene.add.rectangle(config.x, config.y, 28, 34, 0xffd166, 1).setDepth(4);
    marker.setStrokeStyle(2, 0x3d2f18, 1);

    const label = this.scene.add
      .text(config.x, config.y - 34, config.name, {
        fontFamily: 'monospace',
        fontSize: '15px',
        color: '#ffe8a3',
        backgroundColor: '#0000009e',
        padding: { x: 6, y: 2 },
      })
      .setOrigin(0.5, 1)
      .setDepth(4);

    const prompt = this.scene.add
      .text(config.x, config.y - 56, 'Press E to talk', {
        fontFamily: 'monospace',
        fontSize: '13px',
        color: '#ffffff',
        backgroundColor: '#1b1f2acc',
        padding: { x: 5, y: 3 },
      })
      .setOrigin(0.5, 1)
      .setDepth(5)
      .setVisible(false);

    this.npcs.push({
      ...config,
      marker,
      label,
      prompt,
    });
  }

  update() {
    this.updateNearbyNpc();

    if (Phaser.Input.Keyboard.JustDown(this.interactKey) && this.nearbyNpc) {
      this.openDialogue(this.nearbyNpc);
    }
  }

  updateNearbyNpc() {
    let nearestNpc = null;
    let nearestDistance = Number.POSITIVE_INFINITY;

    for (const npc of this.npcs) {
      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, npc.x, npc.y);
      const isNear = distance <= this.interactionDistance;
      npc.prompt.setVisible(isNear);

      if (isNear && distance < nearestDistance) {
        nearestNpc = npc;
        nearestDistance = distance;
      }
    }

    this.nearbyNpc = nearestNpc;
  }

  openDialogue(npc) {
    this.activeDialogueNpcId = npc.id;
    this.uiHooks.onDialogueUpdate?.({
      speaker: npc.name,
      text: npc.dialogue,
      acceptLabel: 'Accept Quest',
      onAccept: () => this.acceptDialogue(npc),
    });
  }

  acceptDialogue(npc) {
    this.options.onQuestAccepted?.(npc.quest);
    this.uiHooks.onDialogueUpdate?.(null);
    this.activeDialogueNpcId = null;
  }
}
