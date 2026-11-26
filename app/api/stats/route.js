import { NextResponse } from "next/server";
import { courses, registrations, certificates, chat } from "@/lib/data";
import { requireAdmin } from "@/lib/apiAuth";
import { apiHandler } from "@/lib/apiHandler";

export const GET = apiHandler(async () => {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const [coursesCount, registrationsCount, approved, chatStats] = await Promise.all([
    courses.count(),
    registrations.count(),
    certificates.countByStatus("approved"),
    chat.stats(),
  ]);
  return NextResponse.json({
    courses: coursesCount,
    registrations: registrationsCount,
    certificates: approved,
    conversations: chatStats.totalUsers,
    volunteers: 1,
  });
});
