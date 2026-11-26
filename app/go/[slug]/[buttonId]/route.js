import { NextResponse } from "next/server";
import { recruitment } from "@/lib/data";
import { apiHandler } from "@/lib/apiHandler";
import { readSubmitCookie } from "@/lib/recruitToken.server";

// Redirection serveur : l'URL réelle du bouton n'apparaît jamais dans le HTML
// ni dans les API publiques. Les boutons « après envoi » exigent le jeton
// remis à la soumission (cookie httpOnly signé, 7 j).
export const GET = apiHandler(async (req, ctx) => {
	const { slug, buttonId } = await ctx.params;
	const form = await recruitment.getBySlug(slug);

	const backToForm = () =>
		new NextResponse(null, {
			status: 302,
			headers: {
				Location: `/recrutement/${slug}`,
				"Cache-Control": "no-store",
				"Referrer-Policy": "no-referrer",
			},
		});

	if (!form) return new NextResponse(null, { status: 302, headers: { Location: "/recrutement", "Cache-Control": "no-store" } });
	const button = (form.buttons || []).find((b) => b.id === buttonId);
	if (!button || !button.url) return backToForm();

	if (button.visibility === "afterSubmit") {
		const token = await readSubmitCookie();
		if (!token || token.slug !== slug) return backToForm();
	}

	// Clic compté pour l'admin (non bloquant si l'écriture échoue).
	recruitment.recordClick(form.id, buttonId).catch(() => {});

	return new NextResponse(null, {
		status: 302,
		headers: {
			Location: button.url,
			"Cache-Control": "no-store",
			"Referrer-Policy": "no-referrer",
		},
	});
});
