import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/apiHandler";
import { getPublicProjects } from "@/lib/content/siteData.server";

// GET → projets visibles (triés par position), pour le site public.
export const GET = apiHandler(async () => NextResponse.json(await getPublicProjects()));
