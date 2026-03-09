// NPC stores a guide character and static lines for placeholder dialogue.
export class NPC {
  constructor(scene, x, y, name) {
    this.scene = scene;
    this.name = name;
    this.lines = [
      'Welcome to PixelQuest trainee!',
      'Move with WASD and reach the challenge zone.',
      'Press SPACE near the boss to perform exercise strikes.',
    ];

    this.sprite = scene.physics.add.staticImage(x, y, 'npc').setOrigin(0.5, 0.5);
  }
}
