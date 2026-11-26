"use client";
import { createContext, useContext } from "react";

export const AdminSessionContext = createContext(null);

/** Session de l'opérateur connecté : { name, department, email, expiresAt, dataDriver }. */
export const useAdminSession = () => useContext(AdminSessionContext);

export const ADMIN_NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Tableau de bord", icon: "📊" },
  { href: "/admin/contenu", label: "Contenu", icon: "✏️" },
  { href: "/admin/webmaster", label: "Webmaster", icon: "🎨" },
  { href: "/admin/benevole-du-mois", label: "Bénévole du mois", icon: "🌟" },
  { href: "/admin/recrutement", label: "Recrutement", icon: "📣" },
  { href: "/admin/membres", label: "Membres", icon: "👥" },
  { href: "/admin/formations", label: "Formations", icon: "🎓" },
  { href: "/admin/mr-blue", label: "MR BLUE", icon: "💬" },
  { href: "/admin/medias", label: "Médias", icon: "🖼️" },
  { href: "/admin/journal", label: "Journal", icon: "📜" },
];
