import { verifierPhraseBuilder } from './questionTypes/PhraseBuilder.js';
import { verifierFillBlank } from './questionTypes/FillBlank.js';
import { verifierThemeSort } from './questionTypes/ThemeSort.js';
import { verifierMultipleChoice } from './questionTypes/MultipleChoice.js';

export default class QuizEngine {
  constructor(questionsData) {
    this.questionsData = questionsData; // le JSON complet questions.json
  }

  // Récupère toutes les questions d'un thème donné (toutes racines confondues)
  getQuestionsByTheme(theme) {
    const racines = this.questionsData.themes[theme]?.racines;
    if (!racines) return [];

    return Object.values(racines).flat();
  }

  // Récupère les questions d'une racine précise
  getQuestionsByRacine(theme, racine) {
    return this.questionsData.themes[theme]?.racines[racine] || [];
  }

  // Filtre par difficulté (utile pour adapter selon la zone/le niveau du joueur)
  filterByDifficulte(questions, difficulteMax) {
    return questions.filter(q => q.difficulte <= difficulteMax);
  }

  // Pioche N questions aléatoires parmi un pool, sans répétition
  piocherQuestions(pool, nombre) {
    const copie = [...pool];
    const resultat = [];

    for (let i = 0; i < nombre && copie.length > 0; i++) {
      const indexAleatoire = Math.floor(Math.random() * copie.length);
      resultat.push(copie[indexAleatoire]);
      copie.splice(indexAleatoire, 1);
    }

    return resultat;
  }

  // Fonction principale : génère une série de questions pour un combat
  genererSerieCombat(theme, difficulteMax, nombreQuestions = 10) {
    const pool = this.getQuestionsByTheme(theme);
    const filtrees = this.filterByDifficulte(pool, difficulteMax);
    return this.piocherQuestions(filtrees, nombreQuestions);
  }

  verifierReponse(question, reponseJoueur) {
    switch (question.type) {
        case 'phrase_builder': {
        const correct = verifierPhraseBuilder(question, reponseJoueur);
        return { correct, score: correct ? 1 : 0, total: 1 };
        }
        case 'fill_blank': {
        const correct = verifierFillBlank(question, reponseJoueur);
        return { correct, score: correct ? 1 : 0, total: 1 };
        }
        case 'multiple_choice': {
        const correct = verifierMultipleChoice(question, reponseJoueur);
        return { correct, score: correct ? 1 : 0, total: 1 };
        }
        case 'theme_sort':
        return verifierThemeSort(question, reponseJoueur);
        default:
        console.warn(`Type de question inconnu: ${question.type}`);
        return { correct: false, score: 0, total: 1 };
    }
  }
}