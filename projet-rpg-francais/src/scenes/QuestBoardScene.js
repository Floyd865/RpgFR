import Phaser from 'phaser';
import questsData from '../../data/quests.json';

export default class QuestBoardScene extends Phaser.Scene {
  constructor() {
    super('QuestBoardScene');
  }

  init(data) {
    this.questSystem = data.questSystem;
    this.inventorySystem = data.inventorySystem;
  }

  create() {
    this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.75);

    this.add.text(640, 60, 'Tableau de quêtes', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.afficherQuetes();

    this.add.text(640, 660, 'Appuie sur Q pour fermer', {
      fontSize: '18px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    this.input.keyboard.on('keydown-Q', () => {
      this.scene.stop();
      this.scene.resume('ExplorationScene');
    });
  }

  afficherQuetes() {
  const departY = 150;
  const espacement = 110;

  questsData.quetes.forEach((quete, index) => {
    const etat = this.questSystem.getEtatQuete(quete.id);
    const y = departY + index * espacement;

    if (etat === 'non_commencee') {
      this.add.text(250, y, '??? — Quête non découverte', {
        fontSize: '20px',
        color: '#666666',
        fontStyle: 'italic'
      });
      return;
    }

    const couleurTitre = etat === 'terminee' ? '#888888' : '#ffffff';
    const prefixe = etat === 'terminee' ? '✓ ' : '';

    const titre = this.add.text(250, y, `${prefixe}${quete.titre}`, {
      fontSize: '22px',
      color: couleurTitre
    });

    if (etat === 'terminee') {
      titre.setAlpha(0.6);
    }

    let texteStatut = '';
    let couleurStatut = '#cccccc';

    if (etat === 'en_cours') {
      let progression, objectifTotal;

      if (quete.objectif.type === 'vaincre_monstre') {
        progression = this.questSystem.getCompteur(quete.id);
        objectifTotal = quete.objectif.quantite;
      } else if (quete.objectif.type === 'posseder_item') {
        progression = Math.min(this.inventorySystem.getQuantite(quete.objectif.cible), quete.objectif.quantite);
        objectifTotal = quete.objectif.quantite;
      }

      texteStatut = `En cours — ${progression} / ${objectifTotal}`;
      couleurStatut = '#ffdd55';

      const ratio = progression / objectifTotal;
      this.add.rectangle(250, y + 55, 300, 10, 0x333333).setOrigin(0, 0.5);
      this.add.rectangle(250, y + 55, 300 * ratio, 10, 0x55dd55).setOrigin(0, 0.5);
    } else if (etat === 'a_rendre') {
      texteStatut = 'Objectif atteint — à rendre au PNJ !';
      couleurStatut = '#55ff88';
    } else if (etat === 'terminee') {
      texteStatut = 'Terminée';
      couleurStatut = '#888888';
    }

    this.add.text(250, y + 28, texteStatut, {
      fontSize: '16px',
      color: couleurStatut
    });
  });
}
}