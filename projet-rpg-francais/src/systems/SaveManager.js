export default class SaveManager {
  static getCle(slot) {
    return `rpg_francais_save_slot${slot}`;
  }

  static sauvegarder(slot, donnees) {
    try {
      localStorage.setItem(this.getCle(slot), JSON.stringify(donnees));
      return true;
    } catch (erreur) {
      console.error('Erreur lors de la sauvegarde :', erreur);
      return false;
    }
  }

  static charger(slot) {
    try {
      const brut = localStorage.getItem(this.getCle(slot));
      if (!brut) return null;
      return JSON.parse(brut);
    } catch (erreur) {
      console.error('Erreur lors du chargement :', erreur);
      return null;
    }
  }

  static supprimer(slot) {
    localStorage.removeItem(this.getCle(slot));
  }

  static existe(slot) {
    return localStorage.getItem(this.getCle(slot)) !== null;
  }
}