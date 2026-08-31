import { NextResponse } from "next/server";
import { getCertificateRequestsServer, addCertificateRequestServer } from "@/lib/db/academy.server";
import { requireAdmin } from "@/lib/apiAuth";

export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const requests = await getCertificateRequestsServer();
  return NextResponse.json(requests);
}

export async function POST(req) {
  const body = await req.json();
  const { courseId, courseTitle, email, firstName, lastName, score } = body;
  if (!courseId || !courseTitle || !email || !firstName || !lastName || score == null) {
    return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
  }
  const created = await addCertificateRequestServer(body);
  return NextResponse.json(created, { status: 201 });
}
