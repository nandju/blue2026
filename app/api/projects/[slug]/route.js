import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/apiHandler";
import { NotFoundError } from "@/lib/data/errors";
import { getProjectBySlug } from "@/lib/content/siteData.server";

// GET → un projet visible par son slug.
export const GET = apiHandler(async (req, ctx) => {
  const { slug } = await ctx.params;
  const project = await getProjectBySlug(slug);
  if (!project || project.show === false) throw new NotFoundError("Projet introuvable.");
  return NextResponse.json(project);
});
