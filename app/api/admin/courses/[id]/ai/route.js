import { NextResponse } from "next/server";
import { z } from "zod";
import { courses, media, BadRequestError, NotFoundError } from "@/lib/data";
import { requireAdmin } from "@/lib/apiAuth";
import { apiHandler, parseJson } from "@/lib/apiHandler";
import { logAdminAction } from "@/lib/adminLog.server";
import { ACTIONS, MODULES } from "@/lib/adminLogConstants";
import { getSetting } from "@/lib/siteSettings.server";
import { generatePartFromPdf, friendlyAiError } from "@/lib/ai/courseGenerator.server";

export const maxDuration = 60;

const actionSchema = z.object({
	action: z.enum(["section", "quiz", "questions"]),
	index: z.number().int().min(0).max(50).optional(),
	count: z.number().int().min(1).max(20).optional(),
});

async function sourcePdfBuffer(course) {
	const src = course?.source_pdf;
	if (!src?.url) return null;
	const storagePath = src.storagePath || String(src.url).replace(/^\/uploads\//, "");
	const opened = await media.openFile(storagePath);
	if (!opened?.stream) return null;
	return Buffer.from(await new Response(opened.stream).arrayBuffer());
}

// Boutons IA de l'éditeur : « Régénérer ce module », « Régénérer le quiz »,
// « Ajouter des questions ». Le résultat est renvoyé pour APERÇU — le client
// décide ensuite de remplacer le contenu (rien n'est écrit ici).
export const POST = apiHandler(async (req, { params }) => {
	const unauthorized = await requireAdmin();
	if (unauthorized) return unauthorized;

	const { id } = await params;
	const { action, index, count } = await parseJson(req, actionSchema);
	const course = await courses.get(id);
	if (!course) throw new NotFoundError("Formation introuvable");

	const buffer = await sourcePdfBuffer(course);
	if (!buffer) {
		throw new BadRequestError(
			"Aucun PDF source n'est associé à cette formation. Joignez un PDF dans l'onglet Ressources pour utiliser les outils IA."
		);
	}

	const { value: aiSettings } = await getSetting("ai");
	try {
		const { result, provider, model } = await generatePartFromPdf({
			pdfBuffer: buffer,
			kind: action,
			course,
			index: index ?? 0,
			count,
			aiSettings: aiSettings || {},
		});
		await logAdminAction({
			action: ACTIONS.GENERATE,
			module: MODULES.COURSES,
			target: `${course.title} — ${action === "section" ? `module ${index + 1}` : "quiz"}`,
			changes: [{ field: "Fournisseur", from: null, to: `${provider} (${model})` }],
		});
		return NextResponse.json({ action, index, result, provider, model });
	} catch (e) {
		throw new BadRequestError(friendlyAiError(e));
	}
});
