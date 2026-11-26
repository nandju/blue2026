// Schémas des sections éditables : décrivent chaque champ pour l'éditeur
// (/admin/contenu), la validation serveur et la fusion avec les valeurs par
// défaut. Aucun import serveur : utilisable côté navigateur.
//
// Types de champs :
//   text        → ligne unique
//   textarea    → texte long
//   image       → MediaPicker (null = défaut · "" = aucune image)
//   video       → MediaPicker type vidéo (fichier ou lien YouTube/Vimeo)
//   gallery     → GalleryEditor ([{ url, alt, caption }], vide = défaut)
//   link        → { label, href }
//   icon        → clé de lib/content/icons.js
//   list        → liste d'objets (itemFields), ajout/suppression/ordre
//   stringlist  → liste de textes courts
//   select      → liste déroulante (options)

const linkItem = [
  { key: "label", type: "text", label: "Libellé", required: true, max: 60 },
  { key: "href", type: "text", label: "Lien (URL)", required: true, max: 500 },
];

const buttonItem = [
  ...linkItem,
  {
    key: "variant",
    type: "select",
    label: "Style",
    options: [
      { value: "primary", label: "Plein (couleur secondaire)" },
      { value: "secondary", label: "Contour blanc" },
    ],
  },
];

const buttonsField = (max = 3) => ({
  key: "buttons",
  type: "list",
  label: "Boutons",
  addLabel: "+ Ajouter un bouton",
  itemLabel: (it) => it.label || "Bouton",
  itemFields: buttonItem,
  max,
});

const heroFields = (folder) => [
  { key: "image", type: "image", label: "Image de fond", folder },
  { key: "eyebrow", type: "text", label: "Surtitre", max: 120 },
  { key: "title", type: "text", label: "Titre", required: true, max: 160 },
  { key: "description", type: "textarea", label: "Description", max: 600 },
  buttonsField(3),
];

const iconTextItem = (withText = true) => [
  { key: "icon", type: "icon", label: "Icône" },
  { key: "title", type: "text", label: "Titre", required: true, max: 120 },
  ...(withText ? [{ key: "text", type: "textarea", label: "Texte", max: 600 }] : []),
];

export const CONTENT_PAGES = [
  { id: "home", label: "Accueil", path: "/" },
  { id: "about", label: "À propos", path: "/about" },
  { id: "benevolat", label: "Bénévolat", path: "/benevolat" },
  { id: "contact", label: "Contact", path: "/contact" },
  { id: "partenaires", label: "Partenaires", path: "/partenaires" },
  { id: "projectsPage", label: "Nos actions", path: "/projects" },
  { id: "shared", label: "Éléments communs" },
];

export const SECTION_SCHEMAS = {
  // ─── Éléments communs ────────────────────────────────────────────────────
  "shared.seo": {
    label: "Référencement (SEO)",
    description: "Titre, description et image de partage du site (Google, réseaux sociaux).",
    fields: [
      { key: "title", type: "text", label: "Titre du site", required: true, max: 120 },
      { key: "description", type: "textarea", label: "Description", max: 300 },
      { key: "keywords", type: "stringlist", label: "Mots-clés", addLabel: "+ Ajouter un mot-clé", max: 30 },
      { key: "ogTitle", type: "text", label: "Titre de partage (OpenGraph)", max: 120 },
      { key: "ogDescription", type: "textarea", label: "Description de partage", max: 300 },
      { key: "ogImage", type: "image", label: "Image de partage", folder: "general" },
    ],
  },
  "shared.navbar": {
    label: "Menu de navigation",
    fields: [
      {
        key: "links",
        type: "list",
        label: "Liens du menu",
        addLabel: "+ Ajouter un lien",
        itemLabel: (it) => it.label || "Lien",
        itemFields: linkItem,
        max: 12,
      },
      { key: "cta", type: "link", label: "Bouton « Nous rejoindre »" },
    ],
  },
  "shared.footer": {
    label: "Pied de page",
    fields: [
      { key: "description", type: "textarea", label: "Présentation de BLUE", max: 500 },
      { key: "exploreTitle", type: "text", label: "Titre colonne « Explorer »", max: 60 },
      { key: "exploreLinks", type: "list", label: "Liens « Explorer »", addLabel: "+ Ajouter un lien", itemLabel: (it) => it.label || "Lien", itemFields: linkItem, max: 10 },
      { key: "engageTitle", type: "text", label: "Titre colonne « S'engager »", max: 60 },
      { key: "engageLinks", type: "list", label: "Liens « S'engager »", addLabel: "+ Ajouter un lien", itemLabel: (it) => it.label || "Lien", itemFields: linkItem, max: 10 },
      { key: "contactTitle", type: "text", label: "Titre colonne « Contact »", max: 60 },
      { key: "tagline", type: "text", label: "Phrase de bas de page", max: 120 },
    ],
  },
  "shared.zones": {
    label: "Zones WhatsApp",
    description: "Groupes WhatsApp affichés sur l'accueil, /benevolat et /contact.",
    fields: [
      {
        key: "list",
        type: "list",
        label: "Zones",
        addLabel: "+ Ajouter une zone",
        itemLabel: (it) => it.name || "Zone",
        itemFields: [
          { key: "name", type: "text", label: "Nom de la zone", required: true, max: 80 },
          { key: "areas", type: "text", label: "Localités couvertes", max: 200 },
          { key: "link", type: "text", label: "Lien du groupe WhatsApp", required: true, max: 500 },
        ],
        max: 10,
      },
    ],
  },

  // ─── Accueil ─────────────────────────────────────────────────────────────
  "home.hero": {
    label: "Bannière vidéo (Hero)",
    fields: [
      { key: "video", type: "video", label: "Vidéo de fond", folder: "accueil" },
      { key: "poster", type: "image", label: "Image d'attente (poster)", folder: "accueil" },
      { key: "eyebrow", type: "text", label: "Surtitre", max: 120 },
      { key: "titleLine1", type: "text", label: "Titre — ligne 1", required: true, max: 80 },
      { key: "titleLine2", type: "text", label: "Titre — ligne 2", max: 80 },
      { key: "titleLine3", type: "text", label: "Titre — ligne 3 (en couleur)", max: 100 },
      { key: "subtitle", type: "textarea", label: "Sous-titre", max: 400 },
      buttonsField(3),
      { key: "scrollHint", type: "text", label: "Indicateur de défilement", max: 40 },
    ],
  },
  "home.mission": {
    label: "Qui sommes-nous",
    fields: [
      { key: "eyebrow", type: "text", label: "Surtitre", max: 80 },
      { key: "title", type: "text", label: "Titre", required: true, max: 120 },
      { key: "text", type: "textarea", label: "Texte", max: 1000 },
      {
        key: "features",
        type: "list",
        label: "Blocs mission / vision",
        addLabel: "+ Ajouter un bloc",
        itemLabel: (it) => it.title || "Bloc",
        itemFields: iconTextItem(),
        max: 6,
      },
      { key: "image", type: "image", label: "Image principale", folder: "accueil" },
      { key: "imageAlt", type: "text", label: "Texte alternatif de l'image principale", max: 200 },
      { key: "imageOverlay", type: "image", label: "Petite image superposée", folder: "accueil" },
      { key: "imageOverlayAlt", type: "text", label: "Texte alternatif de la petite image", max: 200 },
      { key: "cta", type: "link", label: "Bouton" },
    ],
  },
  "home.gallery": {
    label: "Galerie photo",
    fields: [
      { key: "title", type: "text", label: "Titre", required: true, max: 80 },
      { key: "subtitle", type: "text", label: "Sous-titre", max: 200 },
      { key: "images", type: "gallery", label: "Images de la galerie", folder: "accueil", max: 30 },
    ],
  },
  "home.axes": {
    label: "Axes d'intervention & valeurs",
    fields: [
      { key: "eyebrow", type: "text", label: "Surtitre", max: 80 },
      { key: "title", type: "text", label: "Titre", required: true, max: 120 },
      { key: "description", type: "textarea", label: "Description", max: 400 },
      {
        key: "items",
        type: "list",
        label: "Cartes (axes et valeurs)",
        addLabel: "+ Ajouter une carte",
        itemLabel: (it) => it.title || "Carte",
        itemFields: iconTextItem(),
        max: 9,
      },
    ],
  },
  "home.quote": {
    label: "Citation",
    fields: [
      { key: "quote", type: "textarea", label: "Citation", required: true, max: 300 },
      { key: "text", type: "textarea", label: "Texte d'accompagnement", max: 600 },
      { key: "imageLeft", type: "image", label: "Photo de gauche", folder: "accueil" },
      { key: "imageLeftAlt", type: "text", label: "Texte alternatif (gauche)", max: 200 },
      { key: "imageRight", type: "image", label: "Photo de droite", folder: "accueil" },
      { key: "imageRightAlt", type: "text", label: "Texte alternatif (droite)", max: 200 },
    ],
  },
  "home.projects": {
    label: "Projets vedettes",
    description: "Les projets eux-mêmes se gèrent dans « Nos actions → Actions / Projets ».",
    fields: [
      { key: "eyebrow", type: "text", label: "Surtitre", max: 80 },
      { key: "title", type: "text", label: "Titre", required: true, max: 120 },
      { key: "description", type: "textarea", label: "Description", max: 400 },
      {
        key: "featured",
        type: "stringlist",
        label: "Projets mis en avant (slugs, dans l'ordre)",
        help: "Identifiant du projet, ex. recycl-day. Laisser vide pour afficher les 3 premiers projets visibles.",
        addLabel: "+ Ajouter un projet",
        max: 6,
      },
      { key: "cta", type: "link", label: "Bouton « Voir toutes nos actions »" },
    ],
  },
  "home.volunteer": {
    label: "Bénévole du mois (cadre)",
    description: "Le bénévole lui-même se gère dans « Bénévole du mois ». Ici : les textes autour.",
    fields: [
      { key: "eyebrow", type: "text", label: "Surtitre", max: 80 },
      { key: "title", type: "text", label: "Titre", required: true, max: 80 },
      { key: "description", type: "textarea", label: "Description", max: 400 },
      { key: "badge", type: "text", label: "Badge au-dessus du nom", max: 60 },
      { key: "actionsLabel", type: "text", label: "Libellé « Actions réalisées »", max: 60 },
      { key: "contributionLabel", type: "text", label: "Libellé « Contribution »", max: 60 },
      { key: "emptyText", type: "textarea", label: "Texte quand aucun bénévole n'est publié", max: 400 },
      { key: "emptyCta", type: "link", label: "Bouton (aucun bénévole)" },
    ],
  },
  "home.academy": {
    label: "Bande Blue Academy",
    fields: [
      { key: "bgImage", type: "image", label: "Image de fond", folder: "accueil" },
      { key: "title", type: "text", label: "Titre", required: true, max: 80 },
      { key: "lead", type: "textarea", label: "Texte d'accroche", max: 300 },
      { key: "perks", type: "stringlist", label: "Points forts", addLabel: "+ Ajouter un point fort", max: 8 },
      { key: "cta", type: "link", label: "Bouton" },
    ],
  },
  "home.community": {
    label: "Communauté (zones WhatsApp)",
    description: "La liste des zones se modifie dans « Éléments communs → Zones WhatsApp ».",
    fields: [
      { key: "eyebrow", type: "text", label: "Surtitre", max: 80 },
      { key: "title", type: "text", label: "Titre", required: true, max: 120 },
      { key: "description", type: "textarea", label: "Description", max: 400 },
      { key: "ctaLabel", type: "text", label: "Libellé du lien", max: 60 },
    ],
  },
  "home.partnersCta": {
    label: "Appel aux partenaires",
    fields: [
      { key: "eyebrow", type: "text", label: "Surtitre", max: 80 },
      { key: "title", type: "text", label: "Titre", required: true, max: 160 },
      { key: "text", type: "textarea", label: "Texte", max: 400 },
      { key: "cta", type: "link", label: "Bouton" },
    ],
  },
  "home.cta": {
    label: "Appel à l'action final",
    fields: [
      { key: "title", type: "text", label: "Titre", required: true, max: 120 },
      { key: "text", type: "textarea", label: "Texte", max: 400 },
      buttonsField(3),
    ],
  },

  // ─── À propos ────────────────────────────────────────────────────────────
  "about.hero": { label: "Bannière", fields: heroFields("a-propos") },
  "about.story": {
    label: "Notre histoire",
    fields: [
      { key: "eyebrow", type: "text", label: "Surtitre", max: 80 },
      { key: "title", type: "text", label: "Titre", required: true, max: 120 },
      { key: "paragraphs", type: "stringlist", label: "Paragraphes", textarea: true, addLabel: "+ Ajouter un paragraphe", max: 8 },
      { key: "image", type: "image", label: "Image principale", folder: "a-propos" },
      { key: "imageAlt", type: "text", label: "Texte alternatif", max: 200 },
      { key: "imageOverlay", type: "image", label: "Petite image superposée", folder: "a-propos" },
      { key: "imageOverlayAlt", type: "text", label: "Texte alternatif (superposée)", max: 200 },
    ],
  },
  "about.missionVision": {
    label: "Mission & Vision",
    fields: [
      {
        key: "cards",
        type: "list",
        label: "Cartes",
        addLabel: "+ Ajouter une carte",
        itemLabel: (it) => it.title || "Carte",
        itemFields: iconTextItem(),
        max: 4,
      },
    ],
  },
  "about.axes": {
    label: "Axes & valeurs",
    fields: [
      { key: "eyebrow", type: "text", label: "Surtitre", max: 80 },
      { key: "title", type: "text", label: "Titre", required: true, max: 120 },
      { key: "description", type: "textarea", label: "Description", max: 400 },
      { key: "items", type: "list", label: "Axes", addLabel: "+ Ajouter un axe", itemLabel: (it) => it.title || "Axe", itemFields: iconTextItem(), max: 6 },
      {
        key: "values",
        type: "list",
        label: "Valeurs (pastilles)",
        addLabel: "+ Ajouter une valeur",
        itemLabel: (it) => it.name || "Valeur",
        itemFields: [
          { key: "icon", type: "icon", label: "Icône" },
          { key: "name", type: "text", label: "Nom", required: true, max: 60 },
        ],
        max: 8,
      },
    ],
  },
  "about.timeline": {
    label: "Chronologie",
    fields: [
      { key: "eyebrow", type: "text", label: "Surtitre", max: 80 },
      { key: "title", type: "text", label: "Titre", required: true, max: 120 },
      {
        key: "items",
        type: "list",
        label: "Étapes",
        addLabel: "+ Ajouter une étape",
        itemLabel: (it) => `${it.year || "?"} — ${it.title || "Étape"}`,
        itemFields: [
          { key: "year", type: "text", label: "Période", required: true, max: 30 },
          { key: "title", type: "text", label: "Titre", required: true, max: 120 },
          { key: "text", type: "textarea", label: "Texte", max: 600 },
        ],
        max: 15,
      },
    ],
  },
  "about.team": {
    label: "Équipe dirigeante",
    fields: [
      { key: "eyebrow", type: "text", label: "Surtitre", max: 80 },
      { key: "title", type: "text", label: "Titre", required: true, max: 120 },
      { key: "description", type: "textarea", label: "Description", max: 400 },
      {
        key: "members",
        type: "list",
        label: "Membres",
        addLabel: "+ Ajouter un membre",
        itemLabel: (it) => it.name || "Membre",
        itemFields: [
          { key: "name", type: "text", label: "Nom", required: true, max: 80 },
          { key: "role", type: "text", label: "Rôle", required: true, max: 80 },
          { key: "photo", type: "image", label: "Photo (facultative)", folder: "a-propos" },
        ],
        max: 12,
      },
    ],
  },
  "about.cta": {
    label: "Appel à l'action",
    fields: [
      { key: "title", type: "text", label: "Titre", required: true, max: 120 },
      { key: "text", type: "text", label: "Texte", max: 200 },
      buttonsField(3),
    ],
  },

  // ─── Bénévolat ───────────────────────────────────────────────────────────
  "benevolat.hero": { label: "Bannière", fields: heroFields("benevoles") },
  "benevolat.fields": {
    label: "Domaines d'intervention",
    fields: [
      { key: "eyebrow", type: "text", label: "Surtitre", max: 80 },
      { key: "title", type: "text", label: "Titre", required: true, max: 120 },
      { key: "description", type: "textarea", label: "Description", max: 400 },
      { key: "items", type: "list", label: "Domaines", addLabel: "+ Ajouter un domaine", itemLabel: (it) => it.title || "Domaine", itemFields: iconTextItem(), max: 8 },
    ],
  },
  "benevolat.steps": {
    label: "Parcours en 4 étapes",
    fields: [
      { key: "eyebrow", type: "text", label: "Surtitre", max: 80 },
      { key: "title", type: "text", label: "Titre", required: true, max: 120 },
      { key: "description", type: "textarea", label: "Description", max: 400 },
      {
        key: "items",
        type: "list",
        label: "Étapes",
        addLabel: "+ Ajouter une étape",
        itemLabel: (it) => it.title || "Étape",
        itemFields: [
          { key: "num", type: "text", label: "Numéro", max: 10 },
          { key: "title", type: "text", label: "Titre", required: true, max: 120 },
          { key: "text", type: "textarea", label: "Texte", max: 400 },
        ],
        max: 8,
      },
      { key: "transparency", type: "textarea", label: "Encadré transparence (T-shirt, 2 activités)", max: 500 },
    ],
  },
  "benevolat.zones": {
    label: "Zones WhatsApp",
    description: "La liste des zones se modifie dans « Éléments communs → Zones WhatsApp ».",
    fields: [
      { key: "eyebrow", type: "text", label: "Surtitre", max: 80 },
      { key: "title", type: "text", label: "Titre", required: true, max: 120 },
      { key: "description", type: "textarea", label: "Description", max: 400 },
      { key: "ctaLabel", type: "text", label: "Libellé du lien", max: 60 },
    ],
  },
  "benevolat.mrblue": {
    label: "Renvoi vers MR BLUE",
    fields: [
      { key: "title", type: "text", label: "Titre", required: true, max: 120 },
      { key: "text", type: "textarea", label: "Texte", max: 500 },
      { key: "cta", type: "link", label: "Bouton" },
    ],
  },

  // ─── Contact ─────────────────────────────────────────────────────────────
  "contact.hero": { label: "Bannière", fields: heroFields("general") },
  "contact.channels": {
    label: "Coordonnées & réseaux",
    description: "Téléphones, email, adresse et réseaux sociaux se modifient dans /admin/webmaster.",
    fields: [
      { key: "eyebrow", type: "text", label: "Surtitre", max: 80 },
      { key: "title", type: "text", label: "Titre", required: true, max: 120 },
      { key: "socialsIntro", type: "text", label: "Phrase au-dessus des réseaux", max: 120 },
    ],
  },
  "contact.zones": {
    label: "Zones WhatsApp",
    description: "La liste des zones se modifie dans « Éléments communs → Zones WhatsApp ».",
    fields: [
      { key: "eyebrow", type: "text", label: "Surtitre", max: 80 },
      { key: "title", type: "text", label: "Titre", required: true, max: 120 },
      { key: "description", type: "textarea", label: "Description", max: 400 },
      { key: "ctaLabel", type: "text", label: "Libellé du lien", max: 60 },
    ],
  },
  "contact.mrblue": {
    label: "Renvoi vers MR BLUE",
    fields: [
      { key: "title", type: "text", label: "Titre", required: true, max: 120 },
      { key: "text", type: "textarea", label: "Texte", max: 500 },
    ],
  },

  // ─── Partenaires ─────────────────────────────────────────────────────────
  "partenaires.hero": { label: "Bannière", fields: heroFields("partenaires") },
  "partenaires.types": {
    label: "Types de partenariat",
    fields: [
      { key: "eyebrow", type: "text", label: "Surtitre", max: 80 },
      { key: "title", type: "text", label: "Titre", required: true, max: 120 },
      { key: "description", type: "textarea", label: "Description", max: 400 },
      { key: "items", type: "list", label: "Types", addLabel: "+ Ajouter un type", itemLabel: (it) => it.title || "Type", itemFields: iconTextItem(), max: 8 },
    ],
  },
  "partenaires.partners": {
    label: "Liste des partenaires",
    fields: [
      { key: "eyebrow", type: "text", label: "Surtitre", max: 80 },
      { key: "title", type: "text", label: "Titre", required: true, max: 120 },
      { key: "description", type: "textarea", label: "Description", max: 400 },
      {
        key: "list",
        type: "list",
        label: "Partenaires (vide = message « à compléter »)",
        addLabel: "+ Ajouter un partenaire",
        itemLabel: (it) => it.name || "Partenaire",
        itemFields: [
          { key: "name", type: "text", label: "Nom", required: true, max: 120 },
          { key: "logo", type: "image", label: "Logo", folder: "partenaires" },
          { key: "text", type: "textarea", label: "Description", max: 300 },
          { key: "url", type: "text", label: "Site web (facultatif)", max: 300 },
        ],
        max: 24,
      },
      { key: "emptyIcon", type: "text", label: "Icône (liste vide)", max: 10 },
      { key: "emptyTitle", type: "text", label: "Titre (liste vide)", max: 120 },
      { key: "emptyText", type: "textarea", label: "Texte (liste vide)", max: 500 },
    ],
  },
  "partenaires.cta": {
    label: "Appel à l'action",
    fields: [
      { key: "title", type: "text", label: "Titre", required: true, max: 120 },
      { key: "text", type: "text", label: "Texte", max: 200 },
      { key: "button", type: "link", label: "Bouton" },
    ],
  },

  // ─── Pages projets ───────────────────────────────────────────────────────
  "projectsPage.hero": { label: "Bannière « Nos actions »", fields: heroFields("projets") },
  "projectsPage.featured": {
    label: "Projet phare (mise en avant)",
    description: "Le projet mis en avant est le premier projet visible de la liste.",
    fields: [
      { key: "eyebrow", type: "text", label: "Surtitre", max: 80 },
      { key: "image", type: "image", label: "Image principale", folder: "projets" },
      { key: "imageOverlay", type: "image", label: "Petite image superposée", folder: "projets" },
      { key: "imageOverlayAlt", type: "text", label: "Texte alternatif (superposée)", max: 200 },
      { key: "tagline", type: "text", label: "Accroche", max: 120 },
      { key: "ctaLabel", type: "text", label: "Libellé du bouton", max: 60 },
    ],
  },
  "projectsPage.catalog": {
    label: "Catalogue des projets",
    fields: [
      { key: "eyebrow", type: "text", label: "Surtitre", max: 80 },
      { key: "title", type: "text", label: "Titre", required: true, max: 120 },
      { key: "description", type: "textarea", label: "Description", max: 400 },
      { key: "archiveCta", type: "text", label: "Bouton vers les archives", max: 60 },
    ],
  },
  "projectsPage.archive": {
    label: "Page Archives",
    fields: [
      { key: "hero.image", type: "image", label: "Image de fond", folder: "projets", path: "hero.image" },
      { key: "hero.eyebrow", type: "text", label: "Surtitre", max: 80, path: "hero.eyebrow" },
      { key: "hero.title", type: "text", label: "Titre", required: true, max: 120, path: "hero.title" },
      { key: "hero.description", type: "textarea", label: "Description", max: 400, path: "hero.description" },
      { key: "backCta", type: "text", label: "Bouton retour", max: 60 },
    ],
  },
};

/** Schéma d'une section : { label, description?, fields } */
export const sectionSchema = (pageId, sectionId) => SECTION_SCHEMAS[`${pageId}.${sectionId}`] || null;

/** Sections éditables d'une page, dans l'ordre d'affichage. */
export function pageSections(pageId) {
  const prefix = `${pageId}.`;
  const defaults = Object.keys(SECTION_SCHEMAS)
    .filter((k) => k.startsWith(prefix))
    .map((k) => k.slice(prefix.length));
  const order = pageId === "home" ? ["hero", "mission", "gallery", "axes", "quote", "projects", "volunteer", "academy", "community", "partnersCta", "cta"] : null;
  if (!order) return defaults;
  return [...order.filter((s) => defaults.includes(s)), ...defaults.filter((s) => !order.includes(s))];
}
