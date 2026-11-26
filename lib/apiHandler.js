import "server-only";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { DataError, BadRequestError } from "@/lib/data/errors";

/** Enveloppe une route : transforme les erreurs connues en réponses JSON françaises. */
export function apiHandler(fn) {
  return async (req, ctx) => {
    try {
      return await fn(req, ctx);
    } catch (e) {
      return errorResponse(e);
    }
  };
}

export function errorResponse(e) {
  if (e instanceof ZodError) {
    const issues = e.issues.map((i) => ({ path: i.path.join("."), message: i.message }));
    const first = issues[0];
    const message = first ? (first.path ? `${first.path} : ${first.message}` : first.message) : "Données invalides";
    return NextResponse.json({ error: message, issues }, { status: 400 });
  }
  if (e instanceof DataError) {
    return NextResponse.json({ error: e.message, ...e.extra }, { status: e.status });
  }
  console.error("[api]", e);
  return NextResponse.json({ error: "Erreur serveur, veuillez réessayer." }, { status: 500 });
}

/** Lit et valide le corps JSON de la requête avec un schéma zod. */
export async function parseJson(req, schema) {
  let body;
  try {
    body = await req.json();
  } catch {
    throw new BadRequestError("Corps de requête JSON invalide");
  }
  return schema.parse(body);
}

/** Adresse IP du client (derrière le proxy Vercel ou en local). */
export function getClientIp(req) {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "inconnue";
}
