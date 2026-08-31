import { NextResponse } from "next/server";
import { updateCertificateRequestServer } from "@/lib/db/academy.server";
import { requireAdmin } from "@/lib/apiAuth";

export async function PATCH(req, { params }) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const updates = await req.json();
  const updated = await updateCertificateRequestServer(id, updates);
  return NextResponse.json(updated);
}
