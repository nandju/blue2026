-- BLUE — Bénévole du mois v2 (phase 3)
-- Préparée pour la phase 7. Historique des fiches (une par mois), publication
-- unique, notification planifiée par canaux (popup/bannière/pétales),
-- fréquence d'affichage, version de republication et textes personnalisés.
-- updated_at / updated_by_* existent déjà (0005_audit_columns).

alter table volunteer_of_month
  add column if not exists month text,                    -- « 2024-01 »
  add column if not exists published boolean not null default false,
  add column if not exists notify_enabled boolean not null default false,
  add column if not exists show_popup boolean not null default true,
  add column if not exists show_banner boolean not null default false,
  add column if not exists show_petals boolean not null default true,
  add column if not exists notify_from timestamptz,
  add column if not exists notify_until timestamptz,
  add column if not exists popup_delay_ms integer not null default 1800,
  add column if not exists frequency text not null default 'session'
    check (frequency in ('session', 'day', 'always')),
  add column if not exists notify_version integer not null default 1,
  add column if not exists text_badge text,
  add column if not exists text_banner text,
  add column if not exists text_popup_button text,
  add column if not exists text_banner_button text;

-- Migration des données : l'ancien champ `active` devient `published` et la
-- notification reste activée pour le bénévole d'amorçage (comportement inchangé).
update volunteer_of_month
set published = active,
    notify_enabled = active,
    show_banner = active,
    month = coalesce(month, to_char(period, 'YYYY-MM'))
where published is distinct from active
   or notify_enabled is distinct from active
   or month is null;

-- Si plusieurs fiches étaient actives, seule la plus récente reste publiée.
update volunteer_of_month v
set published = false, notify_enabled = false
where v.published
  and v.id <> (select id from volunteer_of_month where published order by id desc limit 1);

-- Un seul bénévole par mois.
create unique index if not exists volunteer_of_month_month_key
  on volunteer_of_month (month)
  where month is not null;

-- Un seul publié à la fois.
create unique index if not exists volunteer_of_month_one_published
  on volunteer_of_month (published)
  where published;
