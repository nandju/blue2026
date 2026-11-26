import { NextResponse } from "next/server";
import { chat } from "@/lib/data";
import { requireAdmin } from "@/lib/apiAuth";
import { apiHandler, parseJson } from "@/lib/apiHandler";
import { chatUserSchema } from "@/lib/validation";

export const GET = apiHandler(async (req) => {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");

  if (sessionId) {
    if (sessionId.length > 100) return NextResponse.json({ error: "sessionId invalide" }, { status: 400 });
    return NextResponse.json(await chat.getUserBySession(sessionId));
  }

  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  return NextResponse.json(await chat.listUsers());
});

export const POST = apiHandler(async (req) => {
  const userData = await parseJson(req, chatUserSchema);
  const user = await chat.addUser(userData);
  return NextResponse.json(user, { status: 201 });
});
