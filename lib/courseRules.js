// Règles métier des formations (statut, publication) — partagées navigateur/serveur.

export const COURSE_STATUS = { DRAFT: "draft", PUBLISHED: "published" };
export const COURSE_STATUS_LABELS = { draft: "Brouillon", published: "Publié" };

export const DEFAULT_PASS_THRESHOLD = 80;
export const DEFAULT_QUIZ_DURATION_MIN = 20;
export const MIN_QUIZ_QUESTIONS = 5;

// Les formations créées avant la notion de statut sont considérées publiées.
export function isPublished(course) {
	return (course?.status ?? COURSE_STATUS.PUBLISHED) === COURSE_STATUS.PUBLISHED;
}

/** Défauts appliqués à la lecture : les anciens enregistrements restent valides. */
export function normalizeCourse(course) {
	if (!course) return course;
	return {
		objectives: [],
		glossary: [],
		pass_threshold: DEFAULT_PASS_THRESHOLD,
		quiz_duration_min: DEFAULT_QUIZ_DURATION_MIN,
		...course,
		status: course.status ?? COURSE_STATUS.PUBLISHED,
	};
}

/** Le quiz est-il complet ? ≥5 questions, chacune avec une bonne réponse valide. */
export function quizErrors(course) {
	const errors = [];
	const quiz = course?.quiz || [];
	if (quiz.length < MIN_QUIZ_QUESTIONS) {
		errors.push(`Le quiz doit contenir au moins ${MIN_QUIZ_QUESTIONS} questions (${quiz.length} actuellement).`);
	}
	quiz.forEach((q, i) => {
		const ok = Number.isInteger(q?.answer) && q.answer >= 0 && q.answer < (q.options?.length || 0);
		if (!ok) errors.push(`Question ${i + 1} : aucune bonne réponse valide.`);
	});
	return errors;
}

/**
 * Une formation peut être publiée si : titre présent, ≥1 module, quiz complet.
 * Renvoie la liste des blocages (vide = publiable).
 */
export function publishBlockers(course) {
	const errors = [];
	if (!course?.title?.trim()) errors.push("Le titre est requis.");
	if (!(course?.sections || []).length) errors.push("Au moins un module est requis.");
	errors.push(...quizErrors(course));
	return errors;
}
