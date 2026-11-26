import { NextResponse } from "next/server";
import { recruitment, NotFoundError, BadRequestError, ForbiddenError, ConflictError } from "@/lib/data";
import { apiHandler, getClientIp } from "@/lib/apiHandler";
import {
	computeStatus, canApply, closedMessage, contactOf, submissionSchemaFor,
	FILE_KINDS, DISPLAY_ONLY_TYPES, normalizePhone,
} from "@/lib/recruitmentModel";
import { checkSubmissionAllowed, recordSubmission } from "@/lib/submissionRateLimit.server";
import { setSubmitCookie } from "@/lib/recruitToken.server";
import { sniffMime } from "@/lib/uploadLimits";

const MB = 1024 * 1024;

/** Vérifie les fichiers envoyés contre les réglages du champ (kinds + taille). */
async function validateAndStoreFile(file, field, submissionTmpId) {
	const kinds = (field.fileKinds || ["pdf"]).flatMap((k) => FILE_KINDS[k] ? [FILE_KINDS[k]] : []);
	const allowedExt = kinds.flatMap((k) => k.exts);
	const allowedMime = kinds.flatMap((k) => k.mimes);
	const ext = (file.name.split(".").pop() || "").toLowerCase();
	const maxBytes = Math.min((field.maxSizeMb || 5) * MB, 50 * MB);

	if (!allowedExt.includes(ext)) {
		throw new BadRequestError(`${field.label} : format non accepté (.${ext}). Formats : ${allowedExt.join(", ")}.`);
	}
	if (file.size === 0) throw new BadRequestError(`${field.label} : le fichier est vide.`);
	if (file.size > maxBytes) {
		throw new BadRequestError(`${field.label} : fichier trop volumineux (${Math.round(file.size / MB)} Mo, max ${field.maxSizeMb || 5} Mo).`);
	}
	const buffer = Buffer.from(await file.arrayBuffer());
	const real = sniffMime(buffer.subarray(0, 16));
	// Word (.doc/.docx) : pas de signature fiable sniffée — on accepte ext+mime déclaré.
	if (real && !allowedMime.includes(real)) {
		throw new BadRequestError(`${field.label} : le contenu du fichier ne correspond pas au format déclaré.`);
	}
	if (!real && !allowedMime.includes(file.type)) {
		throw new BadRequestError(`${field.label} : type de fichier non reconnu.`);
	}
	const storagePath = await recruitment.saveSubmissionFile({ submissionId: submissionTmpId, ext, buffer });
	return { name: file.name.slice(0, 200), size: file.size, mime: file.type || real || "application/octet-stream", storagePath };
}

// POST multipart → candidature. Refus : non visible, hors période, masqué,
// complet, doublon (même email/téléphone), piège invisible, limite par IP.
export const POST = apiHandler(async (req, ctx) => {
	const { slug } = await ctx.params;
	const ip = getClientIp(req);

	const form = await recruitment.getBySlug(slug);
	if (!form) throw new NotFoundError("Ce recrutement n'existe pas.");

	const status = computeStatus(form, form.submissionCount || 0);
	if (!canApply(status)) throw new ForbiddenError(closedMessage(form, status));

	const rate = checkSubmissionAllowed(ip);
	if (!rate.allowed) {
		throw new ConflictError(`Trop d'envois. Réessayez dans ${Math.ceil(rate.retryAfterSeconds / 60)} minute(s).`);
	}

	let formData;
	try {
		formData = await req.formData();
	} catch {
		throw new BadRequestError("Envoi invalide : formulaire attendu.");
	}

	// Champ piège invisible : rempli = bot → on accepte en silence sans stocker.
	if (String(formData.get("website") || "").trim() !== "") {
		return NextResponse.json({ ok: true, ignored: true }, { status: 201 });
	}

	let answers;
	try {
		answers = JSON.parse(String(formData.get("answers") || "{}"));
	} catch {
		throw new BadRequestError("Réponses illisibles.");
	}

	// Validation des réponses selon le schéma dynamique du formulaire.
	const fields = form.fields || [];
	const parsed = submissionSchemaFor(fields).safeParse(answers);
	if (!parsed.success) {
		const first = parsed.error.issues[0];
		throw new BadRequestError(first?.message || "Réponses invalides.");
	}

	// Champs fichier obligatoires présents ?
	for (const f of fields) {
		if (f.type === "file" && f.required && !(formData.get(`file_${f.id}`) instanceof File)) {
			throw new BadRequestError(`${f.label} est obligatoire`);
		}
	}

	recordSubmission(ip);

	// Stockage des fichiers dans data/recruitment-files/ (privé).
	const fileMeta = {};
	for (const f of fields) {
		if (f.type !== "file") continue;
		const file = formData.get(`file_${f.id}`);
		if (file instanceof File) {
			fileMeta[f.id] = await validateAndStoreFile(file, f, `${Date.now()}`);
			parsed.data[f.id] = fileMeta[f.id];
		}
	}

	const { email, phone } = contactOf(fields, parsed.data);
	const sub = await recruitment.addSubmission(form.id, {
		answers: parsed.data,
		email: email ? String(email).toLowerCase() : null,
		phone: phone || null,
		ip,
	});

	// Jeton signé (cookie httpOnly, 7 j) → débloque les boutons « après envoi ».
	await setSubmitCookie(slug, sub.id);

	return NextResponse.json(
		{
			ok: true,
			submissionId: sub.id,
			message: form.confirmationMessage || "Votre candidature a bien été envoyée.",
			afterSubmitButtons: (form.buttons || [])
				.filter((b) => b.visibility === "afterSubmit")
				.map((b) => ({ id: b.id, label: b.label, icon: b.icon, style: b.style, href: `/go/${encodeURIComponent(slug)}/${encodeURIComponent(b.id)}` })),
		},
		{ status: 201 }
	);
});
