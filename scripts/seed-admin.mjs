// Standalone script — creates or updates the BLUE admin account.
// Run with: npm run seed:admin
//
// Deliberately does NOT import anything from lib/db/*.server.js: those files
// import the "server-only" package, which throws unconditionally outside of
// Next.js's server build (see node_modules/server-only/index.js) — so a plain
// `node` execution like this one needs its own minimal Supabase + bcrypt calls.
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const { NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_SEED_EMAIL, ADMIN_SEED_PASSWORD } = process.env;

function fail(message) {
  console.error(`\n✗ ${message}\n`);
  process.exit(1);
}

if (!NEXT_PUBLIC_SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  fail("NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY doivent être définis dans .env.local");
}
if (!ADMIN_SEED_EMAIL || !ADMIN_SEED_PASSWORD) {
  fail("ADMIN_SEED_EMAIL et ADMIN_SEED_PASSWORD doivent être définis dans .env.local");
}
if (ADMIN_SEED_PASSWORD.length < 8) {
  fail("ADMIN_SEED_PASSWORD doit contenir au moins 8 caractères");
}

const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const passwordHash = await bcrypt.hash(ADMIN_SEED_PASSWORD, 12);

const { error } = await supabase
  .from("users")
  .upsert({ email: ADMIN_SEED_EMAIL, password_hash: passwordHash }, { onConflict: "email" });

if (error) fail(`Échec de la création du compte admin : ${error.message}`);

console.log(`\n✓ Compte admin prêt : ${ADMIN_SEED_EMAIL}\n`);
