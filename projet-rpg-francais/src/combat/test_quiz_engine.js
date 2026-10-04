import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import QuizEngine from './QuizEngine.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const questionsPath = join(__dirname, '../../data/questions.json');
const questionsData = JSON.parse(readFileSync(questionsPath, 'utf-8'));

const engine = new QuizEngine(questionsData);

console.log('--- Test 1 : récupérer toutes les questions du thème "conjugaison" ---');
const questionsConjugaison = engine.getQuestionsByTheme('conjugaison');
console.log(questionsConjugaison);

console.log('\n--- Test 2 : générer une série de combat sur "vocabulaire", difficulté max 2, 5 questions ---');
const serie = engine.genererSerieCombat('vocabulaire', 2, 5);
console.log(serie);

console.log('\n--- Test 3 : vérifier une bonne réponse phrase_builder (q001) ---');
const q001 = questionsData.themes.conjugaison.racines.verbes_1er_groupe[0];
const resultat1 = engine.verifierReponse(q001, ['Je', 'mange', 'une', 'pomme']);
console.log(resultat1);

console.log('\n--- Test 4 : vérifier une mauvaise réponse fill_blank (q002) ---');
const q002 = questionsData.themes.conjugaison.racines.verbes_1er_groupe[1];
const resultat2 = engine.verifierReponse(q002, 'mangeait');
console.log(resultat2);

console.log('\n--- Test 5 : vérifier une réponse partielle theme_sort (q010) ---');
const q010 = questionsData.themes.vocabulaire.racines.animaux[1];
const reponseJoueur = {
  chat: 'Animaux domestiques',
  lion: 'Animaux sauvages',
  chien: 'Animaux sauvages',
  loup: 'Animaux sauvages'
};
const resultat3 = engine.verifierReponse(q010, reponseJoueur);
console.log(resultat3);