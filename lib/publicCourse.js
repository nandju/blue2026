// Version publique d'une formation : les bonnes réponses et explications du
// quiz ne sortent JAMAIS côté public (la correction est faite côté serveur).
// L'admin connecté reçoit la fiche complète pour l'édition.

export function stripCourseSecrets(course) {
	if (!course) return course;
	return {
		...course,
		quiz: (course.quiz || []).map(({ question, options, answer, explanation, ...rest }) => ({
			...rest,
			question,
			options,
		})),
	};
}
