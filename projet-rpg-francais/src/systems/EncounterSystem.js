export default class EncounterSystem {
  constructor(config = {}) {
    this.tauxBase = config.tauxBase ?? 0.05;        // 5% de chance de base par pas
    this.augmentation = config.augmentation ?? 0.02; // +2% à chaque pas sans rencontre
    this.tauxMax = config.tauxMax ?? 0.6;             // plafond pour éviter un taux à 100%
    this.distancePourUnPas = config.distancePourUnPas ?? 32; // px parcourus = 1 "pas"

    this.tauxActuel = this.tauxBase;
    this.distanceParcourue = 0;
  }

  // À appeler à chaque frame avec la distance parcourue depuis la dernière frame
  enregistrerDeplacement(distance) {
  if (distance <= 0) return false;

  this.distanceParcourue += distance;
  let rencontreDeclenchee = false;

  while (this.distanceParcourue >= this.distancePourUnPas) {
    this.distanceParcourue -= this.distancePourUnPas;
    if (this.tenterRencontre()) {
      rencontreDeclenchee = true;
      break; // on arrête dès qu'un combat est déclenché, pas la peine de continuer à tester
    }
  }

  return rencontreDeclenchee;
}

  tenterRencontre() {
    const tirage = Math.random();
    const rencontreDeclenchee = tirage < this.tauxActuel;
    console.log(`Test rencontre — taux actuel: ${this.tauxActuel.toFixed(3)}, tirage: ${tirage.toFixed(3)}, résultat: ${rencontreDeclenchee}`);

    if (rencontreDeclenchee) {
      this.reinitialiser();
    } else {
      this.tauxActuel = Math.min(this.tauxActuel + this.augmentation, this.tauxMax);
    }

    return rencontreDeclenchee;
  }

  reinitialiser() {
    this.tauxActuel = this.tauxBase;
  }

  getTauxActuel() {
    return this.tauxActuel;
  }
}