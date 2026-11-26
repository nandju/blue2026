-- BLUE — Auteur des dernières modifications (« Modifié le … par … ») (phase 1)
-- Préparée pour la phase 7. Ajoute les colonnes que le pilote local renseigne
-- déjà dans data/courses.json, data/volunteers.json et data/certificate-requests.json.

alter table courses
  add column if not exists created_by_name text,
  add column if not exists created_by_department text,
  add column if not exists updated_by_name text,
  add column if not exists updated_by_department text;

alter table volunteer_of_month
  add column if not exists updated_at timestamptz,
  add column if not exists updated_by_name text,
  add column if not exists updated_by_department text;

alter table certificate_requests
  add column if not exists updated_at timestamptz,
  add column if not exists updated_by_name text,
  add column if not exists updated_by_department text;
