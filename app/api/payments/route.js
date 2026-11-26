import { NextResponse } from "next/server";
import { payments, courses, BadRequestError, ForbiddenError } from "@/lib/data";
import { apiHandler, getClientIp } from "@/lib/apiHandler";
import { paymentSubmitSchema } from "@/lib/validation";
import { getSetting } from "@/lib/siteSettings.server";
import { checkSubmissionAllowed, recordSubmission } from "@/lib/submissionRateLimit.server";
import { sniffMime } from "@/lib/uploadLimits";

const MAX_SCREENSHOT = 5 * 1024 * 1024; // 5 Mo
const IMAGE_MIMES = new Set(["image/png", "image/jpeg", "image/webp"]);
const EXT_BY_MIME = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp" };

// Déclaration d'un paiement Mobile Money manuel : référence de transaction,
// capture facultative (image ≤ 5 Mo, stockage privé), vérification par l'admin.
export const POST = apiHandler(async (req) => {
	const ip = getClientIp(req);
	const check = checkSubmissionAllowed(ip);
	if (!check.allowed) {
		return NextResponse.json(
			{ error: `Trop d'envois. Réessayez dans ${Math.ceil(check.retryAfterSeconds / 60)} minutes.` },
			{ status: 429 }
		);
	}

	const form = await req.formData();
	const parsed = paymentSubmitSchema.safeParse({
		courseId: form.get("courseId"),
		firstName: form.get("firstName"),
		lastName: form.get("lastName"),
		phone: form.get("phone"),
		email: form.get("email") || undefined,
		operator: form.get("operator"),
		transactionRef: form.get("transactionRef"),
	});
	if (!parsed.success) {
		return NextResponse.json({ error: parsed.error.issues[0]?.message || "Champs invalides" }, { status: 400 });
	}
	const data = parsed.data;

	const course = await courses.get(data.courseId);
	if (!course) return NextResponse.json({ error: "Formation introuvable" }, { status: 404 });
	if (!(Number(course.price_fcfa) > 0)) {
		throw new ForbiddenError("Cette formation est gratuite : aucun paiement n'est nécessaire.");
	}

	// L'opérateur choisi doit être activé dans les réglages de paiement.
	const { value: paySettings } = await getSetting("payments");
	if (!paySettings.operators?.[data.operator]?.enabled) {
		return NextResponse.json({ error: "Cet opérateur n'est pas disponible actuellement." }, { status: 400 });
	}

	// Capture facultative : image réelle ≤ 5 Mo, stockage privé.
	let screenshot = null;
	const file = form.get("screenshot");
	if (file && file.size > 0) {
		if (file.size > MAX_SCREENSHOT) {
			return NextResponse.json({ error: "La capture dépasse 5 Mo." }, { status: 400 });
		}
		const buffer = Buffer.from(await file.arrayBuffer());
		const mime = await sniffMime(buffer);
		if (!IMAGE_MIMES.has(mime)) {
			throw new BadRequestError("La capture doit être une image (PNG, JPEG ou WebP).");
		}
		screenshot = await payments.saveScreenshot({ ext: EXT_BY_MIME[mime], buffer });
	}

	recordSubmission(ip);
	const created = await payments.create({
		...data,
		courseTitle: course.title,
		amountFcfa: course.price_fcfa,
		screenshot,
		ip,
	});
	return NextResponse.json(
		{ payment: created, verificationDelay: paySettings.verificationDelay || "" },
		{ status: 201 }
	);
});
