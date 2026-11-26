-- BLUE — Contenus éditables et réglages du site (phase 1)
-- Préparée pour la phase 7. Correspond à data/content.json et data/settings.json.
-- Une ligne par clé ; value = null quand la valeur par défaut (définie dans le
-- code) est rétablie.

create table if not exists site_content (
  key text primary key,
  value jsonb,
  is_default boolean not null default false,
  updated_at timestamptz not null default now(),
  updated_by_name text,
  updated_by_department text
);

create table if not exists site_settings (
  key text primary key,                 -- ex. « departments »
  value jsonb,
  is_default boolean not null default false,
  updated_at timestamptz not null default now(),
  updated_by_name text,
  updated_by_department text
);

alter table site_content enable row level security;
alter table site_settings enable row level security;
