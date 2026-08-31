import { NextResponse } from "next/server";
import { getRegistrationsServer, addRegistrationServer, isRegisteredServer } from "@/lib/db/academy.server";
import { requireAdmin } from "@/lib/apiAuth";

export async function GET(req) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const registrations = await getRegistrationsServer();
  return NextResponse.json(registrations);
}

export async function POST(req) {
  const body = await req.json();
  const { courseId, firstName, lastName, whatsapp, email } = body;
  if (!courseId || !firstName || !lastName || !whatsapp || !email) {
    return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
  }

  const already = await isRegisteredServer(courseId, email);
  if (already) {
    return NextResponse.json({ error: "Déjà inscrit à cette formation" }, { status: 409 });
  }

  const registration = await addRegistrationServer(body);
  return NextResponse.json(registration, { status: 201 });
}
