import QuizEngine from './QuizEngine.js';
import LootSystem from '../systems/LootSystem.js';

export default class CombatManager {
  constructor(questionsData, monstre, theme, difficulteMax, nombreQuestions = 10, hpJoueurInitial, hpJoueurMax) {
    this.quizEngine = new QuizEngine(questionsData);
    this.monstre = monstre;
    this.hpMonstre = monstre.hp_max;

    this.hpJoueurMax = hpJoueurMax ?? 15;
    this.hpJoueur = hpJoueurInitial ?? this.hpJoueurMax;

    this.serieQuestions = this.quizEngine.genererSerieCombat(theme, difficulteMax, nombreQuestions);
    this.indexQuestion = 0;
    this.bonnesReponses = 0;

    this.etat = 'en_cours';
    this.loot = [];
  }

  getQuestionActuelle() {
    if (this.indexQuestion >= this.serieQuestions.length) return null;
    return this.serieQuestions[this.indexQuestion];
  }

  getNumeroQuestion() { return this.indexQuestion + 1; }
  getHpMonstre() { return this.hpMonstre; }
  getHpMax() { return this.monstre.hp_max; }
  getHpJoueur() { return this.hpJoueur; }
  getHpJoueurMax() { return this.hpJoueurMax; }
  getScore() { return this.bonnesReponses; }
  estTermine() { return this.etat !== 'en_cours'; }
  getEtat() { return this.etat; }
  getLoot() { return this.loot; }

  soumettreReponse(reponseJoueur) {
    const question = this.getQuestionActuelle();
    if (!question || this.etat !== 'en_cours') return null;

    const resultat = this.quizEngine.verifierReponse(question, reponseJoueur);

    if (resultat.correct) {
      this.bonnesReponses++;
      this.hpMonstre--;
    } else {
      this.hpJoueur--;
    }

    this.indexQuestion++;
    this.mettreAJourEtat();

    return resultat;
  }

  // Valide directement la question en cours comme réussie, sans passer par une vraie réponse (effet de l'élixir)
  passerQuestionCommeReussie() {
    if (this.etat !== 'en_cours' || !this.getQuestionActuelle()) return null;

    this.bonnesReponses++;
    this.hpMonstre--;
    this.indexQuestion++;
    this.mettreAJourEtat();

    return { correct: true, score: 1, total: 1, viaJoker: true };
  }

  // Restaure des PV au joueur (effet de la potion), sans dépasser le max
  soigner(valeur) {
    this.hpJoueur = Math.min(this.hpJoueur + valeur, this.hpJoueurMax);
  }

  mettreAJourEtat() {
    if (this.hpMonstre <= 0) {
        this.etat = 'victoire';
        this.loot = LootSystem.genererLoot(this.monstre.loot_table || []);
    } else if (this.hpJoueur <= 0) {
        this.etat = 'mort';
    } else if (this.indexQuestion >= this.serieQuestions.length) {
        this.etat = 'defaite';
    }
  }
}