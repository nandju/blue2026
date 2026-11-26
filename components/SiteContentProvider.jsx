"use client";
import { createContext, useContext } from "react";

const SiteContext = createContext({ content: {}, settings: {} });

/** Fournit le contenu fusionné (défauts + personnalisations) à tout le site. */
export function SiteContentProvider({ value, children }) {
  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

/** Lit un nœud du contenu : useContent("home.hero"), useContent("shared.zones.list"). */
export function useContent(path) {
  const { content } = useContext(SiteContext);
  if (!path) return content;
  return String(path).split(".").reduce((o, k) => (o == null ? o : o[k]), content);
}

/** Réglages du site : { identity, contact, socials, fonts, colors }. */
export function useSiteSettings() {
  return useContext(SiteContext).settings;
}
