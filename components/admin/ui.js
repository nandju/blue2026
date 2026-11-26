// Classes Tailwind partagées par l'interface d'administration.

export const inputCls =
  "w-full px-4 py-2.5 border border-[rgba(13,110,187,0.15)] rounded-xl text-sm outline-none focus:border-[#0D6EBB] bg-white transition-colors";
export const labelCls = "block text-gray-700 text-sm font-medium mb-1";
export const cardCls = "bg-white rounded-2xl border border-[rgba(13,110,187,0.12)]";
export const btnPrimary =
  "bg-[#0D6EBB] hover:bg-[#0DBD9F] text-white rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
export const btnSecondary =
  "border border-[rgba(13,110,187,0.25)] text-[#0D6EBB] rounded-xl px-4 py-2 text-sm font-medium hover:bg-[rgba(13,110,187,0.06)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
export const btnDanger =
  "text-red-500 hover:text-red-600 rounded-xl px-4 py-2 text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-50";
export const btnGhost = "text-xs text-gray-500 hover:text-[#0D6EBB] px-2 py-1 rounded-lg hover:bg-[rgba(13,110,187,0.06)] transition-colors";

/** "Awa Koné" → "Awa K." */
export function shortName(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length < 2) return parts[0] || "";
  return `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`;
}

export function formatDateTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
