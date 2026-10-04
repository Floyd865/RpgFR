export default class XPSystem {
  constructor(config = {}) {
    this.niveau = config.niveau ?? 1;
    this.xpActuelle = config.xpActuelle ?? 0;
    this.xpBase = config.xpBase ?? 50;        // XP nécessaire pour passer du niveau 1 au niveau 2
    this.multiplicateur = config.multiplicateur ?? 1.5; // seuil qui grimpe à chaque niveau
  }

  // Calcule l'XP nécessaire pour passer du niveau actuel au suivant
  getXpRequisePourNiveauSuivant() {
    return Math.round(this.xpBase * Math.pow(this.multiplicateur, this.niveau - 1));
  }

  // Ajoute de l'XP, gère la montée de niveau (potentiellement plusieurs d'un coup)
  // Retourne un résumé de ce qui s'est passé, utile pour l'affichage
  ajouterXp(montant) {
    this.xpActuelle += montant;
    const niveauxGagnes = [];

    while (this.xpActuelle >= this.getXpRequisePourNiveauSuivant()) {
      this.xpActuelle -= this.getXpRequisePourNiveauSuivant();
      this.niveau++;
      niveauxGagnes.push(this.niveau);
    }

    return {
      xpGagnee: montant,
      niveauxGagnes,       // tableau vide si pas de montée de niveau, sinon ex: [2] ou [2, 3]
      niveauActuel: this.niveau,
      xpActuelle: this.xpActuelle,
      xpRequise: this.getXpRequisePourNiveauSuivant()
    };
  }

  getEtat() {
    return {
      niveau: this.niveau,
      xpActuelle: this.xpActuelle,
      xpRequise: this.getXpRequisePourNiveauSuivant()
    };
  }
}