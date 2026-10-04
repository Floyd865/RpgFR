export default class QuestSystem {
  constructor(questsData, etatsInitiaux = {}) {
    this.questsData = questsData;
    // { quete001: { etat: 'en_cours', compteur: 1 } }
    this.etats = { ...etatsInitiaux };
  }

  getEtatQuete(queteId) {
    return this.etats[queteId]?.etat || 'non_commencee';
  }

  getCompteur(queteId) {
    return this.etats[queteId]?.compteur || 0;
  }

  demarrerQuete(queteId) {
    if (this.getEtatQuete(queteId) !== 'non_commencee') return;
    this.etats[queteId] = { etat: 'en_cours', compteur: 0 };
  }

  // À appeler après chaque victoire en combat, avec l'id du monstre vaincu
  enregistrerVictoire(monstreId) {
    this.questsData.quetes.forEach(quete => {
      const etatActuel = this.getEtatQuete(quete.id);
      if (etatActuel !== 'en_cours') return;
      if (quete.objectif.type !== 'vaincre_monstre') return;
      if (quete.objectif.cible !== monstreId) return;

      this.etats[quete.id].compteur++;

      if (this.etats[quete.id].compteur >= quete.objectif.quantite) {
        this.etats[quete.id].etat = 'a_rendre';
      }
    });
  }

  // Valide la quête et retourne sa récompense (à distribuer par l'appelant)
  rendreQuete(queteId) {
    if (this.getEtatQuete(queteId) !== 'a_rendre') return null;

    const quete = this.questsData.quetes.find(q => q.id === queteId);
    this.etats[queteId].etat = 'terminee';

    return quete.recompense;
  }

  getEtatBrut() {
    return { ...this.etats };
  }

  // Nouvelle méthode : à appeler après chaque ajout d'item à l'inventaire
  verifierObjectifsPossession(inventorySystem) {
    this.questsData.quetes.forEach(quete => {
      const etatActuel = this.getEtatQuete(quete.id);
      if (etatActuel !== 'en_cours') return;
      if (quete.objectif.type !== 'posseder_item') return;

      const quantitePossedee = inventorySystem.getQuantite(quete.objectif.cible);

      if (quantitePossedee >= quete.objectif.quantite) {
        this.etats[quete.id].etat = 'a_rendre';
      }
    });
  }
}