import "server-only";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

async function countRows(table, filter) {
  let query = getSupabaseAdmin().from(table).select("id", { count: "exact", head: true });
  if (filter) query = filter(query);
  const { count, error } = await query;
  if (error) throw error;
  return count || 0;
}

export async function getStatsServer() {
  const [courses, registrations, certificates, conversations] = await Promise.all([
    countRows("courses"),
    countRows("registrations"),
    countRows("certificate_requests", (q) => q.eq("status", "approved")),
    countRows("chat_users"),
  ]);
  return { courses, registrations, certificates, conversations, volunteers: 1 };
}
