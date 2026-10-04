import Phaser from 'phaser';
import CombatManager from '../combat/CombatManager.js';
import questionsData from '../../data/questions.json';
import monstersData from '../../data/monsters.json';
import itemsData from '../../data/items.json';
import { melanger } from '../utils/shuffle.js';
import XPSystem from '../systems/XPSystem.js';
import InventorySystem from '../systems/InventorySystem.js';
import QuestSystem from '../systems/QuestSystem.js';
import SaveManager from '../systems/SaveManager.js';
import questsData from '../../data/quests.json';
import HealthSystem from '../systems/HealthSystem.js';

export default class CombatScene extends Phaser.Scene {
  constructor() {
    super('CombatScene');
  }

  init(data) {
    this.theme = data.theme || 'conjugaison';
    this.difficulteMax = data.difficulteMax || 2;
    this.monstreId = data.monstreId || null;
    this.zoneRetour = data.zoneRetour;
    this.positionRetour = data.positionRetour;
    this.xpSystem = data.xpSystem;
    this.inventorySystem = data.inventorySystem;
    this.questSystem = data.questSystem;
    this.healthSystem = data.healthSystem;
  }

  preload() {
    this.load.image('monstre_fotogre', 'assets/sprites/monstres/monstre_fotogre.png');
    this.load.image('monstre_vocabulon', 'assets/sprites/monstres/monstre_vocabulon.png');
    this.load.image('monstre_orthograffiti', 'assets/sprites/monstres/monstre_orthograffiti.png');
    this.load.image('monstre_gardien', 'assets/sprites/monstres/monstre_gardien.png');
  }

  create() {
    this.cameras.main.setBackgroundColor('#2b1a1a');

    const monstre = this.monstreId
    ? monstersData.monstres.find(m => m.id === this.monstreId)
    : monstersData.monstres.find(m => m.theme_associe === this.theme) || monstersData.monstres[0];
    const etatHp = this.healthSystem.getEtat();
    this.combatManager = new CombatManager(questionsData, monstre, this.theme, this.difficulteMax, 10, etatHp.hp, etatHp.hpMax);

    this.enTraitement = false;
    this.combatTermine = false;
    this.reponsesThemeSort = {};

    this.creerMonstre();
    this.creerUI();
    this.afficherQuestion();
  }

  creerMonstre() {
    const monstre = this.combatManager.monstre;

    this.spriteMonstre = this.add.image(640, 180, monstre.sprite).setScale(1.5);

    this.texteNomMonstre = this.add.text(640, 90, monstre.nom, {
      fontSize: '26px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.barreHpFond = this.add.rectangle(640, 260, 200, 20, 0x333333);
    this.barreHp = this.add.rectangle(640, 260, 200, 20, 0xdd3333);

    this.texteHp = this.add.text(640, 285, '', {
      fontSize: '16px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.mettreAJourBarreHp();
  }

  mettreAJourBarreHp() {
    const ratio = Math.max(this.combatManager.getHpMonstre() / this.combatManager.getHpMax(), 0);
    this.barreHp.width = 200 * ratio;
    this.texteHp.setText(`${this.combatManager.getHpMonstre()} / ${this.combatManager.getHpMax()} PV`);
  }

  jouerAnimationDegats() {
    this.spriteMonstre.setTint(0xff5555);
    this.tweens.add({
      targets: this.spriteMonstre,
      x: this.spriteMonstre.x + 10,
      duration: 50,
      yoyo: true,
      repeat: 3,
      onComplete: () => this.spriteMonstre.clearTint()
    });
  }

  mettreAJourTexteHpJoueur() {
    this.texteHpJoueur.setText(`PV : ${this.combatManager.getHpJoueur()} / ${this.combatManager.getHpJoueurMax()}`);
  }

  positionnerBoutonObjets() {
    const canvas = this.sys.game.canvas;
    const rect = canvas.getBoundingClientRect();
    this.boutonObjets.style.left = `${rect.left + 1080}px`;
    this.boutonObjets.style.top = `${rect.top + 20}px`;
  }

  ouvrirPanneauObjets() {
    if (this.enTraitement) return;

    const items = this.inventorySystem.getContenuDetaille()
        .map(i => ({ ...i, infoComplete: itemsData.items.find(x => x.id === i.id) }))
        .filter(i => i.infoComplete?.effet); // seuls les items avec un effet sont utilisables

    // Fond semi-transparent + panneau, créés en HTML par-dessus tout le reste
    const panneau = document.createElement('div');
    panneau.style.position = 'fixed';
    panneau.style.top = '0';
    panneau.style.left = '0';
    panneau.style.width = '100%';
    panneau.style.height = '100%';
    panneau.style.backgroundColor = 'rgba(0,0,0,0.7)';
    panneau.style.display = 'flex';
    panneau.style.alignItems = 'center';
    panneau.style.justifyContent = 'center';
    panneau.style.zIndex = '1000';

    const boite = document.createElement('div');
    boite.style.backgroundColor = '#222';
    boite.style.padding = '20px';
    boite.style.borderRadius = '8px';
    boite.style.minWidth = '300px';
    boite.style.color = '#ffffff';

    const titre = document.createElement('h3');
    titre.textContent = 'Utiliser un objet';
    boite.appendChild(titre);

    if (items.length === 0) {
        const vide = document.createElement('p');
        vide.textContent = "Tu n'as aucun objet utilisable.";
        boite.appendChild(vide);
    }

    items.forEach(item => {
        const ligne = document.createElement('button');
        ligne.textContent = `${item.nom} (x${item.quantite})`;
        ligne.style.display = 'block';
        ligne.style.width = '100%';
        ligne.style.margin = '6px 0';
        ligne.style.padding = '10px';
        ligne.style.cursor = 'pointer';

        ligne.addEventListener('click', () => {
        document.body.removeChild(panneau);
        this.utiliserObjet(item.id, item.infoComplete.effet);
        });

        boite.appendChild(ligne);
    });

    const boutonFermer = document.createElement('button');
    boutonFermer.textContent = 'Annuler';
    boutonFermer.style.marginTop = '10px';
    boutonFermer.style.padding = '8px 16px';
    boutonFermer.style.cursor = 'pointer';
    boutonFermer.addEventListener('click', () => document.body.removeChild(panneau));
    boite.appendChild(boutonFermer);

    panneau.appendChild(boite);
    document.body.appendChild(panneau);
  }

  utiliserObjet(itemId, effet) {
    if (effet.type === 'soin') {
        if (this.combatManager.getHpJoueur() >= this.combatManager.getHpJoueurMax()) {
        this.texteFeedback.setText('PV déjà au maximum !').setColor('#ffaa00');
        this.time.delayedCall(1000, () => this.texteFeedback.setText(''));
        return; // on sort avant de retirer l'objet de l'inventaire
        }

        this.inventorySystem.retirerItem(itemId, 1);
        this.combatManager.soigner(effet.valeur);
        this.mettreAJourTexteHpJoueur();
        this.texteFeedback.setText(`+${effet.valeur} PV !`).setColor('#88ff88');
        this.time.delayedCall(1000, () => this.texteFeedback.setText(''));

    } else if (effet.type === 'joker') {
        this.inventorySystem.retirerItem(itemId, 1);

        const resultat = this.combatManager.passerQuestionCommeReussie();
        this.mettreAJourBarreHp();
        this.jouerAnimationDegats();
        this.zoneReponse.innerHTML = '';
        this.texteFeedback.setText('Question réussie automatiquement !').setColor('#88ff88');

        this.enTraitement = true;
        this.time.delayedCall(1200, () => {
        this.enTraitement = false;
        this.afficherQuestion();
        });
    }
  }

  creerUI() {
    this.texteQuestion = this.add.text(640, 330, '', {
      fontSize: '26px', color: '#ffffff', align: 'center', wordWrap: { width: 900 }
    }).setOrigin(0.5);

    this.zoneReponse = document.createElement('div');
    this.zoneReponse.style.position = 'absolute';
    document.body.appendChild(this.zoneReponse);
    this.positionnerZoneReponse();

    this.texteFeedback = this.add.text(640, 620, '', { fontSize: '24px', color: '#ffff00' }).setOrigin(0.5);
    this.texteScore = this.add.text(20, 20, '', { fontSize: '18px', color: '#ffffff' });

    this.texteHpJoueur = this.add.text(20, 45, '', {
        fontSize: '18px',
        color: '#ff8888'
    });
    this.mettreAJourTexteHpJoueur();

    this.boutonObjets = document.createElement('button');
    this.boutonObjets.textContent = '🎒 Objets';
    this.boutonObjets.style.position = 'absolute';
    this.boutonObjets.style.padding = '8px 16px';
    this.boutonObjets.style.cursor = 'pointer';
    this.boutonObjets.style.fontSize = '16px';
    document.body.appendChild(this.boutonObjets);
    this.positionnerBoutonObjets();

    this.boutonObjets.addEventListener('click', () => this.ouvrirPanneauObjets());
  }

  positionnerZoneReponse() {
    const canvas = this.sys.game.canvas;
    const rect = canvas.getBoundingClientRect();
    this.zoneReponse.style.left = `${rect.left + 340}px`;
    this.zoneReponse.style.top = `${rect.top + 420}px`;
    this.zoneReponse.style.width = '600px';
    this.zoneReponse.style.textAlign = 'center';
  }

  afficherQuestion() {
    if (this.combatManager.estTermine()) {
        this.terminerCombat();
        return;
    }

    const question = this.combatManager.getQuestionActuelle();
    this.zoneReponse.innerHTML = '';
    this.texteFeedback.setText('');
    this.texteScore.setText(`Question ${this.combatManager.getNumeroQuestion()} — Score : ${this.combatManager.getScore()}`);

    if (question.type === 'theme_sort') {
        this.afficherThemeSort(question);
    } else if (question.type === 'multiple_choice') {
        this.afficherMultipleChoice(question);
    } else {
        this.afficherSaisieTexte(question);
    }
  }
  afficherSaisieTexte(question) {
    if (question.type === 'phrase_builder') {
        const motsMelanges = melanger(question.mots);
        this.texteQuestion.setText(motsMelanges.join(' / '));
    } else {
        this.texteQuestion.setText(question.phrase || '');
    }

    const input = document.createElement('input');
    input.type = 'text';
    input.style.fontSize = '20px';
    input.style.padding = '8px';
    input.style.width = '300px';
    input.addEventListener('keydown', (e) => {
        e.stopPropagation();
        if (e.key === 'Enter') this.validerSaisieTexte(input.value);
    });

    this.zoneReponse.appendChild(input);
    input.focus();
  }

  validerSaisieTexte(valeurBrute) {
    if (this.enTraitement) return;

    const question = this.combatManager.getQuestionActuelle();
    let reponseJoueur = valeurBrute;

    if (question.type === 'phrase_builder') {
      reponseJoueur = reponseJoueur.trim().split(/\s+/);
    }

    this.traiterResultat(this.combatManager.soumettreReponse(reponseJoueur));
  }

  afficherThemeSort(question) {
    this.texteQuestion.setText(question.question || 'Classe ces mots');
    this.reponsesThemeSort = {};

    const motsMelanges = melanger(question.mots_a_classer);
    const categoriesMelangees = melanger(question.categories);

    motsMelanges.forEach(item => {
        const ligne = document.createElement('div');
        ligne.style.marginBottom = '10px';
        ligne.style.color = '#ffffff';
        ligne.style.fontSize = '18px';
        ligne.style.textAlign = 'left';

        const label = document.createElement('span');
        label.textContent = `${item.mot} : `;
        label.style.marginRight = '10px';
        ligne.appendChild(label);

        categoriesMelangees.forEach(categorie => {
        const bouton = document.createElement('button');
        bouton.textContent = categorie;
        bouton.style.marginRight = '6px';
        bouton.style.padding = '4px 10px';
        bouton.style.cursor = 'pointer';

        bouton.addEventListener('click', () => {
            this.reponsesThemeSort[item.mot] = categorie;
            ligne.querySelectorAll('button').forEach(b => b.style.backgroundColor = '');
            bouton.style.backgroundColor = '#4a90d9';
        });

        ligne.appendChild(bouton);
        });

        this.zoneReponse.appendChild(ligne);
    });

    const boutonValider = document.createElement('button');
    boutonValider.textContent = 'Valider';
    boutonValider.style.marginTop = '15px';
    boutonValider.style.padding = '8px 20px';
    boutonValider.style.cursor = 'pointer';
    boutonValider.addEventListener('click', () => this.validerThemeSort(question));

    this.zoneReponse.appendChild(boutonValider);
  }

  validerThemeSort(question) {
    if (this.enTraitement) return;

    const tousClasses = question.mots_a_classer.every(item => this.reponsesThemeSort[item.mot]);
    if (!tousClasses) {
      this.texteFeedback.setText('Classe tous les mots avant de valider !').setColor('#ffaa00');
      return;
    }

    this.traiterResultat(this.combatManager.soumettreReponse(this.reponsesThemeSort));
  }

  afficherMultipleChoice(question) {
    this.texteQuestion.setText(question.question);

    const optionsMelangees = melanger(question.options);

    optionsMelangees.forEach(option => {
        const bouton = document.createElement('button');
        bouton.textContent = option;
        bouton.style.display = 'block';
        bouton.style.margin = '8px auto';
        bouton.style.padding = '10px 24px';
        bouton.style.fontSize = '18px';
        bouton.style.cursor = 'pointer';
        bouton.style.width = '280px';

        bouton.addEventListener('click', () => this.validerMultipleChoice(option));

        this.zoneReponse.appendChild(bouton);
    });
  }

  validerMultipleChoice(optionChoisie) {
    if (this.enTraitement) return;

    this.traiterResultat(this.combatManager.soumettreReponse(optionChoisie));
  }

  traiterResultat(resultat) {
    this.enTraitement = true;

    if (resultat.correct) {
        this.mettreAJourBarreHp();
        this.jouerAnimationDegats();
        this.texteFeedback.setText('Correct ! Coup porté !').setColor('#00ff00');
    } else {
        const details = resultat.total > 1 ? ` (${resultat.score}/${resultat.total} bons)` : '';
        this.texteFeedback.setText(`Faux${details}`).setColor('#ff0000');
        this.mettreAJourTexteHpJoueur(); // ← nouvelle ligne
    }

    this.zoneReponse.innerHTML = '';

    this.time.delayedCall(1200, () => {
        this.enTraitement = false;
        this.afficherQuestion();
    });
  }

  terminerCombat() {
    if (this.combatTermine) return;
    this.combatTermine = true;

    this.zoneReponse.remove();
    this.boutonObjets.remove();
    this.texteFeedback.setText('');
    this.texteScore.setText('');

    const etat = this.combatManager.getEtat();

    if (etat === 'victoire') {
        // Resynchronise les PV actuels (potentiellement soignés en combat) avant de repartir
        this.healthSystem.hp = this.combatManager.getHpJoueur();

        const monstre = this.combatManager.monstre;
        const resultatXp = this.xpSystem.ajouterXp(monstre.xp_gain);
        const loot = this.combatManager.getLoot();

        this.inventorySystem.ajouterButin(loot);
        this.questSystem.enregistrerVictoire(monstre.id);
        this.questSystem.verifierObjectifsPossession(this.inventorySystem);

        let messageXp = `${monstre.nom} est vaincu ! +${monstre.xp_gain} XP`;
        if (resultatXp.niveauxGagnes.length > 0) {
        messageXp += `\nNiveau supérieur ! Niveau ${resultatXp.niveauActuel} !`;
        }
        if (loot.length > 0) {
        const detailsLoot = loot.map(l => {
            const info = itemsData.items.find(i => i.id === l.item_id);
            return `${info?.nom || l.item_id} x${l.quantite}`;
        }).join(', ');
        messageXp += `\nObtenu : ${detailsLoot}`;
        }

        this.texteQuestion.setText(messageXp);
        this.tweens.add({
        targets: this.spriteMonstre,
        alpha: 0,
        y: this.spriteMonstre.y - 40,
        duration: 800
        });

        this.time.delayedCall(2500, () => this.retourExploration());

    } else if (etat === 'mort') {
        // Pas de resynchronisation ici : on veut repartir pleins PV au respawn
        this.texteQuestion.setText('Tu as été vaincu...\nRetour au dernier point de sauvegarde.');
        this.time.delayedCall(2500, () => this.retourAuDernierPointDeSauvegarde());

    } else {
        // Défaite par questions épuisées : les PV restants sont conservés aussi
        this.healthSystem.hp = this.combatManager.getHpJoueur();
        this.texteQuestion.setText(`Combat terminé — ${this.combatManager.getScore()} bonnes réponses, le monstre résiste encore.`);
        this.time.delayedCall(2000, () => this.retourExploration());
    }
  }

  retourExploration() {
    this.scene.start('ExplorationScene', {
        zoneRetour: this.zoneRetour,
        positionRetour: this.positionRetour,
        xpSystem: this.xpSystem,
        inventorySystem: this.inventorySystem,
        questSystem: this.questSystem,
        healthSystem: this.healthSystem
    });
  }

  retourAuDernierPointDeSauvegarde() {
    const slot = this.registry.get('slotActif') || 1;
    const sauvegarde = SaveManager.charger(slot);

    if (!sauvegarde) {
        this.retourExploration();
        return;
    }

    const xpSystem = new XPSystem({
        niveau: sauvegarde.niveau,
        xpActuelle: sauvegarde.xpActuelle,
        xpBase: sauvegarde.xpBase,
        multiplicateur: sauvegarde.xpMultiplicateur
    });

    const inventorySystem = new InventorySystem(itemsData, sauvegarde.inventaire || {});
    const questSystem = new QuestSystem(questsData, sauvegarde.quetes || {});
    const healthSystem = new HealthSystem({ hpMax: sauvegarde.hpMax ?? 15 }); // repart pleins PV volontairement

    this.scene.start('ExplorationScene', {
        zoneRetour: sauvegarde.zone,
        positionRetour: sauvegarde.position,
        xpSystem,
        inventorySystem,
        questSystem,
        healthSystem
    });
  }
}