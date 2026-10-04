import Phaser from 'phaser';

export default class DialogueScene extends Phaser.Scene {
  constructor() {
    super('DialogueScene');
  }

  init(data) {
    this.nom = data.nom;
    this.lignes = data.dialogue;
    this.indexLigne = 0;
    this.onFermeture = data.onFermeture || null; // callback optionnel exécuté à la fermeture
  }

  create() {
    this.add.rectangle(640, 620, 1200, 160, 0x1a1a2e, 0.95).setStrokeStyle(3, 0xffffff);

    this.texteNom = this.add.text(120, 555, this.nom, {
      fontSize: '20px',
      color: '#ffdd55'
    });

    this.texteDialogue = this.add.text(120, 590, '', {
      fontSize: '20px',
      color: '#ffffff',
      wordWrap: { width: 1050 }
    });

    this.texteIndication = this.add.text(1150, 690, 'Entrée ↵', {
      fontSize: '14px',
      color: '#aaaaaa'
    }).setOrigin(1, 0.5);

    this.afficherLigne();

    this.input.keyboard.on('keydown-ENTER', () => this.avancerDialogue());
    this.input.keyboard.on('keydown-SPACE', () => this.avancerDialogue());
  }

  afficherLigne() {
    this.texteDialogue.setText(this.lignes[this.indexLigne]);
  }

  avancerDialogue() {
    this.indexLigne++;

    if (this.indexLigne >= this.lignes.length) {
      this.fermerDialogue();
      return;
    }

    this.afficherLigne();
  }

  fermerDialogue() {
    if (this.onFermeture) this.onFermeture();
    this.scene.stop();
    this.scene.resume('ExplorationScene');
  }
}