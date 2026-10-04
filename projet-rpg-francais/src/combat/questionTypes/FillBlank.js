export function verifierFillBlank(question, reponseJoueur) {
  // Comparaison insensible à la casse et aux espaces superflus
  return reponseJoueur.trim().toLowerCase() === question.reponse.trim().toLowerCase();
}