// Génération d'une formation (ou d'une partie) depuis un PDF par IA.
// Fournisseurs interchangeables derrière une même interface :
//   run({ pdfBuffer, prompt, schema, model }) → objet brut validé par zod.
// Pour ajouter un fournisseur (OpenAI, Anthropic…), ajouter une entrée à
// PROVIDERS : { envKey, defaultModel, run } — rien d'autre à changer.

import "server-only";
import { generateObject, generateText } from "ai";
import { google } from "@ai-sdk/google";
import { groq } from "@ai-sdk/groq";
import {
	generatedCourseSchema,
	generatedSectionSchema,
	generatedQuizSchema,
	validateGeneratedCourse,
	validateGeneratedSection,
	validateGeneratedQuiz,
	runWithFallback,
} from "./generatedCourse";

export class AiKeyMissingError extends Error {
	constructor(provider, envKey) {
		super(`Clé API manquante : configurez ${envKey} pour utiliser ${provider}.`);
		this.provider = provider;
	}
}

// Limite de texte envoyé au modèle texte seul (secours). Au-delà : découpage
// en morceaux, résumé de chacun, puis génération depuis les résumés.
const MAX_DIRECT_CHARS = 24000;
const CHUNK_CHARS = 14000;
const MAX_SUMMARIZED_CHARS = 160000;

const BASE_RULES = `Tu es un concepteur pédagogique de la BLUE Academy, plateforme de formations de l'ONG BLUE (Côte d'Ivoire).
RÈGLES STRICTES : reste fidèle au document, n'invente AUCUN chiffre, fait ou exemple absent du texte ; langage simple et pédagogique adapté au public ivoirien ; réponds entièrement en français.`;

function buildInstructions(options = {}) {
	const modules =
		options.modules === "auto" || !options.modules
			? "un nombre adapté au contenu (entre 3 et 10 modules)"
			: `exactement ${options.modules} modules`;
	const questions = Math.min(20, Math.max(5, Number(options.questions) || 10));
	const level = options.level || "Débutant";
	const audience = options.audience?.trim() || "le grand public ivoirien";
	const lang = options.lang || "français";

	return `${BASE_RULES}
À partir du document fourni, crée une formation complète en ${lang}.
- Structure : ${modules}, courts et progressifs. Chaque module a un titre, un résumé d'une phrase, un contenu de 2 à 5 paragraphes (séparés par une ligne vide) et 3 à 5 points clés.
- Quiz : ${questions} questions couvrant TOUS les modules, une seule bonne réponse par question, 4 options plausibles, et une courte explication de la bonne réponse.
- objectives : 3 à 6 objectifs d'apprentissage concrets. glossary : les termes importants (0 à 15).
- Niveau visé : "${level}". Public : ${audience}. duration : estimation réaliste (ex : "1h30").
- Si le document est vide ou inexploitable, réponds avec title="INEXPLOITABLE".`;
}

// ─── Extraction de texte (fournisseurs texte) ─────────────────────────────

export async function extractPdfText(pdfBuffer) {
	const { extractText } = await import("unpdf");
	const data = pdfBuffer instanceof Uint8Array ? pdfBuffer : new Uint8Array(pdfBuffer);
	const { text, totalPages } = await extractText(data, { mergePages: true });
	const joined = Array.isArray(text) ? text.join("\n\n") : String(text || "");
	const cleaned = joined.replace(/\s+\n/g, "\n").trim();
	if (!cleaned || cleaned.length < 50) {
		const err = new Error(
			"Ce PDF ne contient pas de texte lisible (document scanné ou vide). Fournissez un PDF avec du texte sélectionnable."
		);
		err.code = "PDF_NO_TEXT";
		throw err;
	}
	return { text: cleaned, totalPages: totalPages || 0 };
}

async function preparePdfText(pdfBuffer, model) {
	const { text } = await extractPdfText(pdfBuffer);
	if (text.length <= MAX_DIRECT_CHARS) return text;

	// Texte long : découpage puis résumé de chaque morceau par le modèle.
	const clipped = text.slice(0, MAX_SUMMARIZED_CHARS);
	const chunks = [];
	for (let i = 0; i < clipped.length; i += CHUNK_CHARS) chunks.push(clipped.slice(i, i + CHUNK_CHARS));
	const summaries = [];
	for (const chunk of chunks) {
		const { text: summary } = await generateText({
			model,
			prompt: `Résume fidèlement et en français cette partie d'un document, en conservant tous les faits, chiffres et idées importantes :\n\n${chunk}`,
		});
		summaries.push(summary);
	}
	return `RÉSUMÉS D'UN DOCUMENT LONG (${chunks.length} parties) :\n\n${summaries.join("\n\n---\n\n")}`;
}

// ─── Registre des fournisseurs ────────────────────────────────────────────

export const PROVIDERS = {
	google: {
		label: "Google Gemini",
		envKey: "GOOGLE_GENERATIVE_AI_API_KEY",
		defaultModel: "gemini-2.5-flash",
		async run({ pdfBuffer, prompt, schema, model }) {
			const data = pdfBuffer instanceof Uint8Array ? pdfBuffer : new Uint8Array(pdfBuffer);
			const { object } = await generateObject({
				model: google(model),
				schema,
				messages: [
					{
						role: "user",
						content: [
							{ type: "file", data, mediaType: "application/pdf" },
							{ type: "text", text: prompt },
						],
					},
				],
			});
			return object;
		},
	},
	groq: {
		label: "Groq",
		envKey: "GROQ_API_KEY",
		defaultModel: "llama-3.3-70b-versatile",
		async run({ pdfBuffer, prompt, schema, model }) {
			const model_ = groq(model);
			const source = await preparePdfText(pdfBuffer, model_);
			const { object } = await generateObject({
				model: model_,
				schema,
				prompt: `${prompt}\n\nDOCUMENT :\n\n${source}`,
			});
			return object;
		},
	},
};

export const PROVIDER_KEYS = Object.keys(PROVIDERS);

/**
 * Candidats ordonnés : le fournisseur choisi d'abord, puis les autres qui
 * ont une clé configurée (bascule automatique).
 */
function candidatesFor({ pdfBuffer, prompt, schema, aiSettings = {} }) {
	const primary = PROVIDERS[aiSettings.provider] ? aiSettings.provider : "google";
	const order = [primary, ...PROVIDER_KEYS.filter((k) => k !== primary)];
	return order
		.map((key) => {
			const p = PROVIDERS[key];
			const model = aiSettings.models?.[key] || p.defaultModel;
			if (!process.env[p.envKey]) return null;
			return { name: key, model, run: () => p.run({ pdfBuffer, prompt, schema, model }) };
		})
		.filter(Boolean);
}

/** Génère la formation complète. Renvoie { result, provider, model, attempts }. */
export async function generateCourseFromPdf({ pdfBuffer, options = {}, aiSettings = {} }) {
	const primary = PROVIDERS[aiSettings.provider] ? aiSettings.provider : "google";
	const candidates = candidatesFor({
		pdfBuffer,
		prompt: buildInstructions(options),
		schema: generatedCourseSchema,
		aiSettings,
	});
	if (!candidates.length) throw new AiKeyMissingError(primary, PROVIDERS[primary].envKey);
	return runWithFallback(candidates, { validate: validateGeneratedCourse });
}

/**
 * Générations ciblées depuis le PDF source (boutons IA de l'éditeur) :
 *   kind "section"  → régénère un module (indice fourni pour le contexte)
 *   kind "quiz"     → régénère tout le quiz (count questions)
 *   kind "questions"→ ajoute count nouvelles questions
 */
export async function generatePartFromPdf({ pdfBuffer, kind, course, index, count, options = {}, aiSettings = {} }) {
	const primary = PROVIDERS[aiSettings.provider] ? aiSettings.provider : "google";
	let prompt, schema, validate;
	const ctx = `La formation s'intitule « ${course?.title || ""} » (${course?.level || "Débutant"}).`;

	if (kind === "section") {
		const prev = course?.sections?.[index];
		prompt = `${BASE_RULES}\n${ctx}\nRégénère le module ${index + 1} de cette formation à partir du document source (version différente mais fidèle${prev?.title ? ` ; titre précédent : « ${prev.title} »` : ""}). Un titre, un résumé d'une phrase, un contenu de 2 à 5 paragraphes, 3 à 5 points clés.`;
		schema = generatedSectionSchema;
		validate = validateGeneratedSection;
	} else {
		const n = Math.min(20, Math.max(1, Number(count) || (kind === "questions" ? 5 : 10)));
		const existing = (course?.quiz || []).map((q) => q.question).filter(Boolean);
		prompt = `${BASE_RULES}\n${ctx}\nÀ partir du document source, écris ${n} question(s) de quiz (4 options plausibles, une seule bonne réponse, courte explication) fidèles au document.${
			kind === "questions" && existing.length
				? `\nN'interroge PAS sur les sujets déjà couverts par ces questions existantes : ${existing.slice(0, 30).join(" | ")}`
				: ""
		}`;
		schema = generatedQuizSchema;
		validate = validateGeneratedQuiz;
	}

	const candidates = candidatesFor({ pdfBuffer, prompt, schema, aiSettings });
	if (!candidates.length) throw new AiKeyMissingError(primary, PROVIDERS[primary].envKey);
	return runWithFallback(candidates, { validate });
}

/** Erreur lisible pour l'interface admin. */
export function friendlyAiError(e) {
	if (e?.code === "PDF_NO_TEXT") return e.message;
	if (e instanceof AiKeyMissingError) return e.message;
	const msg = e?.message || "";
	if (/quota|rate.?limit|429/i.test(msg)) return "Le quota du fournisseur d'IA est atteint. Réessayez plus tard ou changez de fournisseur.";
	if (/timeout|timed out|deadline/i.test(msg)) return "La génération a dépassé le délai imparti. Réessayez avec un document plus court.";
	if (/api key|unauthorized|401|403/i.test(msg)) return "La clé API du fournisseur est invalide ou refusée. Vérifiez les Réglages IA.";
	return msg || "La génération a échoué.";
}
