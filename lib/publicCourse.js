// Version publique d'une formation : les bonnes réponses et explications du
// quiz ne sortent JAMAIS côté public (la correction est faite côté serveur).
// L'admin connecté reçoit la fiche complète pour l'édition.
// Version « sans accès » : les contenus réservés aux apprenants (modules,
// ressources téléchargeables, glossaire, PDF source) sont retirés en plus.

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

/**
 * Fiche publique complète pour un apprenant qui a accès, ou réduite à
 * l'aperçu (titre, description, prix) pour un visiteur derrière le paywall.
 */
export function publicCourse(course, { hasAccess = true } = {}) {
	const stripped = stripCourseSecrets(course);
	if (!stripped) return stripped;
	if (hasAccess) return stripped;
	return {
		id: stripped.id,
		title: stripped.title,
		description: stripped.description,
		category: stripped.category,
		level: stripped.level,
		duration: stripped.duration,
		cover: stripped.cover,
		price_fcfa: stripped.price_fcfa,
		status: stripped.status,
		enrolled: stripped.enrolled,
		objectives: stripped.objectives || [],
		pass_threshold: stripped.pass_threshold,
		// Réservés aux apprenants : vidéo, modules, ressources, glossaire,
		// PDF source, questions du quiz.
		video: "",
		sections: [],
		resources: [],
		quiz: [],
		glossary: [],
		source_pdf: null,
	};
}
