import Phaser from 'phaser';
import Player from '../entities/Player.js';
import zonesData from '../../data/zones.json';
import EncounterSystem from '../systems/EncounterSystem.js';
import XPSystem from '../systems/XPSystem.js';
import SaveManager from '../systems/SaveManager.js';
import InventorySystem from '../systems/InventorySystem.js';
import itemsData from '../../data/items.json';
import npcsData from '../../data/npcs.json';
import NPC from '../entities/NPC.js';
import QuestSystem from '../systems/QuestSystem.js';
import questsData from '../../data/quests.json';
import SavePoint from '../entities/SavePoint.js';
import HealthSystem from '../systems/HealthSystem.js';

export default class ExplorationScene extends Phaser.Scene {
  constructor() {
    super('ExplorationScene');
  }

  preload() {
    this.load.image('obstacle_placeholder', '../../public/assets/sprites/obstacles/rocher_placeholder.png');
    this.load.image('obstacle_foret', '../../public/assets/sprites/obstacles/arbre_placeholder.png');
    this.load.image('obstacle_village', 'assets/sprites/obstacles/obstacle_village.png');
    this.load.image('obstacle_montagne', 'assets/sprites/obstacles/obstacle_montagne.png');

    this.load.image('fond_zone_test', '../../public/assets/zones/fond_zone_test.png');
    this.load.image('fond_zone_foret', '../../public/assets/zones/fond_zone_foret.png');
    this.load.image('fond_zone_village', '../../public/assets/zones/fond_zone_village.png');
    this.load.image('fond_zone_montagne', '../../public/assets/zones/fond_zone_montagne.png');

    this.load.image('pnj_madame_grammaire', 'assets/sprites/pnj/pnj_madame_grammaire.png');
    this.load.image('pnj_vieux_sylvain', 'assets/sprites/pnj/pnj_vieux_sylvain.png');
    this.load.image('pnj_marchande', 'assets/sprites/pnj/pnj_marchande.png');
    this.load.image('pnj_ermite', 'assets/sprites/pnj/pnj_ermite.png');

    this.load.image('point_sauvegarde', 'assets/sprites/ui/point_sauvegarde.png');

    // Icônes d'objets, pour l'inventaire
    this.load.image('item_potion', 'assets/sprites/items/item_potion.png');
    this.load.image('item_piece', 'assets/sprites/items/item_piece.png');
    this.load.image('item_plume', 'assets/sprites/items/item_plume.png');
    this.load.image('item_elixir', 'assets/sprites/items/item_elixir.png');
    this.load.image('item_gemme', 'assets/sprites/items/item_gemme.png');
    this.load.image('item_cle_donjon', 'assets/sprites/items/item_cle_donjon.png');
    this.load.image('item_cle_rouillee', 'assets/sprites/items/item_cle_rouillee.png');

    this.load.image('fond_donjon_1', 'assets/zones/fond_donjon_1.png');
    this.load.image('fond_donjon_2', 'assets/zones/fond_donjon_2.png');
    this.load.image('fond_donjon_3', 'assets/zones/fond_donjon_3.png');
    this.load.image('obstacle_donjon', 'assets/sprites/obstacles/obstacle_donjon.png');
    this.load.image('porte_scellee', 'assets/sprites/pnj/porte_scellee.png');
  }

  create(data) {
    this.slotActif = this.registry.get('slotActif') || 1; // sécurité si jamais on arrive ici sans passer par le menu

    this.obstacles = undefined;
    this.sorties = undefined;
    this.fondZone = undefined;
    this.pnjs = undefined;
    this.pointsSauvegarde = undefined;

    this.player = new Player(this, 0, 0);
    this.player.sprite.setCollideWorldBounds(true);
    this.cameras.main.startFollow(this.player.sprite);

    let zoneDepart, spawnDepart;

    if (data?.zoneRetour) {
        // Retour depuis un combat : priorité aux données transmises en mémoire
        this.xpSystem = data.xpSystem;
        this.inventorySystem = data.inventorySystem;
        this.questSystem = data.questSystem;
        this.healthSystem = data.healthSystem || new HealthSystem(); 
        zoneDepart = data.zoneRetour;
        spawnDepart = data.positionRetour;
    } else {
        // Premier lancement de la scène : on tente de charger une sauvegarde
        const sauvegarde = SaveManager.charger(this.slotActif);

        if (sauvegarde) {
            this.xpSystem = new XPSystem({
                niveau: sauvegarde.niveau,
                xpActuelle: sauvegarde.xpActuelle,
                xpBase: sauvegarde.xpBase,
                multiplicateur: sauvegarde.xpMultiplicateur
            });
            this.inventorySystem = new InventorySystem(itemsData, sauvegarde.inventaire || {});
            this.questSystem = new QuestSystem(questsData, sauvegarde.quetes || {});
            this.healthSystem = new HealthSystem({
                hpMax: sauvegarde.hpMax ?? 15,
                hp: sauvegarde.hp ?? (sauvegarde.hpMax ?? 15) // repart pleins PV si absent d'une ancienne sauvegarde
            });
            zoneDepart = sauvegarde.zone;
            spawnDepart = sauvegarde.position;
        } else {
            // Aucune sauvegarde : état par défaut, comme avant
            this.xpSystem = new XPSystem();
            this.inventorySystem = new InventorySystem(itemsData);
            this.questSystem = new QuestSystem(questsData);
            this.healthSystem = new HealthSystem({ hpMax: 15 }); // état par défaut, comme avant
            zoneDepart = 'zone_test';
            spawnDepart = zonesData.zone_test.spawn_defaut;
        }
    }

    this.loadZone(zoneDepart, spawnDepart);

    this.encounterSystem = new EncounterSystem({
        tauxBase: 0.03,
        augmentation: 0.02,
        tauxMax: 0.4,
        distancePourUnPas: 128
    });

    this.texteXP = this.add.text(20, 20, '', { fontSize: '18px', color: '#ffffff' });
    this.texteXP.setScrollFactor(0);
    this.mettreAJourTexteXP();

    this.texteHpJoueur = this.add.text(20, 45, '', { fontSize: '18px', color: '#ff8888' }).setScrollFactor(0);
    this.mettreAJourTexteHpJoueur();

    // Sauvegarde automatique à chaque entrée dans une zone
    this.sauvegarderPartie();

    this.input.keyboard.on('keydown-I', () => {
        this.scene.pause();
        this.scene.launch('InventoryScene', { inventorySystem: this.inventorySystem });
    });

        // Touches de debug — reset complet ou partiel
    this.input.keyboard.on('keydown-T', () => this.resetQuetes());
    this.input.keyboard.on('keydown-R', () => this.resetJeuComplet());

    this.input.keyboard.on('keydown-Q', () => {
        this.scene.pause();
        this.scene.launch('QuestBoardScene', { questSystem: this.questSystem, inventorySystem: this.inventorySystem });
    });

    this.texteInteraction = this.add.text(640, 500, '', {
        fontSize: '18px',
        color: '#ffff00'
        }).setOrigin(0.5).setScrollFactor(0);

        this.pnjProche = null;

        this.input.keyboard.on('keydown-E', () => {
          if (!this.interactionProche) return;

          if (this.interactionProche.type === 'pnj') {
            this.interagirAvecPnj(this.interactionProche.objet);
          } else if (this.interactionProche.type === 'sauvegarde') {
            this.sauvegarderAvecFeedback();
          }
        });
  }

  mettreAJourTexteXP() {
    const etat = this.xpSystem.getEtat();
    this.texteXP.setText(`Niveau ${etat.niveau} — XP: ${etat.xpActuelle} / ${etat.xpRequise}`);
  }

  mettreAJourTexteHpJoueur() {
    const etat = this.healthSystem.getEtat();
    this.texteHpJoueur.setText(`PV : ${etat.hp} / ${etat.hpMax}`);
  }

  sauvegarderPartie() {
    const etatXp = this.xpSystem.getEtat();
    const etatHp = this.healthSystem.getEtat();

    SaveManager.sauvegarder(this.slotActif, {
        zone: this.zoneActuelle,
        position: { x: this.player.sprite.x, y: this.player.sprite.y },
        niveau: etatXp.niveau,
        xpActuelle: etatXp.xpActuelle,
        xpBase: this.xpSystem.xpBase,
        xpMultiplicateur: this.xpSystem.multiplicateur,   
        inventaire: this.inventorySystem.getEtatBrut(),
        quetes: this.questSystem.getEtatBrut(),
        hp: etatHp.hp,
        hpMax: etatHp.hpMax
    });
  }

  loadZone(nomZone, positionSpawn) {
    const zone = zonesData[nomZone];
    this.zoneActuelle = nomZone;
    this.themeActuel = zone.theme;
    this.difficulteMaxActuelle = zone.difficulte_max;
    this.monstreIdActuel = zone.monstre_id || null;

    if (this.obstacles) this.obstacles.clear(true, true);
    if (this.sorties) this.sorties.forEach(s => s.destroy());
    if (this.fondZone) this.fondZone.destroy(); // nettoyage de l'ancien fond

    this.cameras.main.setBackgroundColor(zone.fond_couleur);

    // Affiche l'image de fond, ancrée en haut à gauche (0,0), à sa taille réelle
    this.fondZone = this.add.image(0, 0, zone.fond_image).setOrigin(0, 0);
    this.fondZone.setDepth(-1); // s'assure qu'elle reste bien derrière le joueur/obstacles

    this.physics.world.setBounds(0, 0, zone.largeur, zone.hauteur);
    this.cameras.main.setBounds(0, 0, zone.largeur, zone.hauteur);
    this.player.sprite.setPosition(positionSpawn.x, positionSpawn.y);

    // Évite de compter la téléportation comme un déplacement à pied
    this.lastX = positionSpawn.x;
    this.lastY = positionSpawn.y;

    const texture = zone.texture_obstacle;
    this.obstacles = this.physics.add.staticGroup();
    zone.obstacles.forEach(element => {
        this.obstacles.create(element.x, element.y, texture);
    });
    this.physics.add.collider(this.player.sprite, this.obstacles);

    this.sorties = [];
    zone.sorties.forEach(sortie => {
        const trigger = this.add.zone(
        sortie.declencheur.x, sortie.declencheur.y,
        sortie.declencheur.largeur, sortie.declencheur.hauteur
        );
        this.physics.add.existing(trigger, true);
        this.physics.add.overlap(this.player.sprite, trigger, () => {
        this.loadZone(sortie.vers, sortie.spawn_arrivee);
        });
        this.sorties.push(trigger);
    });

    if (this.pnjs) this.pnjs.forEach(p => p.sprite.destroy());

        this.pnjs = npcsData.pnjs
        .filter(p => p.zone === nomZone)
        .map(p => new NPC(this, p));

    // Nettoyage des anciens points de sauvegarde
    if (this.pointsSauvegarde) this.pointsSauvegarde.forEach(p => p.sprite.destroy());

        this.pointsSauvegarde = (zone.points_sauvegarde || []).map(
        pos => new SavePoint(this, pos.x, pos.y)
    );
    }

  update() {
    // Distance parcourue depuis la frame précédente (mouvement déjà appliqué par le moteur physique)
    const distance = Phaser.Math.Distance.Between(
        this.lastX, this.lastY,
        this.player.sprite.x, this.player.sprite.y
    );

    this.player.update(); // définit la vélocité pour la prochaine étape physique

    const rencontre = this.encounterSystem.enregistrerDeplacement(distance);
    if (rencontre) {
        this.declencherCombat();
    }

    // Mémorise la position actuelle pour la comparaison de la prochaine frame
    this.lastX = this.player.sprite.x;
    this.lastY = this.player.sprite.y;

    this.verifierProximiteInteraction();
  }

  declencherCombat() {
    const positionActuelle = { x: this.player.sprite.x, y: this.player.sprite.y };
    this.scene.start('CombatScene', {
        theme: this.themeActuel,
        difficulteMax: this.difficulteMaxActuelle,
        monstreId: this.monstreIdActuel,
        zoneRetour: this.zoneActuelle,
        positionRetour: positionActuelle,
        xpSystem: this.xpSystem,    
        inventorySystem: this.inventorySystem,
        questSystem: this.questSystem,
        healthSystem: this.healthSystem
    });
  }

  verifierProximiteInteraction() {
    const distanceMax = 80;
    let plusProche = null;
    let distanceMin = distanceMax;

    for (const pnj of this.pnjs) {
        const distance = Phaser.Math.Distance.Between(
        this.player.sprite.x, this.player.sprite.y,
        pnj.sprite.x, pnj.sprite.y
        );
        if (distance < distanceMin) {
        distanceMin = distance;
        plusProche = { type: 'pnj', objet: pnj };
        }
    }

    for (const point of this.pointsSauvegarde) {
        const distance = Phaser.Math.Distance.Between(
        this.player.sprite.x, this.player.sprite.y,
        point.sprite.x, point.sprite.y
        );
        if (distance < distanceMin) {
        distanceMin = distance;
        plusProche = { type: 'sauvegarde', objet: point };
        }
    }

    this.interactionProche = plusProche;

    if (!plusProche) {
        this.texteInteraction.setText('');
    } else if (plusProche.type === 'pnj') {
        this.texteInteraction.setText(`Appuie sur E pour parler à ${plusProche.objet.nom}`);
    } else {
        this.texteInteraction.setText('Appuie sur E pour sauvegarder');
    }
  }
  
  interagirAvecPnj(pnj) {
    const quetesDuPnj = questsData.quetes.filter(q => q.pnj_id === pnj.id);

    // Pas de quête associée à ce PNJ : dialogue simple, comme avant
    if (quetesDuPnj.length === 0) {
        this.scene.pause();
        this.scene.launch('DialogueScene', { nom: pnj.nom, dialogue: pnj.dialogue });
        return;
    }

    // Cherche la première quête pas encore terminée (dans l'ordre du fichier quests.json)
    // Si toutes sont terminées, on retombe sur la dernière (son dialogue_terminee)
    const quete = quetesDuPnj.find(q => this.questSystem.getEtatQuete(q.id) !== 'terminee')
        || quetesDuPnj[quetesDuPnj.length - 1];

    const etatQuete = this.questSystem.getEtatQuete(quete.id);
    let lignes, onFermeture;

    switch (etatQuete) {
        case 'non_commencee':
        lignes = quete.dialogue_avant;
        onFermeture = () => {
            this.questSystem.demarrerQuete(quete.id);
            this.sauvegarderPartie();
        };
        break;

        case 'en_cours':
        lignes = quete.dialogue_en_cours;
        onFermeture = null;
        break;

        case 'a_rendre':
        lignes = quete.dialogue_recompense;
        onFermeture = () => {
            const recompense = this.questSystem.rendreQuete(quete.id);
            if (recompense) {
            this.xpSystem.ajouterXp(recompense.xp);
            if (recompense.items) this.inventorySystem.ajouterButin(recompense.items);
            }
            if (quete.consomme_objectif && quete.objectif.type === 'posseder_item') {
            this.inventorySystem.retirerItem(quete.objectif.cible, quete.objectif.quantite);
            }
            this.mettreAJourTexteXP();
            this.sauvegarderPartie();
        };
        break;

        case 'terminee':
        default:
        lignes = quete.dialogue_terminee;
        onFermeture = null;
        break;
    }

    this.scene.pause();
    this.scene.launch('DialogueScene', { nom: pnj.nom, dialogue: lignes, onFermeture });
  }

  resetJeuComplet() {
    const confirmation = window.confirm('Réinitialiser complètement la partie ? Cette action est irréversible.');
    if (!confirmation) return;

    SaveManager.supprimer(this.slotActif);
    window.location.reload();
  }

  resetQuetes() {
    const confirmation = window.confirm('Réinitialiser toutes les quêtes ?');
    if (!confirmation) return;

    this.questSystem = new QuestSystem(questsData); // nouvel état vierge
    this.sauvegarderPartie(); // écrase la sauvegarde avec ce nouvel état
  }

  sauvegarderAvecFeedback() {
    this.sauvegarderPartie();

    const texteConfirmation = this.add.text(
        this.player.sprite.x, this.player.sprite.y - 50,
        'Partie sauvegardée !',
        { fontSize: '18px', color: '#88ff88' }
    ).setOrigin(0.5);

    // Fait remonter et disparaître le texte, puis le détruit
    this.tweens.add({
        targets: texteConfirmation,
        y: texteConfirmation.y - 30,
        alpha: 0,
        duration: 1200,
        onComplete: () => texteConfirmation.destroy()
    });
  }
}