import { NextResponse } from "next/server";
import { volunteers } from "@/lib/data";
import { notifyState, normalizeVolunteer } from "@/lib/volunteerModel";
import seedVolunteers from "@/lib/data/seed/volunteers.json";

// Lecture publique : uniquement le bénévole publié + l'état effectif de la
// notification (calculé côté serveur selon les dates de planification).
// Jamais les brouillons ni l'historique. En cas d'erreur, on renvoie la fiche
// d'amorçage pour que le site s'affiche comme avant.
export async function GET() {
  try {
    const volunteer = await volunteers.getCurrent();
    return NextResponse.json({ volunteer, notify: notifyState(volunteer) });
  } catch (e) {
    console.error("[volunteer]", e.message);
    const volunteer = normalizeVolunteer(seedVolunteers[0] || null);
    return NextResponse.json({ volunteer, notify: notifyState(volunteer) });
  }
}
