import { NextResponse } from "next/server";
import { z } from "zod";
import { courses, media, BadRequestError } from "@/lib/data";
import { requireAdmin, getOperator } from "@/lib/apiAuth";
import { apiHandler } from "@/lib/apiHandler";
import { UPLOAD_LIMITS, sniffMime } from "@/lib/uploadLimits";
import { logAdminAction } from "@/lib/adminLog.server";
import { ACTIONS, MODULES } from "@/lib/adminLogConstants";
import { getSetting } from "@/lib/siteSettings.server";
import { generateCourseFromPdf, friendlyAiError } from "@/lib/ai/courseGenerator.server";
import { normalizeCourse } from "@/lib/courseRules";

export const maxDuration = 60;

const optionsSchema = z.object({
	modules: z.union([z.literal("auto"), z.coerce.number().int().min(3).max(10)]).default("auto"),
	questions: z.coerce.number().int().min(5).max(20).default(10),
	level: z.enum(["Débutant", "Intermédiaire", "Avancé"]).default("Débutant"),
	audience: z.string().trim().max(200).optional().default(""),
	lang: z.string().trim().max(30).default("français"),
});

const slugify = (s) =>
	String(s || "")
		.normalize("NFD")
		.replace(/[̀-ͯ]/g, "")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, 60) || `formation-${Date.now()}`;

// Génération d'une formation (brouillon) depuis un PDF par IA : le PDF part
// au fournisseur choisi dans les Réglages IA, avec bascule automatique sur le
// fournisseur de secours. Le PDF est conservé comme ressource téléchargeable.
export const POST = apiHandler(async (req) => {
	const unauthorized = await requireAdmin();
	if (unauthorized) return unauthorized;

	const startedAt = Date.now();
	let form;
	try {
		form = await req.formData();
	} catch {
		throw new BadRequestError("Envoi invalide : formulaire multipart attendu.");
	}
	const file = form.get("file");
	if (!file || typeof file === "string") throw new BadRequestError("Aucun fichier reçu.");

	if (file.size > UPLOAD_LIMITS.pdf.maxBytes) {
		throw new BadRequestError(`Le PDF dépasse la taille maximale de 20 Mo.`);
	}
	const options = optionsSchema.parse({
		modules: form.get("modules") || "auto",
		questions: form.get("questions") || 10,
		level: form.get("level") || "Débutant",
		audience: form.get("audience") || "",
		lang: form.get("lang") || "français",
	});

	const buffer = Buffer.from(await file.arrayBuffer());
	if (sniffMime(buffer.subarray(0, 8)) !== "application/pdf") {
		throw new BadRequestError("Le fichier envoyé n'est pas un PDF valide.");
	}

	// Le PDF source est conservé dans la médiathèque (dossier courses/) et
	// ajouté aux ressources de la formation — réservé aux apprenants.
	const originalName = String(file.name || "document.pdf").slice(0, 200);
	const { storagePath, url } = await media.saveFile({ folder: "courses", ext: "pdf", buffer });
	await media.create({
		type: "pdf",
		folder: "courses",
		url,
		storagePath,
		originalName,
		mime: "application/pdf",
		size: buffer.length,
		uploadedBy: await getOperator(),
	});

	const { value: aiSettings } = await getSetting("ai");
	let outcome;
	try {
		outcome = await generateCourseFromPdf({ pdfBuffer: buffer, options, aiSettings: aiSettings || {} });
	} catch (e) {
		await logAdminAction({
			action: ACTIONS.GENERATE,
			module: MODULES.COURSES,
			target: originalName,
			changes: [
				{ field: "Fournisseurs tentés", from: null, to: (e.attempts || []).map((a) => `${a.provider}:${a.model}`).join(", ") || "—" },
				{ field: "Erreur", from: null, to: friendlyAiError(e) },
			],
		});
		throw new BadRequestError(friendlyAiError(e));
	}

	const { result: generated, provider, model, attempts } = outcome;
	if (generated.title.trim().toUpperCase() === "INEXPLOITABLE") {
		throw new BadRequestError("Le document n'est pas exploitable pour créer une formation (contenu vide ou hors sujet).");
	}

	// Identifiant unique à partir du titre.
	let id = slugify(generated.title);
	if (await courses.get(id)) id = `${id}-${Date.now().toString(36)}`;

	const record = await courses.create(
		normalizeCourse({
			id,
			title: generated.title,
			description: generated.description,
			category: generated.category,
			level: options.level || generated.level,
			duration: generated.duration,
			video: "",
			cover: "",
			objectives: generated.objectives,
			sections: generated.sections,
			quiz: generated.quiz,
			glossary: generated.glossary,
			resources: [{ name: `Document source — ${originalName}`, url }],
			source_pdf: { name: originalName, url, storagePath },
			status: "draft",
			price_fcfa: 0,
			ai_provider: provider,
			ai_model: model,
			generated_at: new Date().toISOString(),
		}),
		await getOperator()
	);

	await logAdminAction({
		action: ACTIONS.GENERATE,
		module: MODULES.COURSES,
		target: record.title,
		changes: [
			{ field: "Fichier", from: null, to: originalName },
			{ field: "Fournisseur", from: null, to: `${provider} (${model})` },
			{ field: "Durée", from: null, to: `${((Date.now() - startedAt) / 1000).toFixed(1)} s` },
			...(attempts.length ? [{ field: "Bascule", from: attempts[0]?.provider, to: provider }] : []),
		],
	});

	return NextResponse.json({ course: record, provider, model, fallback: attempts.length > 0 }, { status: 201 });
});
