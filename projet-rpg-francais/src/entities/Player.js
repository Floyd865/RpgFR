import Phaser from 'phaser';

export default class Player {
  constructor(scene, x, y) {
    this.scene = scene;
    this.speed = 200; // pixels par seconde

    // Sprite temporaire : un rectangle bleu généré en mémoire
    if (!scene.textures.exists('hero_placeholder')) {
      const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
      graphics.fillStyle(0x3498db, 1);
      graphics.fillRect(0, 0, 32, 32);
      graphics.generateTexture('hero_placeholder', 32, 32);
    }

    this.sprite = scene.physics.add.sprite(x, y, 'hero_placeholder');
    this.sprite.setCollideWorldBounds(true);

    this.cursors = scene.input.keyboard.createCursorKeys();
    this.wasd = scene.input.keyboard.addKeys('W,A,S,D');
  }

  update() {
    const body = this.sprite.body;
    body.setVelocity(0);

    const left = this.cursors.left.isDown || this.wasd.A.isDown;
    const right = this.cursors.right.isDown || this.wasd.D.isDown;
    const up = this.cursors.up.isDown || this.wasd.W.isDown;
    const down = this.cursors.down.isDown || this.wasd.S.isDown;

    if (left) body.setVelocityX(-this.speed);
    else if (right) body.setVelocityX(this.speed);

    if (up) body.setVelocityY(-this.speed);
    else if (down) body.setVelocityY(this.speed);

    // Normalise la vitesse en diagonale pour éviter d'aller plus vite en biais
    body.velocity.normalize().scale(this.speed);
  }
}