import { NextResponse } from "next/server";
import { addQuizResultServer, getCourseQuizResultServer } from "@/lib/db/academy.server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("courseId");
  const email = searchParams.get("email");
  if (!courseId || !email) {
    return NextResponse.json({ error: "courseId et email requis" }, { status: 400 });
  }
  const result = await getCourseQuizResultServer(courseId, email);
  return NextResponse.json(result);
}

export async function POST(req) {
  const body = await req.json();
  const { courseId, email, score, correct, total, passed } = body;
  if (!courseId || !email || score == null) {
    return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
  }
  const result = await addQuizResultServer({ courseId, email, score, correct, total, passed });
  return NextResponse.json(result, { status: 201 });
}
