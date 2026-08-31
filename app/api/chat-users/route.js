import { NextResponse } from "next/server";
import { getChatUsersServer, getChatUserBySessionServer, addChatUserServer } from "@/lib/db/chat.server";
import { requireAdmin } from "@/lib/apiAuth";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");

  if (sessionId) {
    const user = await getChatUserBySessionServer(sessionId);
    return NextResponse.json(user);
  }

  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  const users = await getChatUsersServer();
  return NextResponse.json(users);
}

export async function POST(req) {
  const userData = await req.json();
  if (!userData.sessionId) {
    return NextResponse.json({ error: "sessionId requis" }, { status: 400 });
  }
  const user = await addChatUserServer(userData);
  return NextResponse.json(user, { status: 201 });
}
