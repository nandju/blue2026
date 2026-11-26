-- BLUE — Journal des connexions et des activités de l'administration (phase 1)
-- Préparée pour la phase 7 (pilote Supabase). Correspond à data/admin-logins.json
-- et data/admin-activities.json du pilote local.
-- Le journal est en lecture seule depuis l'admin : aucune route ne supprime de ligne.

create extension if not exists "pgcrypto";

create table if not exists admin_login_logs (
  id uuid primary key default gen_random_uuid(),
  at timestamptz not null default now(),
  name text not null,
  department text not null,
  email text,
  success boolean not null,
  reason text,                          -- motif d'échec (« Mot de passe incorrect »…)
  ip text,
  user_agent text,
  browser text,
  os text,
  device text,                          -- Ordinateur / Mobile / Tablette
  expires_at timestamptz,               -- fin prévue de la session (8 h)
  logout_at timestamptz,
  logout_reason text
);

create index if not exists admin_login_logs_at_idx on admin_login_logs (at desc);
create index if not exists admin_login_logs_name_idx on admin_login_logs (name);

create table if not exists admin_activity_logs (
  id uuid primary key default gen_random_uuid(),
  at timestamptz not null default now(),
  login_id uuid references admin_login_logs(id) on delete set null,
  name text not null,
  department text not null,
  email text,
  action text not null,                 -- Création, Modification, Suppression, Publication…
  module text not null,                 -- Contenu, Webmaster, Formations, Médias…
  target text,                          -- élément concerné (titre lisible)
  changes jsonb not null default '[]'   -- [{ "field", "from", "to" }]
);

create index if not exists admin_activity_logs_at_idx on admin_activity_logs (at desc);
create index if not exists admin_activity_logs_module_idx on admin_activity_logs (module);

alter table admin_login_logs enable row level security;
alter table admin_activity_logs enable row level security;
