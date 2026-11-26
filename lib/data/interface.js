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
  recruitment: [
    "list", "get", "getBySlug", "create", "update", "remove", "duplicate",
    "listSubmissions", "getSubmission", "countSubmissions", "findDuplicate",
    "addSubmission", "updateSubmission", "removeSubmission",
    "recordClick", "clickCounts", "saveSubmissionFile",
  ],
  members: [
    "list", "get", "getByIdentifier", "getByPhone", "create", "update", "remove",
    "regenerateAccessCode", "setAccessDisabled", "verifyAccessCode",
    "listAccess", "grantAccess", "importRows", "count", "activeSuggestion",
  ],
  courses: ["list", "get", "create", "update", "remove", "incrementEnrolled", "count"],
  registrations: ["list", "add", "isRegistered", "count"],
  quizResults: [
    "add", "getLatest", "getLatestPassed",
    "getLatestForLearner", "getLatestPassedForLearner", "listByLearner",
  ],
  certificates: ["list", "get", "add", "update", "countByStatus", "listByLearner"],
  payments: [
    "list", "get", "create", "validate", "reject", "countPending", "saveScreenshot",
  ],
  chat: ["listUsers", "getUser", "getUserBySession", "addUser", "listMessages", "addMessage", "stats"],
  adminLog: ["addLogin", "getLogin", "closeLogin", "listLogins", "addActivity", "listActivities", "facets"],
  adminAccount: ["verify"],
};
