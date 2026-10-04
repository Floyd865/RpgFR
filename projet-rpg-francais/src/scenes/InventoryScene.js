import Phaser from 'phaser';
import itemsData from '../../data/items.json';

export default class InventoryScene extends Phaser.Scene {
  constructor() {
    super('InventoryScene');
  }

  init(data) {
    this.inventorySystem = data.inventorySystem;
  }

  create() {
    // Fond semi-transparent par-dessus l'exploration (qui reste visible en pause derrière)
    this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.75);

    this.add.text(640, 60, 'Inventaire', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.afficherContenu();

    this.add.text(640, 660, 'Appuie sur I pour fermer', {
      fontSize: '18px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    // Ferme l'inventaire et reprend l'exploration exactement où elle en était
    this.input.keyboard.on('keydown-I', () => {
      this.scene.stop();
      this.scene.resume('ExplorationScene');
    });
  }

  afficherContenu() {
    const items = this.inventorySystem.getContenuDetaille();

    if (items.length === 0) {
      this.add.text(640, 360, 'Ton inventaire est vide pour le moment.', {
        fontSize: '20px',
        color: '#cccccc'
      }).setOrigin(0.5);
      return;
    }

    const departY = 150;
    const espacement = 55; // légèrement augmenté pour laisser respirer l'icône

    items.forEach((item, index) => {
      const y = departY + index * espacement;

      // Icône de l'item, si un sprite existe pour son id
      this.add.image(270, y + 10, item.sprite).setDisplaySize(32, 32);

      this.add.text(300, y, item.nom, {
        fontSize: '22px',
        color: '#ffffff'
      });

      this.add.text(750, y, `x${item.quantite}`, {
        fontSize: '22px',
        color: '#ffdd55'
      });

      this.add.text(300, y + 24, item.description, {
        fontSize: '14px',
        color: '#999999'
      });
    });
  }
}