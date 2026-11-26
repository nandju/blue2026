import { NextResponse } from "next/server";
import { chat } from "@/lib/data";
import { requireAdmin } from "@/lib/apiAuth";
import { apiHandler, parseJson } from "@/lib/apiHandler";
import { chatMessageSchema } from "@/lib/validation";

export const GET = apiHandler(async (req, { params }) => {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  return NextResponse.json(await chat.listMessages(id));
});

export const POST = apiHandler(async (req, { params }) => {
  const { id } = await params;
  const { userMessage, aiResponse } = await parseJson(req, chatMessageSchema);
  const message = await chat.addMessage(id, userMessage, aiResponse);
  return NextResponse.json(message, { status: 201 });
});
