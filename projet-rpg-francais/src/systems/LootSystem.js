export default class LootSystem {
  static genererLoot(lootTable) {
    const butin = [];

    for (const entree of lootTable) {
      const tirage = Math.random();

      if (tirage < entree.chance) {
        const quantite = this.entierAleatoire(entree.quantite_min, entree.quantite_max);
        butin.push({ item_id: entree.item_id, quantite });
      }
    }

    return butin;
  }

  static entierAleatoire(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}