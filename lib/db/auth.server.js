import "server-only";
import bcrypt from "bcryptjs";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function verifyAdminCredentials(email, password) {
  const { data: user, error } = await getSupabaseAdmin()
    .from("users")
    .select("*")
    .eq("email", email)
    .maybeSingle();
  if (error) throw error;
  if (!user) return null;

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return null;

  return { id: user.id, email: user.email };
}

export async function upsertAdminUser(email, plainPassword) {
  const passwordHash = await bcrypt.hash(plainPassword, 12);
  const { data, error } = await getSupabaseAdmin()
    .from("users")
    .upsert({ email, password_hash: passwordHash }, { onConflict: "email" })
    .select()
    .single();
  if (error) throw error;
  return data;
}
