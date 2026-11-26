import "server-only";
import * as localDriver from "./local";
import * as supabaseDriver from "./supabase";
import { DOMAIN_METHODS } from "./interface";

// Point d'entrée UNIQUE de l'accès aux données. Aucun composant ni route API
// ne doit appeler Supabase ou le système de fichiers directement.
//
// DATA_DRIVER = "local" (défaut) | "supabase" (phase 7).

const requested = (process.env.DATA_DRIVER || "local").trim().toLowerCase();
if (!["local", "supabase"].includes(requested)) {
  console.warn(`[data] DATA_DRIVER="${process.env.DATA_DRIVER}" inconnu — pilote "local" utilisé.`);
}

export const dataDriver = requested === "supabase" ? "supabase" : "local";
const driver = dataDriver === "supabase" ? supabaseDriver : localDriver;

if (process.env.NODE_ENV !== "production") {
  for (const [domain, methods] of Object.entries(DOMAIN_METHODS)) {
    for (const m of methods) {
      if (typeof localDriver[domain]?.[m] !== "function") {
        console.error(`[data] Le pilote local n'implémente pas ${domain}.${m}()`);
      }
    }
  }
}

export const {
  content,
  settings,
  projects,
  media,
  volunteers,
  recruitment,
  members,
  courses,
  registrations,
  quizResults,
  certificates,
  payments,
  chat,
  adminLog,
  adminAccount,
} = driver;

export * from "./errors";
