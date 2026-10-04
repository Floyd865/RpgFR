import Phaser from 'phaser';
import SaveManager from '../systems/SaveManager.js';

export default class MainMenuScene extends Phaser.Scene {
  constructor() {
    super('MainMenuScene');
  }

  create() {
    this.cameras.main.setBackgroundColor('#1a1a2e');

    this.add.text(640, 100, 'RPG Français', {
      fontSize: '48px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(640, 160, 'Choisis un emplacement de sauvegarde', {
      fontSize: '20px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    for (let slot = 1; slot <= 3; slot++) {
      this.creerEmplacement(slot);
    }
  }

  creerEmplacement(slot) {
    const y = 260 + (slot - 1) * 130;
    const sauvegarde = SaveManager.charger(slot);

    const fond = this.add.rectangle(640, y, 700, 100, 0x2a2a45, 0.9)
      .setStrokeStyle(2, 0x555577)
      .setInteractive({ useHandCursor: true });

    const texteTitre = sauvegarde
      ? `Emplacement ${slot} — Niveau ${sauvegarde.niveau}`
      : `Emplacement ${slot} — Vide`;

    const texteDetail = sauvegarde
      ? `Zone : ${sauvegarde.zone}`
      : 'Nouvelle partie';

    this.add.text(640, y - 18, texteTitre, { fontSize: '24px', color: '#ffffff' }).setOrigin(0.5);
    this.add.text(640, y + 14, texteDetail, { fontSize: '16px', color: '#bbbbbb' }).setOrigin(0.5);

    fond.on('pointerover', () => fond.setFillStyle(0x35355a, 0.9));
    fond.on('pointerout', () => fond.setFillStyle(0x2a2a45, 0.9));
    fond.on('pointerdown', () => this.demarrerPartie(slot));

    // Bouton de suppression, uniquement si une sauvegarde existe dans ce slot
    if (sauvegarde) {
      const boutonReset = this.add.text(950, y, '🗑 Réinitialiser', {
        fontSize: '16px',
        color: '#ff8888'
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });

      boutonReset.on('pointerdown', () => this.reinitialiserEmplacement(slot));
    }
  }

  reinitialiserEmplacement(slot) {
    const confirmation = window.confirm(`Réinitialiser l'emplacement ${slot} ? Cette action est irréversible.`);
    if (!confirmation) return;

    SaveManager.supprimer(slot);
    this.scene.restart(); // recharge l'écran pour rafraîchir l'affichage
  }

  demarrerPartie(slot) {
    this.registry.set('slotActif', slot);
    this.scene.start('ExplorationScene');
  }
}