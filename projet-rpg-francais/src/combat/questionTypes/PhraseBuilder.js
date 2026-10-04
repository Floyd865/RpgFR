export function verifierPhraseBuilder(question, reponseJoueur) {
  // reponseJoueur = tableau de mots dans l'ordre choisi par le joueur
  const phraseJoueur = reponseJoueur.join(' ');
  return phraseJoueur.trim() === question.reponse.trim();
}