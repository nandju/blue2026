import { NextResponse } from "next/server";
import { getDepartments } from "@/lib/siteSettings.server";

// Public : liste proposée à l'étape 1 de la connexion admin.
export async function GET() {
  return NextResponse.json({ departments: await getDepartments() });
}
