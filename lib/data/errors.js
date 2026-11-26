// Erreurs métier de la couche de données. Chaque erreur porte le code HTTP
// que les routes API renvoient (voir lib/apiHandler.js).

export class DataError extends Error {
  constructor(message, status = 500, extra = {}) {
    super(message);
    this.name = "DataError";
    this.status = status;
    this.extra = extra;
  }
}

export class NotFoundError extends DataError {
  constructor(message = "Élément introuvable") {
    super(message, 404);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends DataError {
  constructor(message = "Cet élément existe déjà", extra) {
    super(message, 409, extra);
    this.name = "ConflictError";
  }
}

export class BadRequestError extends DataError {
  constructor(message = "Requête invalide", extra) {
    super(message, 400, extra);
    this.name = "BadRequestError";
  }
}

export class ForbiddenError extends DataError {
  constructor(message = "Action non autorisée") {
    super(message, 403);
    this.name = "ForbiddenError";
  }
}

export class ReadOnlyStorageError extends DataError {
  constructor() {
    super(
      "Le stockage est en lecture seule sur cet hébergement : les modifications ne peuvent pas être enregistrées tant que la base de données n'est pas branchée.",
      503
    );
    this.name = "ReadOnlyStorageError";
  }
}

export class CorruptedDataError extends DataError {
  constructor(file) {
    super(
      `Le fichier de données « ${file} » est illisible. Aucune écriture n'a été faite pour ne pas l'écraser : corrigez-le ou restaurez une sauvegarde.`,
      500
    );
    this.name = "CorruptedDataError";
  }
}

export class NotConfiguredError extends DataError {
  constructor() {
    super("Non configuré — phase 7", 503);
    this.name = "NotConfiguredError";
  }
}
