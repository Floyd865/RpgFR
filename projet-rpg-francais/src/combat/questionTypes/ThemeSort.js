export function verifierThemeSort(question, reponseJoueur) {
  const motsAttendus = question.mots_a_classer;
  let bonnesReponses = 0;

  for (const item of motsAttendus) {
    if (reponseJoueur[item.mot] === item.categorie) {
      bonnesReponses++;
    }
  }

  const total = motsAttendus.length;
  const estCorrect = bonnesReponses === total;

  return {
    correct: estCorrect,
    score: bonnesReponses,
    total: total
  };
}