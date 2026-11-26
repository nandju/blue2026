// Valeurs par défaut indépendantes du pilote de données. Elles sont utilisées
// tant que rien n'a été modifié depuis l'admin, ou si les données sont absentes.

// "Autre" n'est pas stocké : il est toujours ajouté à la fin de la liste et
// impose alors un champ libre.
export const OTHER_DEPARTMENT = "Autre";

import { DEFAULT_COLORS } from "@/lib/colors";
import { DEFAULT_FONTS } from "@/lib/content/fonts";
import { DEFAULT_SITE_CONTACT, DEFAULT_SITE_IDENTITY, DEFAULT_SITE_SOCIALS } from "@/lib/content/defaults";

export const DEFAULT_SETTINGS = {
  departments: [
    "Présidence",
    "Secrétariat général",
    "Trésorerie",
    "Communication",
    "Recrutement",
    "Formation",
    "Projets & Terrain",
    "Partenariats",
  ],
  // Identité du site (webmaster)
  identity: DEFAULT_SITE_IDENTITY,
  // Coordonnées publiques (footer, contact, JSON-LD)
  contact: DEFAULT_SITE_CONTACT,
  // Réseaux sociaux : chaîne vide = réseau masqué
  socials: DEFAULT_SITE_SOCIALS,
  // Polices : { heading, body } — ids de lib/content/fonts.js
  fonts: DEFAULT_FONTS,
  // Couleurs : { primary, secondary, dark } en hex
  colors: DEFAULT_COLORS,
};
