import { NextResponse } from "next/server";
import { getCoursesServer, addCourseServer } from "@/lib/db/courses.server";
import { requireAdmin } from "@/lib/apiAuth";

export async function GET() {
  const courses = await getCoursesServer();
  return NextResponse.json(courses);
}

export async function POST(req) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const course = await req.json();
  if (!course.id || !course.title) {
    return NextResponse.json({ error: "id et title requis" }, { status: 400 });
  }
  const created = await addCourseServer(course);
  return NextResponse.json(created, { status: 201 });
}
