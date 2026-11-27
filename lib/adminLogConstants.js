// Libellés du journal d'activité (partagés client/serveur).

export const ACTIONS = {
  CREATE: "Création",
  UPDATE: "Modification",
  DELETE: "Suppression",
  PUBLISH: "Publication",
  UNPUBLISH: "Dépublication",
  UPLOAD: "Téléversement",
  EXPORT: "Export",
  APPROVE: "Validation",
  REJECT: "Rejet",
  VALIDATE_PAYMENT: "Validation de paiement",
  RESET: "Rétablissement par défaut",
  GENERATE: "Génération IA",
};

export const MODULES = {
  CONTENT: "Contenu",
  WEBMASTER: "Webmaster",
  VOLUNTEER: "Bénévole du mois",
  RECRUITMENT: "Recrutement",
  COURSES: "Formations",
  MEMBERS: "Membres",
  MR_BLUE: "MR BLUE",
  MEDIA: "Médias",
  JOURNAL: "Journal",
};

export const ACTION_LIST = Object.values(ACTIONS);
export const MODULE_LIST = Object.values(MODULES);
