-- BLUE — Médiathèque (phase 1)
-- Préparée pour la phase 7. Correspond à data/media.json du pilote local.
-- Les fichiers seront stockés dans le bucket Supabase Storage « media »
-- (envoi direct depuis le navigateur par URL signée, pour contourner la
-- limite de 4,5 Mo par requête de Vercel).

create table if not exists media (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('image', 'video', 'pdf')),
  folder text not null default 'general',
  url text not null unique,
  storage_path text not null,
  original_name text not null,
  mime text not null,
  size bigint not null,
  width integer,
  height integer,
  alt text not null default '',
  created_at timestamptz not null default now(),
  uploaded_by_name text,
  uploaded_by_department text
);

create index if not exists media_type_folder_idx on media (type, folder);
alter table media enable row level security;

-- Bucket public en lecture (les médias sont affichés sur le site public).
-- Les écritures passent uniquement par le serveur (clé service_role / URL signée).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media', 'media', true, 52428800,
  array['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm', 'application/pdf']
)
on conflict (id) do nothing;
