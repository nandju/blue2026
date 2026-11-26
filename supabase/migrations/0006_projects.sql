-- BLUE — Projets (phase 1 : structure ; édition depuis l'admin dans une phase ultérieure)
-- Préparée pour la phase 7. Correspond à data/projects.json du pilote local,
-- amorcé depuis json/data.json (mêmes champs, en snake_case).

create table if not exists projects (
  id text primary key,                  -- = slug
  slug text not null unique,
  title text not null,
  description jsonb not null default '[]',   -- paragraphes (champ « desc » du JSON)
  year text,
  thumbnail text,
  images jsonb not null default '[]',
  tags jsonb not null default '[]',          -- champ « tech » du JSON
  categories integer[] not null default '{}',-- champ « category » du JSON
  show boolean not null default true,
  preview text,
  code text,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by_name text,
  created_by_department text,
  updated_by_name text,
  updated_by_department text
);

alter table projects enable row level security;
