// Plain CommonJS helper for next-sitemap.config.js, which is required directly
// by the next-sitemap CLI (plain Node `require`, no Next.js bundler) — so it
// can't use the ESM `lib/db/courses.server.js` (which relies on `server-only`
// and `import` syntax transpiled by Next). Kept deliberately minimal.
const { createClient } = require("@supabase/supabase-js");

async function getCoursesForSitemap() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return [];

  try {
    const supabase = createClient(url, key);
    const { data, error } = await supabase.from("courses").select("id");
    if (error) return [];
    return data;
  } catch {
    return [];
  }
}

module.exports = { getCoursesForSitemap };
