-- BLUE Academy — schema initial
-- A exécuter une fois dans l'éditeur SQL Supabase (ou via `supabase db push`).

create extension if not exists "pgcrypto";

-- ─── Comptes admin ──────────────────────────────────────────────────────────
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now()
);

-- ─── Formations ─────────────────────────────────────────────────────────────
create table if not exists courses (
  id text primary key,
  title text not null,
  description text not null default '',
  category text not null default 'environnement',
  level text not null default 'Débutant',
  duration text not null default '',
  video text not null default '',
  sections jsonb not null default '[]',
  resources jsonb not null default '[]',
  quiz jsonb not null default '[]',
  enrolled integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── Inscriptions ───────────────────────────────────────────────────────────
create table if not exists registrations (
  id bigint generated always as identity primary key,
  course_id text not null references courses(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  age integer,
  organization text,
  whatsapp text not null,
  email text not null,
  created_at timestamptz not null default now(),
  unique (course_id, email)
);

-- ─── Résultats de quiz ──────────────────────────────────────────────────────
create table if not exists quiz_results (
  id bigint generated always as identity primary key,
  course_id text not null references courses(id) on delete cascade,
  email text not null,
  score integer not null,
  correct integer not null,
  total integer not null,
  passed boolean not null,
  created_at timestamptz not null default now()
);

-- ─── Demandes de certificat officiel ────────────────────────────────────────
create table if not exists certificate_requests (
  id bigint generated always as identity primary key,
  course_id text not null references courses(id) on delete cascade,
  course_title text not null,
  email text not null,
  first_name text not null,
  last_name text not null,
  score integer not null,
  payment_info text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

-- ─── Utilisateurs du chatbot MR BLUE ────────────────────────────────────────
create table if not exists chat_users (
  id text primary key,
  session_id text not null unique,
  last_name text,
  first_name text,
  age text,
  location text,
  job text,
  is_member boolean not null default false,
  motivation text,
  created_at timestamptz not null default now()
);

create table if not exists chat_messages (
  id bigint generated always as identity primary key,
  chat_user_id text not null references chat_users(id) on delete cascade,
  user_message text not null,
  ai_response text not null,
  created_at timestamptz not null default now()
);

-- ─── Bénévole du mois ───────────────────────────────────────────────────────
create table if not exists volunteer_of_month (
  id bigint generated always as identity primary key,
  first_name text not null,
  last_name text not null,
  location text,
  photo_url text,
  actions text,
  contribution text,
  period timestamptz not null default now(),
  active boolean not null default true
);

-- ─── RLS : refusé par défaut, seule la clé service_role (utilisée uniquement
--     côté serveur dans lib/db/*.server.js) contourne ces règles.
alter table users enable row level security;
alter table courses enable row level security;
alter table registrations enable row level security;
alter table quiz_results enable row level security;
alter table certificate_requests enable row level security;
alter table chat_users enable row level security;
alter table chat_messages enable row level security;
alter table volunteer_of_month enable row level security;

-- ─── Données initiales : les 3 formations par défaut (reprises de l'ancien
--     lib/store.js localStorage) pour que l'Academy ne soit pas vide.
insert into courses (id, title, description, category, level, duration, video, sections, resources, quiz, enrolled)
values (
  'intro-pollution-plastique',
  'Introduction à la Pollution Plastique',
  'Comprendre les enjeux de la pollution plastique en Côte d''Ivoire et dans le monde.',
  'environnement', 'Débutant', '2h', 'https://www.youtube.com/embed/Ug_Uix88_xE',
  '[
    {"title":"1. La crise du plastique mondiale","content":"Chaque année, plus de 300 millions de tonnes de plastique sont produites dans le monde. Une grande partie de ce plastique finit dans nos océans, nos rivières et nos sols, menaçant les écosystèmes et la santé humaine.\n\nEn Côte d''Ivoire, la pollution plastique représente un défi majeur pour l''environnement urbain et côtier d''Abidjan jusqu''aux zones rurales."},
    {"title":"2. Impact sur les écosystèmes","content":"Le plastique met des centaines d''années à se décomposer. En se fragmentant, il forme des microplastiques qui s''infiltrent dans la chaîne alimentaire.\n\nLes animaux marins ingèrent ces particules, et elles se retrouvent finalement dans nos assiettes. La dégradation des récifs coralliens et des mangroves côtières est directement liée à la pollution plastique."},
    {"title":"3. Solutions et alternatives","content":"La lutte contre la pollution plastique passe par plusieurs axes : la réduction à la source, le recyclage et la valorisation des déchets, l''éducation et la sensibilisation des communautés.\n\nBLUE agit sur tous ces fronts en Côte d''Ivoire depuis 2022, formant des ambassadeurs et mobilisant les communautés pour un avenir durable."},
    {"title":"4. Le rôle de chaque citoyen","content":"Chaque geste compte dans la lutte contre la pollution plastique. Réduire l''usage du plastique à usage unique, trier ses déchets, participer aux collectes de nettoyage, et sensibiliser son entourage sont des actions concrètes à notre portée.\n\nBLUE vous accompagne pour devenir un ambassadeur de l''environnement dans votre communauté."}
  ]'::jsonb,
  '[{"name":"Guide de réduction plastique BLUE","url":"/docs/blue-guide.pdf"}]'::jsonb,
  '[
    {"question":"Combien de tonnes de plastique sont produites chaque année dans le monde ?","options":["100 millions","200 millions","300 millions","500 millions"],"answer":2},
    {"question":"Quelle est l''une des principales conséquences des microplastiques ?","options":["Augmentation de la température","Infiltration dans la chaîne alimentaire","Réduction de la pluie","Amélioration du sol"],"answer":1},
    {"question":"En quelle année BLUE a-t-elle été fondée ?","options":["2018","2020","2022","2024"],"answer":2},
    {"question":"Quelle ville abrite le siège de BLUE ?","options":["Bouaké","Yamoussoukro","Abidjan","San-Pédro"],"answer":2},
    {"question":"Quel est l''un des axes d''action de BLUE pour lutter contre le plastique ?","options":["Produire plus de plastique","Sensibilisation des communautés","Importer du plastique","Exporter des déchets"],"answer":1}
  ]'::jsonb,
  0
), (
  'formation-ambassadeur',
  'Formation Ambassadeur Environnemental',
  'Devenez un ambassadeur BLUE et mobilisez votre communauté pour la protection de l''environnement.',
  'formation', 'Intermédiaire', '3h', 'https://www.youtube.com/embed/Ug_Uix88_xE',
  '[
    {"title":"1. Le rôle de l''Ambassadeur BLUE","content":"Un ambassadeur BLUE est un leader communautaire formé pour sensibiliser, mobiliser et agir en faveur de l''environnement. Il représente BLUE dans sa communauté et organise des actions de sensibilisation.\n\nLa formation d''ambassadeur est le cœur du programme de BLUE depuis sa fondation en 2022."},
    {"title":"2. Techniques de sensibilisation communautaire","content":"La sensibilisation efficace repose sur des méthodes éprouvées : la communication de proximité, les animations en groupe, l''utilisation des réseaux sociaux, et les partenariats avec les acteurs locaux.\n\nVous apprendrez à adapter votre message selon votre public cible : enfants, adultes ou décideurs."},
    {"title":"3. Organisation d''événements environnementaux","content":"Organiser une collecte de nettoyage, un atelier de recyclage ou une campagne de sensibilisation demande méthode et rigueur.\n\nCette section vous guide étape par étape dans la planification, la mobilisation, la réalisation et le bilan de vos actions environnementales."},
    {"title":"4. Reportage et documentation","content":"Documenter vos actions est essentiel pour mesurer l''impact, rendre compte à BLUE, et partager vos succès avec la communauté.\n\nVous découvrirez comment photographier, filmer et rédiger des rapports d''activité de qualité."},
    {"title":"5. Rejoindre le réseau BLUE","content":"En tant qu''ambassadeur certifié BLUE, vous intégrez un réseau de militants environnementaux engagés à travers toute la Côte d''Ivoire.\n\nVous bénéficierez de formations continues, d''un accès à des ressources exclusives, et d''un accompagnement personnalisé de l''équipe BLUE."}
  ]'::jsonb,
  '[{"name":"Manuel de l''Ambassadeur BLUE","url":"/docs/blue-guide.pdf"},{"name":"Kit de sensibilisation communautaire","url":"/docs/blue-guide.pdf"}]'::jsonb,
  '[
    {"question":"Quel est le rôle principal d''un Ambassadeur BLUE ?","options":["Collecter des fonds","Sensibiliser et mobiliser sa communauté","Gérer les finances de BLUE","Construire des bâtiments"],"answer":1},
    {"question":"Quelle compétence est essentielle pour un ambassadeur efficace ?","options":["La programmation informatique","La communication de proximité","La comptabilité","La médecine"],"answer":1},
    {"question":"Pourquoi est-il important de documenter ses actions ?","options":["Pour avoir plus de vacances","Pour mesurer l''impact et rendre compte","Pour recevoir plus d''argent","Pour quitter BLUE"],"answer":1},
    {"question":"Quel type d''événement un ambassadeur peut-il organiser ?","options":["Concert de musique","Collecte de nettoyage","Match de football","Concours de cuisine"],"answer":1},
    {"question":"Qu''est-ce que le réseau BLUE offre aux ambassadeurs certifiés ?","options":["Un salaire mensuel","Des formations continues et de l''accompagnement","Un logement gratuit","Un véhicule de service"],"answer":1}
  ]'::jsonb,
  0
), (
  'recyclage-economie-circulaire',
  'Recyclage et Économie Circulaire',
  'Maîtrisez les principes du recyclage et de l''économie circulaire pour agir concrètement.',
  'environnement', 'Avancé', '4h', 'https://www.youtube.com/embed/Ug_Uix88_xE',
  '[
    {"title":"1. Principes de l''économie circulaire","content":"L''économie circulaire vise à maintenir les ressources en circulation le plus longtemps possible, à extraire la valeur maximale pendant leur utilisation, puis à récupérer et régénérer les produits et matériaux en fin de vie.\n\nElle s''oppose à l''économie linéaire « produire, utiliser, jeter » qui épuise les ressources naturelles."},
    {"title":"2. Le tri des déchets en pratique","content":"Un tri efficace est la première étape du recyclage. Vous apprendrez à identifier les différents types de plastiques (PET, HDPE, PVC, LDPE, PP, PS), à comprendre les symboles de recyclage.\n\nVous saurez mettre en place un système de tri adapté à votre environnement, qu''il soit domestique ou professionnel."},
    {"title":"3. Valorisation des déchets plastiques","content":"Les déchets plastiques peuvent être transformés en nouvelles ressources : granulés pour la fabrication de nouveaux produits, matériaux de construction, mobilier urbain.\n\nDécouvrez les technologies de valorisation disponibles en Afrique et les initiatives locales innovantes qui transforment les déchets en opportunités économiques."},
    {"title":"4. Modèles économiques durables","content":"L''économie circulaire ouvre de nouvelles opportunités entrepreneuriales. Des modèles comme l''éco-conception, la location plutôt que la vente, la réparation et la remise à neuf créent de la valeur tout en réduisant les déchets.\n\nDécouvrez des cas concrets d''entreprises africaines qui ont réussi cette transition vers la durabilité."}
  ]'::jsonb,
  '[{"name":"Guide du recyclage en Côte d''Ivoire","url":"/docs/blue-guide.pdf"}]'::jsonb,
  '[
    {"question":"Quel est le principe fondamental de l''économie circulaire ?","options":["Produire plus","Maintenir les ressources en circulation","Importer plus","Exporter plus"],"answer":1},
    {"question":"Quel est le symbole qui identifie un plastique recyclable ?","options":["Un carré","Un triangle avec un numéro","Un cercle","Une étoile"],"answer":1},
    {"question":"Comment les déchets plastiques peuvent-ils être valorisés ?","options":["En les brûlant","En les enfouissant","En les transformant en granulés ou matériaux","En les jetant à la mer"],"answer":2},
    {"question":"Qu''est-ce que l''éco-conception ?","options":["Concevoir des produits sans tenir compte de l''environnement","Concevoir des produits en intégrant les critères environnementaux dès la création","Importer des produits écologiques","Exporter des déchets"],"answer":1},
    {"question":"Quelle est l''alternative à l''économie linéaire ?","options":["L''économie circulaire","L''économie informelle","L''économie de marché","L''économie planifiée"],"answer":0}
  ]'::jsonb,
  0
)
on conflict (id) do nothing;

insert into volunteer_of_month (first_name, last_name, location, photo_url, actions, contribution, period, active)
select 'Amenan', 'Kouassi', 'Abidjan, Côte d''Ivoire', null,
  'Organisation de 12 collectes de nettoyage, sensibilisation de 500 personnes dans les quartiers d''Abobo et d''Adjamé.',
  'Collecte de 2 tonnes de plastique, formation de 30 jeunes ambassadeurs environnementaux.',
  now(), true
where not exists (select 1 from volunteer_of_month);
