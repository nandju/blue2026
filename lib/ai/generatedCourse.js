// Schéma zod de la sortie structurée de la génération de formation par IA,
// + helpers de normalisation et de bascule de fournisseur. Ce fichier reste
// importable hors Next.js (pas de "server-only") pour être testé directement.

import { z } from "zod";

const trimmed = (max) => z.string().trim().min(1).max(max);
// Chaîne optionnelle : absente OU vide → acceptée (normalisée en "").
const optionalText = (max) => z.string().trim().max(max).default("");

export const generatedCourseSchema = z.object({
	title: trimmed(200),
	description: trimmed(2000),
	category: trimmed(50).default("environnement"),
	level: trimmed(50).default("Débutant"),
	duration: optionalText(50),
	objectives: z.array(trimmed(300)).max(12).default([]),
	sections: z
		.array(
			z.object({
				title: trimmed(200),
				summary: optionalText(500),
				content: trimmed(20000),
				keyPoints: z.array(trimmed(300)).max(10).default([]),
			})
		)
		.min(1, "Au moins un module est requis")
		.max(30),
	quiz: z
		.array(
			z
				.object({
					question: trimmed(500),
					options: z.array(trimmed(300)).min(2).max(8),
					answer: z.number().int().min(0),
					explanation: optionalText(1000),
				})
				.refine((q) => q.answer < q.options.length, {
					message: "La bonne réponse doit correspondre à une option",
					path: ["answer"],
				})
		)
		.max(50)
		.default([]),
	glossary: z.array(z.object({ term: trimmed(120), definition: trimmed(1000) })).max(60).default([]),
});

/**
 * Valide et normalise la sortie brute d'un fournisseur.
 * Lève une erreur zod en français si la sortie est inexploitable.
 */
export function validateGeneratedCourse(raw) {
	const parsed = generatedCourseSchema.safeParse(raw);
	if (!parsed.success) {
		const first = parsed.error.issues[0];
		throw new Error(
			`La formation générée est invalide (${first ? `${first.path.join(".")} : ${first.message}` : "format inattendu"}).`
		);
	}
	const c = parsed.data;
	// Garde-fous métier : l'IA ne doit pas renvoyer une coquille vide.
	const meaningful = c.sections.some((s) => s.content.trim().length >= 80);
	if (!meaningful) {
		throw new Error("Le document ne contient pas assez de texte exploitable pour créer une formation fidèle.");
	}
	return c;
}

/**
 * Essaie les fournisseurs dans l'ordre et bascule automatiquement sur le
 * suivant si l'un échoue ou si sa clé manque.
 * `candidates` : [{ name, model, run }] — run() doit renvoyer le JSON brut.
 * `validate` : fonction de validation/normalisation (par défaut la formation
 * complète). Renvoie { result, provider, model, attempts } ; lève la DERNIÈRE
 * erreur utile si tous échouent, avec les motifs de chaque tentative.
 */
export async function runWithFallback(candidates, { validate = validateGeneratedCourse } = {}) {
	const attempts = [];
	let lastError = null;
	for (const candidate of candidates) {
		try {
			const raw = await candidate.run({});
			const result = validate(raw);
			return { result, provider: candidate.name, model: candidate.model, attempts };
		} catch (e) {
			attempts.push({ provider: candidate.name, model: candidate.model, error: e.message });
			lastError = e;
		}
	}
	const detail = attempts.map((a) => `${a.provider} (${a.model}) : ${a.error}`).join(" — ");
	const err = new Error(detail || lastError?.message || "La génération a échoué.");
	err.attempts = attempts;
	throw err;
}

// ─── Schémas des générations partielles (boutons IA de l'éditeur) ─────────

export const generatedSectionSchema = z.object({
	title: trimmed(200),
	summary: optionalText(500),
	content: trimmed(20000),
	keyPoints: z.array(trimmed(300)).max(10).default([]),
});

export const generatedQuizSchema = z.object({
	quiz: z
		.array(
			z
				.object({
					question: trimmed(500),
					options: z.array(trimmed(300)).min(2).max(8),
					answer: z.number().int().min(0),
					explanation: optionalText(1000),
				})
				.refine((q) => q.answer < q.options.length, {
					message: "La bonne réponse doit correspondre à une option",
					path: ["answer"],
				})
		)
		.min(1)
		.max(30),
});

export const validateGeneratedSection = (raw) => generatedSectionSchema.parse(raw);
export const validateGeneratedQuiz = (raw) => generatedQuizSchema.parse(raw).quiz;
