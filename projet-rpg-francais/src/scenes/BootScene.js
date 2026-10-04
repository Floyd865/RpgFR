import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    // Chargement des assets ici plus tard
  }

  create() {
    this.add.text(400, 300, 'Phaser fonctionne !', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);
  }
}