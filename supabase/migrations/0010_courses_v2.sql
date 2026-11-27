-- Migration 0010 : Formations v2 — statut brouillon/publié, source PDF,
-- métadonnées IA, seuil de réussite, durée du quiz, progression des
-- apprenants. Phase 5B — pilote supabase préparé pour la phase 7.

-- ─── Formations ─────────────────────────────────────────────────────────────
alter table courses
  -- Cycle de vie : 'draft' (brouillon, invisible publiquement) | 'published'.
  -- Les formations existantes restent publiées (défaut 'published').
  add column if not exists status        text not null default 'published'
                                       check (status in ('draft','published')),
  -- PDF source {name, url, storagePath} quand la formation vient d'un PDF.
  add column if not exists source_pdf    jsonb,
  -- Image de couverture (URL publique du média).
  add column if not exists cover         text,
  -- Seuil de réussite du quiz (en %), durée du quiz (en minutes).
  add column if not exists pass_threshold integer not null default 80
                                       check (pass_threshold between 1 and 100),
  add column if not exists quiz_duration_min integer not null default 20
                                       check (quiz_duration_min between 1 and 180),
  -- Objectifs pédagogiques, glossaire {term, definition}[].
  add column if not exists objectives    jsonb not null default '[]',
  add column if not exists glossary      jsonb not null default '[]',
  -- Métadonnées de génération IA (null pour les formations manuelles).
  add column if not exists ai_provider   text,
  add column if not exists ai_model      text,
  add column if not exists generated_at  timestamptz;

create index if not exists idx_courses_status on courses (status);

-- ─── Progression des apprenants ──────────────────────────────────────────────
-- Modules lus, enregistrés côté serveur (remplace le stockage navigateur).
create table if not exists learner_progress (
  id           uuid primary key default gen_random_uuid(),
  learner_id   uuid not null references members(id) on delete cascade,
  course_id    text not null references courses(id) on delete cascade,
  modules_read  integer[] not null default '{}',
  updated_at   timestamptz not null default now(),
  created_at   timestamptz not null default now(),
  unique (learner_id, course_id)
);

create index if not exists idx_progress_learner on learner_progress (learner_id);
create index if not exists idx_progress_course  on learner_progress (course_id);

alter table learner_progress enable row level security;
