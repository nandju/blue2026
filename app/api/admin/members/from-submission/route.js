import { NextResponse } from "next/server";
import { recruitment, members, NotFoundError } from "@/lib/data";
import { requireAdmin } from "@/lib/apiAuth";
import { apiHandler } from "@/lib/apiHandler";
import { toMemberDraft } from "@/lib/recruitmentModel";

// Pont « Convertir en membre » : fiche préremplie à partir d'une candidature
// acceptée + détection d'un membre existant par téléphone (propose de lier).
export const GET = apiHandler(async (req) => {
	const unauthorized = await requireAdmin();
	if (unauthorized) return unauthorized;
	const sid = new URL(req.url).searchParams.get("sid");
	if (!sid) return NextResponse.json({ error: "sid requis" }, { status: 400 });

	const submission = await recruitment.getSubmission(sid);
	if (!submission) throw new NotFoundError("Candidature introuvable.");
	const form = await recruitment.get(submission.formId);
	const raw = toMemberDraft(submission, form);

	const draft = {
		firstName: raw.firstName,
		lastName: raw.lastName,
		phone: raw.phone,
		email: raw.email,
		commune: raw.location,
		status: "pending",
		activitiesCount: 0,
		tshirt: false,
		department: "",
		notes: `Candidature « ${raw.recruitmentTitle} » (${raw.appliedAt?.slice(0, 10) || "—"})`,
		origin: "recruitment",
		submissionId: submission.id,
	};
	const existing = draft.phone ? await members.getByPhone(draft.phone) : null;
	return NextResponse.json({ draft, existing });
});
