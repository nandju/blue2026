import { redirect } from "next/navigation";

// Ancienne adresse de la gestion MR BLUE : conservée pour les favoris.
export default function LegacyChatbotPage() {
  redirect("/admin/mr-blue");
}
