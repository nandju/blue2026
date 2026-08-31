import { NextResponse } from "next/server";
import { getChatMessagesServer, addChatMessageServer } from "@/lib/db/chat.server";
import { requireAdmin } from "@/lib/apiAuth";

export async function GET(req, { params }) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const messages = await getChatMessagesServer(id);
  return NextResponse.json(messages);
}

export async function POST(req, { params }) {
  const { id } = await params;
  const { userMessage, aiResponse } = await req.json();
  if (!userMessage || !aiResponse) {
    return NextResponse.json({ error: "userMessage et aiResponse requis" }, { status: 400 });
  }
  const message = await addChatMessageServer(id, userMessage, aiResponse);
  return NextResponse.json(message, { status: 201 });
}
