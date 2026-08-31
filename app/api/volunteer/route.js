import { NextResponse } from "next/server";
import { getVolunteerServer, setVolunteerServer } from "@/lib/db/volunteer.server";
import { requireAdmin } from "@/lib/apiAuth";

export async function GET() {
  const volunteer = await getVolunteerServer();
  return NextResponse.json(volunteer);
}

export async function PUT(req) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const body = await req.json();
  const updated = await setVolunteerServer(body);
  return NextResponse.json(updated);
}
