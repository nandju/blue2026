// Valeurs par défaut indépendantes du pilote de données. Elles sont utilisées
// tant que rien n'a été modifié depuis l'admin, ou si les données sont absentes.

// "Autre" n'est pas stocké : il est toujours ajouté à la fin de la liste et
// impose alors un champ libre.
export const OTHER_DEPARTMENT = "Autre";

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
};
