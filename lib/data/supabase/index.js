import "server-only";
import { DOMAIN_METHODS } from "../interface";
import { NotConfiguredError } from "../errors";

// Pilote Supabase — SQUELETTE (phase 7).
// Chaque méthode de l'interface lève « Non configuré — phase 7 ».
// En phase 7 : implémenter chaque domaine ici (le code d'origine se trouve
// dans lib/db/*.server.js) et appliquer les migrations supabase/migrations/0002+.

const notConfigured = async () => {
  throw new NotConfiguredError();
};

const stub = (domain) => Object.fromEntries(DOMAIN_METHODS[domain].map((m) => [m, notConfigured]));

export const content = stub("content");
export const settings = stub("settings");
export const projects = stub("projects");
export const media = stub("media");
export const volunteers = stub("volunteers");
export const recruitment = stub("recruitment");
export const members = stub("members");
export const courses = stub("courses");
export const progress = stub("progress");
export const registrations = stub("registrations");
export const quizResults = stub("quizResults");
export const certificates = stub("certificates");
export const payments = stub("payments");
export const chat = stub("chat");
export const adminLog = stub("adminLog");
export const adminAccount = stub("adminAccount");
