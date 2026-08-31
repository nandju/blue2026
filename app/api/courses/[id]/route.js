import { NextResponse } from "next/server";
import { getCourseServer, updateCourseServer, deleteCourseServer } from "@/lib/db/courses.server";
import { requireAdmin } from "@/lib/apiAuth";

export async function GET(req, { params }) {
  const { id } = await params;
  const course = await getCourseServer(id);
  if (!course) return NextResponse.json({ error: "Formation introuvable" }, { status: 404 });
  return NextResponse.json(course);
}

export async function PATCH(req, { params }) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const updates = await req.json();
  const updated = await updateCourseServer(id, updates);
  return NextResponse.json(updated);
}

export async function DELETE(req, { params }) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  await deleteCourseServer(id);
  return NextResponse.json({ ok: true });
}
