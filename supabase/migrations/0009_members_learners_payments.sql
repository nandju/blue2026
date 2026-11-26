-- Migration 0009 : Membres BLUE, sessions apprenants, accès aux formations
-- et paiements manuels. Phase 5A — pilote supabase préparé pour la phase 7.

-- ─── Membres ────────────────────────────────────────────────────────────────
-- kind 'member' = membre BLUE (BLUE-ADH-NNNN), 'external' = apprenant payant
-- (BLUE-EXT-NNNN). L'identifiant n'est jamais réattribué (member_sequence).
create table if not exists members (
  id               uuid primary key default gen_random_uuid(),
  kind             text not null default 'member' check (kind in ('member','external')),
  identifier       text not null unique,
  first_name       text not null,
  last_name        text not null,
  phone            text not null,
  email            citext,
  commune          text,
  joined_at        timestamptz not null default now(),
  status           text not null default 'pending'
                   check (status in ('active','pending','inactive')),
  activities_count integer not null default 0,
  tshirt           boolean not null default false,
  department       text,
  notes            text,
  origin           text not null default 'manual'
                   check (origin in ('manual','import','recruitment','payment')),
  submission_id    uuid references recruitment_submissions(id) on delete set null,
  -- Code d'accès : haché bcrypt, révoqué en incrémentant code_version ou en
  -- passant access_disabled à true. Le code en clair n'est jamais stocké.
  access_code_hash text,
  code_version     integer not null default 0,
  access_disabled  boolean not null default false,
  created_by       text,
  updated_by       text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- Le téléphone est unique ; l'email est unique quand il est renseigné.
create unique index if not exists idx_members_phone  on members (phone);
create unique index if not exists idx_members_email  on members (email) where email is not null;
create index if not exists idx_members_status        on members (status);
create index if not exists idx_members_kind          on members (kind);

-- Séquence d'identifiants : jamais réattribuée, même après suppression.
create table if not exists member_sequence (
  kind text primary key check (kind in ('member','external')),
  next integer not null default 1
);
insert into member_sequence (kind) values ('member'), ('external')
on conflict (kind) do nothing;

-- ─── Sessions apprenants ────────────────────────────────────────────────────
-- Le cookie jose porte { sub: member_id, cv: code_version } ; une session est
-- révoquée si code_version a changé ou access_disabled est vrai. Cette table
-- matérialise les sessions actives (optionnel : audit, révocation ciblée).
create table if not exists learner_sessions (
  id          uuid primary key default gen_random_uuid(),
  member_id   uuid not null references members(id) on delete cascade,
  code_version integer not null,
  created_at  timestamptz not null default now(),
  expires_at  timestamptz not null,
  revoked_at  timestamptz
);
create index if not exists idx_learner_sessions_member on learner_sessions (member_id);

-- ─── Accès aux formations ───────────────────────────────────────────────────
-- Un accès payant validé (ou manuel) à une formation pour un apprenant.
-- Les membres actifs n'ont pas besoin de ligne : l'accès est calculé.
create table if not exists course_access (
  id         uuid primary key default gen_random_uuid(),
  member_id  uuid not null references members(id) on delete cascade,
  course_id  text not null references courses(id) on delete cascade,
  payment_id uuid,
  granted_at timestamptz not null default now(),
  unique (member_id, course_id)
);
create index if not exists idx_course_access_member on course_access (member_id);
create index if not exists idx_course_access_course on course_access (course_id);

-- ─── Paiements manuels (Mobile Money) ───────────────────────────────────────
create table if not exists payments (
  id              uuid primary key default gen_random_uuid(),
  course_id       text not null references courses(id) on delete cascade,
  course_title    text,
  amount_fcfa     integer,
  first_name      text not null,
  last_name       text not null,
  phone           text not null,
  email           citext,
  operator        text not null check (operator in ('orange','mtn','moov','wave')),
  -- Référence de transaction unique : anti-doublon de déclaration.
  transaction_ref text not null unique,
  screenshot      text,
  status          text not null default 'pending'
                  check (status in ('pending','validated','rejected')),
  reject_reason   text,
  member_id       uuid references members(id) on delete set null,
  ip              inet,
  decided_by      text,
  decided_at      timestamptz,
  created_at      timestamptz not null default now()
);
create index if not exists idx_payments_status     on payments (status);
create index if not exists idx_payments_created_at on payments (created_at);
create index if not exists idx_payments_phone      on payments (phone);

-- ─── Colonnes ajoutées sur les tables existantes ────────────────────────────
alter table courses
  add column if not exists price_fcfa integer not null default 0;

alter table quiz_results
  add column if not exists learner_id uuid references members(id) on delete set null;

alter table certificate_requests
  add column if not exists learner_id uuid references members(id) on delete set null;

create index if not exists idx_quiz_results_learner        on quiz_results (learner_id);
create index if not exists idx_certificate_req_learner     on certificate_requests (learner_id);

-- updated_at automatique sur les membres
create or replace function set_members_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists trg_members_updated_at on members;
create trigger trg_members_updated_at
  before update on members
  for each row execute function set_members_updated_at();

-- RLS : aucune policy publique — tout passe par le serveur (service role).
alter table members            enable row level security;
alter table member_sequence    enable row level security;
alter table learner_sessions   enable row level security;
alter table course_access      enable row level security;
alter table payments           enable row level security;
