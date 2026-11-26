import { formatDateTime, shortName } from "./ui";

/** « Modifié le … par Nom (Département) » ou « Valeur par défaut ». */
export default function LastModified({ at, by, isDefault = false, className = "" }) {
  if (!at) {
    return <p className={`text-xs text-gray-400 ${className}`}>Valeur par défaut — jamais modifiée</p>;
  }
  return (
    <p className={`text-xs text-gray-400 ${className}`}>
      {isDefault ? "Rétabli par défaut" : "Modifié"} le {formatDateTime(at)}
      {by?.name && (
        <>
          {" "}par <span className="text-gray-600 font-medium">{shortName(by.name)}</span>
          {by.department && ` (${by.department})`}
        </>
      )}
    </p>
  );
}
