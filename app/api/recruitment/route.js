import { NextResponse } from "next/server";
import { recruitment } from "@/lib/data";
import { apiHandler } from "@/lib/apiHandler";
import { isVisible, publicButton } from "@/lib/recruitmentModel";

/** Projection publique : jamais l'URL des boutons-liens ni les réglages internes. */
export function publicForm(form) {
	if (!form) return null;
	return {
		id: form.id,
		title: form.title,
		slug: form.slug,
		type: form.type === "Autre" && form.typeOther ? form.typeOther : form.type,
		summary: form.summary || "",
		description: form.description || "",
		coverImage: form.coverImage || "",
		location: form.location || "",
		featured: !!form.featured,
		position: form.position ?? 999,
		status: form.status,
		visibleFrom: form.visibleFrom || null,
		visibleUntil: form.visibleUntil || null,
		applyFrom: form.applyFrom || null,
		applyUntil: form.applyUntil || null,
		maxSubmissions: form.maxSubmissions ?? null,
		submissionCount: form.submissionCount || 0,
		fields: form.fields || [],
		buttons: (form.buttons || []).filter((b) => b.visibility !== "afterSubmit").map((b) => publicButton(form.slug, b)),
	};
}

// GET → recrutements visibles sur le site (tri : mis en avant puis ordre).
export const GET = apiHandler(async () => {
	const list = await recruitment.list();
	const visible = list.filter((f) => isVisible(f.status)).map(publicForm);
	visible.sort((a, b) => Number(b.featured) - Number(a.featured) || a.position - b.position);
	return NextResponse.json(visible);
});
