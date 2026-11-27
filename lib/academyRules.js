// Règles de la Blue Academy partagées entre le navigateur et le serveur.

export const QUIZ_PASS_THRESHOLD = 80; // % minimum pour réussir et obtenir un certificat
export const QUIZ_DURATION_SECONDS = 20 * 60;

/** Calcule le résultat d'un quiz à partir des réponses (index de l'option choisie par question). */
export function scoreQuiz(quiz = [], answers = {}, threshold = QUIZ_PASS_THRESHOLD) {
  let correct = 0;
  quiz.forEach((q, i) => {
    if (Number(answers[i]) === q.answer) correct++;
  });
  const total = quiz.length;
  const score = total ? Math.round((correct / total) * 100) : 0;
  const min = Number(threshold) || QUIZ_PASS_THRESHOLD;
  return { correct, total, score, passed: score >= min, threshold: min };
}

/** Corrections renvoyées APRÈS soumission : bonne réponse + explication par question. */
export function quizCorrections(quiz = []) {
  return quiz.map((q) => ({ answer: q.answer, explanation: q.explanation || "" }));
}
