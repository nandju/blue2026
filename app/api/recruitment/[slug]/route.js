import { NextResponse } from "next/server";
import { recruitment, NotFoundError } from "@/lib/data";
import { apiHandler } from "@/lib/apiHandler";
import { isVisible } from "@/lib/recruitmentModel";
import { publicForm } from "../route";

// GET → un recrutement visible par son slug (jamais les brouillons/masqués).
export const GET = apiHandler(async (req, ctx) => {
	const { slug } = await ctx.params;
	const form = await recruitment.getBySlug(slug);
	if (!form || !isVisible(form.status)) throw new NotFoundError("Ce recrutement n'est plus disponible.");
	return NextResponse.json(publicForm(form));
});
