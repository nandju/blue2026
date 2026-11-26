// Interface commune aux pilotes de données. Chaque pilote (local, supabase)
// doit exposer exactement ces domaines et ces méthodes, avec les mêmes
// formats de retour. Le pilote supabase (squelette) est généré à partir de
// cette liste ; un test au démarrage en dev vérifie que le pilote local la
// respecte (voir lib/data/index.js).

export const DOMAIN_METHODS = {
  // Contenus éditables du site : { [clé]: { value, isDefault, updatedAt, updatedBy } }
  content: ["getAll", "get", "set", "reset"],
  // Réglages (départements, polices, couleurs…) : même format que content
  settings: ["getAll", "get", "set", "reset"],
  projects: ["list", "get", "create", "update", "remove"],
  media: [
    "list", "get", "getByUrl", "create", "remove",
    "saveFile", "deleteFile", "openFile", "findUsages",
    "createUploadTarget", "completeSignedUpload",
  ],
  volunteers: ["getCurrent", "list", "get", "create", "update", "remove"],
  recruitment: ["list", "get", "create", "update", "remove"],
  members: ["list", "get", "create", "update", "remove"],
  courses: ["list", "get", "create", "update", "remove", "incrementEnrolled", "count"],
  registrations: ["list", "add", "isRegistered", "count"],
  quizResults: ["add", "getLatest", "getLatestPassed"],
  certificates: ["list", "get", "add", "update", "countByStatus"],
  payments: ["list", "get", "create", "update", "remove"],
  chat: ["listUsers", "getUser", "getUserBySession", "addUser", "listMessages", "addMessage", "stats"],
  adminLog: ["addLogin", "getLogin", "closeLogin", "listLogins", "addActivity", "listActivities", "facets"],
  adminAccount: ["verify"],
};
