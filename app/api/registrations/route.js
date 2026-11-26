import { NextResponse } from "next/server";
import { registrations, courses, NotFoundError } from "@/lib/data";
import { requireAdmin } from "@/lib/apiAuth";
import { apiHandler, parseJson } from "@/lib/apiHandler";
import { registrationSchema } from "@/lib/validation";

export const GET = apiHandler(async () => {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  return NextResponse.json(await registrations.list());
});

export const POST = apiHandler(async (req) => {
  const body = await parseJson(req, registrationSchema);
  if (!(await courses.get(body.courseId))) throw new NotFoundError("Formation introuvable");
  // Lève ConflictError (409 « Déjà inscrit à cette formation ») si besoin.
  const registration = await registrations.add(body);
  return NextResponse.json(registration, { status: 201 });
});
