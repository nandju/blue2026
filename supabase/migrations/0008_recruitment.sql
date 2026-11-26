-- Migration 0008 : Recrutement (formulaires, candidatures, clics sur boutons-liens)
-- Phase 4 du chantier BLUE — pilote supabase préparé pour la phase 7.

create table if not exists recruitment_forms (
  id                  uuid primary key default gen_random_uuid(),
  slug                text not null unique,
  title               text not null,
  type                text not null,
  type_other          text,
  summary             text,
  description         text,
  cover_image         text,
  location            text,
  confirmation_message text,
  max_submissions     integer,
  position            integer not null default 0,
  featured            boolean not null default false,
  published           boolean not null default false,
  hidden              boolean not null default false,
  visible_from        timestamptz,
  visible_until       timestamptz,
  apply_from          timestamptz,
  apply_until         timestamptz,
  fields              jsonb not null default '[]'::jsonb,
  buttons             jsonb not null default '[]'::jsonb,
  created_by          text,
  updated_by          text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create table if not exists recruitment_submissions (
  id          uuid primary key default gen_random_uuid(),
  form_id     uuid not null references recruitment_forms(id) on delete cascade,
  answers     jsonb not null default '{}'::jsonb,
  email       citext,
  phone       text,
  ip          inet,
  status      text not null default 'new'
              check (status in ('new','reviewed','shortlisted','accepted','rejected')),
  note        text,
  created_at  timestamptz not null default now(),
  -- Anti-doublon : une seule candidature par email OU par téléphone et par recrutement.
  unique (form_id, email),
  unique (form_id, phone)
);

create table if not exists recruitment_status_history (
  id            uuid primary key default gen_random_uuid(),
  submission_id uuid not null references recruitment_submissions(id) on delete cascade,
  from_status   text,
  to_status     text not null,
  changed_by    text,
  changed_at    timestamptz not null default now()
);

create table if not exists recruitment_link_clicks (
  id         uuid primary key default gen_random_uuid(),
  form_id    uuid not null references recruitment_forms(id) on delete cascade,
  button_id  text not null,
  clicked_at timestamptz not null default now()
);

-- Index
create index if not exists idx_recruitment_forms_slug        on recruitment_forms (slug);
create index if not exists idx_recruitment_subs_form_id      on recruitment_submissions (form_id);
create index if not exists idx_recruitment_subs_status       on recruitment_submissions (status);
create index if not exists idx_recruitment_subs_created_at   on recruitment_submissions (created_at);
create index if not exists idx_recruitment_history_subs      on recruitment_status_history (submission_id);
create index if not exists idx_recruitment_clicks_form_id    on recruitment_link_clicks (form_id);

-- updated_at automatique sur les formulaires
create or replace function set_recruitment_forms_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists trg_recruitment_forms_updated_at on recruitment_forms;
create trigger trg_recruitment_forms_updated_at
  before update on recruitment_forms
  for each row execute function set_recruitment_forms_updated_at();

-- RLS : aucune policy publique — tout passe par le serveur (service role).
alter table recruitment_forms            enable row level security;
alter table recruitment_submissions      enable row level security;
alter table recruitment_status_history   enable row level security;
alter table recruitment_link_clicks      enable row level security;
