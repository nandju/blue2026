import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/apiAuth";
import { dataDriver } from "@/lib/data";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ authenticated: false }, { status: 401 });
  return NextResponse.json({
    authenticated: true,
    email: session.email,
    name: session.name,
    department: session.department,
    expiresAt: session.expiresAt,
    dataDriver,
  });
}
