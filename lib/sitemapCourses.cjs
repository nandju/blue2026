// Plain CommonJS helper for next-sitemap.config.js, which is required directly
// by the next-sitemap CLI (plain Node `require`, no Next.js bundler) — so it
// can't use lib/data/ (which relies on `server-only` and ESM transpiled by
// Next). Kept deliberately minimal; mirrors the DATA_DRIVER choice.
const fs = require("node:fs");
const path = require("node:path");

async function getCoursesForSitemap() {
  if ((process.env.DATA_DRIVER || "local").trim().toLowerCase() === "supabase") {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return [];
    try {
      const { createClient } = require("@supabase/supabase-js");
      const { data, error } = await createClient(url, key).from("courses").select("id");
      return error ? [] : data;
    } catch {
      return [];
    }
  }

  // Pilote local : data/courses.json s'il existe, sinon les formations par défaut.
  try {
    const file = path.join(process.cwd(), "data", "courses.json");
    const list = fs.existsSync(file)
      ? JSON.parse(fs.readFileSync(file, "utf8"))
      : require("./data/seed/courses.json");
    return list.map((c) => ({ id: c.id }));
  } catch {
    return [];
  }
}

// Projets : data/projects.json (domaine local) s'il existe, sinon json/data.json.
// En pilote supabase, la table "projects" sera utilisée (mêmes colonnes slug/show).
async function getProjectsForSitemap() {
  if ((process.env.DATA_DRIVER || "local").trim().toLowerCase() === "supabase") {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return [];
    try {
      const { createClient } = require("@supabase/supabase-js");
      const { data, error } = await createClient(url, key)
        .from("projects")
        .select("slug, show")
        .order("position");
      return error ? [] : data;
    } catch {
      return [];
    }
  }
  try {
    const file = path.join(process.cwd(), "data", "projects.json");
    return fs.existsSync(file)
      ? JSON.parse(fs.readFileSync(file, "utf8"))
      : require("../json/data.json").Projects;
  } catch {
    return [];
  }
}

module.exports = { getCoursesForSitemap, getProjectsForSitemap };
