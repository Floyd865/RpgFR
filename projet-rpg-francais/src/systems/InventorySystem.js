export default class InventorySystem {
  constructor(itemsData, contenuInitial = {}) {
    this.itemsData = itemsData; // le JSON complet items.json, pour retrouver nom/description
    this.contenu = { ...contenuInitial }; // { item_id: quantite }
  }

  ajouterItem(itemId, quantite = 1) {
    this.contenu[itemId] = (this.contenu[itemId] || 0) + quantite;
  }

  retirerItem(itemId, quantite = 1) {
    if (!this.contenu[itemId] || this.contenu[itemId] < quantite) {
      return false; // pas assez de cet item pour le retirer
    }

    this.contenu[itemId] -= quantite;
    if (this.contenu[itemId] <= 0) {
      delete this.contenu[itemId];
    }

    return true;
  }

  getQuantite(itemId) {
    return this.contenu[itemId] || 0;
  }

  // Ajoute plusieurs items d'un coup (pratique pour intégrer directement le résultat de LootSystem)
  ajouterButin(butin) {
    butin.forEach(({ item_id, quantite }) => this.ajouterItem(item_id, quantite));
  }

  // Retourne la liste complète avec les infos détaillées (nom, description) pour l'affichage
  getContenuDetaille() {
    return Object.entries(this.contenu).map(([itemId, quantite]) => {
      const infoItem = this.itemsData.items.find(i => i.id === itemId);
      return {
        id: itemId,
        nom: infoItem?.nom || itemId,
        description: infoItem?.description || '',
        sprite: infoItem?.sprite || null,
        quantite
      };
    });
  }

  // Pour la sauvegarde : retourne juste les données brutes (pas besoin de itemsData)
  getEtatBrut() {
    return { ...this.contenu };
  }
}