// Valeurs par défaut de tout le contenu éditable du site.
// Reprise MOT POUR MOT des textes, images, vidéos et listes précédemment
// écrits en dur dans les composants. Tant que rien n'est modifié dans l'admin,
// le site s'affiche exactement avec ces valeurs.
//
// Conventions :
//   - image/vidéo : chemin public en chaîne ("/ong_blue/…" ou "/uploads/…")
//   - galerie : [{ url, alt, caption }]
//   - lien : { label, href, variant? } — variant: "primary" | "secondary"
//   - icône : clé de lib/content/icons.js
//   - shared.zones : liste unique des groupes WhatsApp (accueil, bénévolat, contact)

const ILL = "/ong_blue/images/illustrations";

export const HOME_SECTION_ORDER = [
  "hero",
  "mission",
  "gallery",
  "axes",
  "quote",
  "projects",
  "volunteer",
  "academy",
  "community",
  "partnersCta",
  "cta",
];

export const DEFAULT_CONTENT = {
  // ─── Éléments partagés ────────────────────────────────────────────────────
  shared: {
    seo: {
      title: "BLUE | Ensemble Contre la Pollution Plastique",
      description:
        "BLUE est une ONG ivoirienne dédiée à la lutte contre la pollution plastique. Nous mobilisons citoyens, entreprises et communautés pour protéger l'environnement et construire un avenir durable.",
      keywords: [
        "BLUE",
        "BLUE Makers",
        "ONG Côte d'Ivoire",
        "pollution plastique",
        "environnement",
        "recyclage",
        "développement durable",
        "Abidjan",
        "protection océans",
        "reforestation",
      ],
      ogTitle: "BLUE | Ensemble Contre la Pollution Plastique",
      ogDescription:
        "ONG ivoirienne dédiée à la lutte contre la pollution plastique et la protection de l'environnement.",
      ogImage: "/og-image-rev.png",
    },
    navbar: {
      links: [
        { label: "Accueil", href: "/" },
        { label: "À Propos", href: "/about" },
        { label: "Nos Actions", href: "/projects" },
        { label: "Blue Academy", href: "/academy" },
        { label: "Bénévolat", href: "/benevolat" },
        { label: "Partenaires", href: "/partenaires" },
        { label: "Contact", href: "/contact" },
      ],
      cta: { label: "Nous rejoindre", href: "/benevolat" },
    },
    footer: {
      description:
        "ONG ivoirienne fondée en janvier 2022 à Abidjan. Nous luttons contre la pollution plastique, protégeons les océans et formons des ambassadeurs de l'environnement.",
      exploreTitle: "Explorer",
      exploreLinks: [
        { label: "Accueil", href: "/" },
        { label: "À propos de BLUE", href: "/about" },
        { label: "Nos actions", href: "/projects" },
        { label: "Archives", href: "/projects/archive" },
      ],
      engageTitle: "S'engager",
      engageLinks: [
        { label: "Blue Academy", href: "/academy" },
        { label: "Devenir bénévole", href: "/benevolat" },
        { label: "Nos partenaires", href: "/partenaires" },
        { label: "Nous contacter", href: "/contact" },
      ],
      contactTitle: "Contact",
      tagline: "Ensemble contre la pollution plastique 🌊",
    },
    zones: {
      list: [
        {
          name: "Abidjan Nord",
          areas: "Cocody · Yopougon · Abobo · Attécoubé · Anyama · Plateau · Bingerville",
          link: "https://chat.whatsapp.com/CTyNHv6t1VJ22htKymlt4w",
        },
        {
          name: "Abidjan Sud",
          areas: "Marcory · Treichville · Koumassi · Port-Bouët",
          link: "https://chat.whatsapp.com/Cl0LSqe35hBFjuLPPV13nm",
        },
        {
          name: "Intérieur du pays",
          areas: "Toutes les autres villes et localités de Côte d'Ivoire",
          link: "https://chat.whatsapp.com/DEAAJI4DLZB33aFQr0VJzf",
        },
      ],
    },
  },

  // ─── Accueil ──────────────────────────────────────────────────────────────
  home: {
    layout: { order: HOME_SECTION_ORDER, hidden: [] },
    hero: {
      eyebrow: "ONG Environnementale · Abidjan, Côte d'Ivoire",
      titleLine1: "Pour les Océans.",
      titleLine2: "Pour les Hommes.",
      titleLine3: "Pour les Générations Futures.",
      subtitle:
        "Depuis janvier 2022, BLUE mobilise citoyens et communautés pour lutter contre la pollution plastique et protéger l'environnement en Côte d'Ivoire.",
      buttons: [
        { label: "Devenir bénévole", href: "/benevolat", variant: "primary" },
        { label: "Découvrir nos actions", href: "/projects", variant: "secondary" },
      ],
      video: "/ong_blue/videos/ocean-waves-drone.mp4",
      poster: `${ILL}/page-landing/ocean-conservation-initiative-blue.jpg`,
      scrollHint: "Défiler",
    },
    mission: {
      eyebrow: "Qui sommes-nous",
      title: "BLUE, au service de la planète",
      text: "BLUE est une organisation non gouvernementale fondée en janvier 2022 à Abidjan. Nous organisons des collectes de déchets plastiques, des nettoyages de plages et de lagunes, des plantations d'arbres et des campagnes de sensibilisation pour réduire l'empreinte environnementale des populations.",
      features: [
        {
          icon: "bullseye",
          title: "Notre mission",
          text: "Créer des citoyens engagés pour la protection de l'environnement, la réduction de l'empreinte écologique et la lutte contre la pollution plastique.",
        },
        {
          icon: "eye",
          title: "Notre vision",
          text: "Une Côte d'Ivoire où chaque communauté agit pour un environnement sain, des océans préservés et un avenir durable.",
        },
      ],
      image: `${ILL}/page-landing/community-cleanup-volunteers-beach.jpg`,
      imageAlt: "Bénévoles BLUE lors d'un nettoyage de plage",
      imageOverlay: `${ILL}/page-landing/action_3.jpg`,
      imageOverlayAlt: "Action de terrain BLUE",
      cta: { label: "Notre histoire →", href: "/about" },
    },
    gallery: {
      title: "Notre Galerie",
      subtitle: "Nos actions sur le terrain, en images.",
      images: [
        { url: `${ILL}/page-landing/action_1.jpg`, alt: "Action de collecte BLUE", caption: "" },
        { url: `${ILL}/page-landing/action_2.jpg`, alt: "Nettoyage communautaire", caption: "" },
        { url: `${ILL}/page-landing/action_4.jpg`, alt: "Sensibilisation environnementale", caption: "" },
        { url: `${ILL}/page-landing/testimonials/ocean-cleanup-volunteers-collecting-plastic-waste-.jpg`, alt: "Collecte de déchets plastiques", caption: "" },
        { url: `${ILL}/page-landing/testimonials/volunteers-beach-cleanup-teamwork-ocean-conservat.jpg`, alt: "Bénévoles sur la plage", caption: "" },
      ],
    },
    axes: {
      eyebrow: "Mission & Valeurs",
      title: "Nos axes d'intervention",
      description:
        "Trois objectifs guident toutes nos actions — réparer, préserver et partager — portés par des valeurs fortes.",
      items: [
        {
          icon: "recycle",
          title: "Réparer",
          text: "Collecte et valorisation des déchets plastiques, nettoyage des plages et des lagunes, plantation d'arbres.",
        },
        {
          icon: "shield",
          title: "Préserver",
          text: "Prévention des pollutions, protection des océans et de la biodiversité, promotion de l'économie circulaire.",
        },
        {
          icon: "people-group",
          title: "Partager",
          text: "Sensibilisation environnementale, formations Blue Academy et mobilisation des communautés.",
        },
        {
          icon: "handshake",
          title: "Engagement",
          text: "Chaque bénévole, membre et partenaire s'engage concrètement sur le terrain.",
        },
        {
          icon: "leaf",
          title: "Solidarité",
          text: "L'action collective est au cœur de notre approche : ensemble, nous allons plus loin.",
        },
        {
          icon: "scale",
          title: "Transparence",
          text: "Des actions mesurables, une gestion responsable et une redevabilité envers nos communautés.",
        },
      ],
    },
    quote: {
      quote: "Pour la nature. Pour les peuples. Pour les générations à venir.",
      text: "Chaque geste compte. En rejoignant BLUE, vous faites partie d'une communauté qui transforme la lutte contre la pollution plastique en actions concrètes — sur les plages, dans les écoles et auprès des populations.",
      imageLeft: `${ILL}/page-landing/testimonials/marine-conservation-team.jpg`,
      imageLeftAlt: "Équipe de conservation marine",
      imageRight: `${ILL}/page-landing/testimonials/coastal-cleanup-group.jpg`,
      imageRightAlt: "Groupe de nettoyage côtier",
    },
    projects: {
      eyebrow: "Nos Actions",
      title: "Des projets concrets sur le terrain",
      description:
        "Nettoyages de plages, sensibilisation, reforestation et recyclage : découvrez les programmes menés par BLUE et ses bénévoles.",
      featured: ["recycl-day", "journee-mondiale-oceans", "one-blue-maker-one-tree"],
      cta: { label: "Voir toutes nos actions →", href: "/projects" },
    },
    volunteer: {
      eyebrow: "Reconnaissance",
      title: "Bénévole du mois",
      description:
        "Chaque mois, BLUE met à l'honneur un membre de sa communauté pour son engagement remarquable sur le terrain.",
      badge: "🌟 Bénévole du mois",
      actionsLabel: "Actions réalisées",
      contributionLabel: "Contribution",
      emptyText:
        "Le prochain bénévole du mois sera bientôt annoncé. Rejoignez nos actions pour peut-être être mis à l'honneur !",
      emptyCta: { label: "Devenir bénévole", href: "/benevolat" },
    },
    academy: {
      title: "Blue Academy",
      lead: "Formez-vous et devenez un ambassadeur certifié de l'environnement.",
      perks: [
        "Formations 100% en ligne et gratuites",
        "Vidéos, supports PDF et quiz chronométrés",
        "Certificat délivré dès 80% de réussite",
      ],
      bgImage: `${ILL}/page-landing/blue_training_2.png`,
      cta: { label: "Accéder aux formations →", href: "/academy" },
    },
    community: {
      eyebrow: "Communauté",
      title: "Rejoignez les BLUE Makers de votre zone",
      description:
        "Nos bénévoles s'organisent par zone géographique via des groupes WhatsApp officiels. Choisissez le vôtre et participez aux actions près de chez vous.",
      ctaLabel: "Rejoindre le groupe →",
    },
    partnersCta: {
      eyebrow: "Collaborations",
      title: "Institutions, entreprises, associations : construisons ensemble.",
      text: "BLUE collabore avec des partenaires institutionnels, techniques et privés pour amplifier son impact. Votre organisation souhaite soutenir nos actions ?",
      cta: { label: "Devenir partenaire →", href: "/partenaires" },
    },
    cta: {
      title: "Prêt à agir pour la planète ?",
      text: "Rejoignez la communauté BLUE : participez à nos nettoyages, formez-vous avec Blue Academy ou échangez avec MR BLUE, notre assistant.",
      buttons: [
        { label: "Devenir bénévole", href: "/benevolat", variant: "primary" },
        { label: "Nous contacter", href: "/contact", variant: "secondary" },
      ],
    },
  },

  // ─── À propos ─────────────────────────────────────────────────────────────
  about: {
    hero: {
      image: `${ILL}/page-landing/community-cleanup-volunteers-beach.jpg`,
      eyebrow: "À propos de BLUE",
      title: "Une ONG ivoirienne engagée pour la planète",
      description:
        "Fondée en janvier 2022 à Abidjan, BLUE lutte contre la pollution plastique et forme des ambassadeurs de l'environnement à travers la Côte d'Ivoire.",
      buttons: [
        { label: "Rejoindre le mouvement", href: "/benevolat", variant: "primary" },
        { label: "Voir nos actions", href: "/projects", variant: "secondary" },
      ],
    },
    story: {
      eyebrow: "Notre histoire",
      title: "Née à Abidjan, tournée vers l'océan",
      paragraphs: [
        "BLUE — Blue Makers — est une organisation non gouvernementale créée en janvier 2022 à Abidjan. Face à l'envahissement des plages, des lagunes et des quartiers par les déchets plastiques, un groupe de citoyens engagés a décidé d'agir.",
        "Notre mission : créer des citoyens engagés pour la protection de l'environnement, la réduction de l'empreinte écologique des populations et la lutte contre la pollution plastique. Nous agissons sur le terrain — collectes, nettoyages, plantations d'arbres — et par l'éducation, avec notre plateforme Blue Academy.",
      ],
      image: `${ILL}/page-landing/action_1.jpg`,
      imageAlt: "Action de terrain de BLUE",
      imageOverlay: `${ILL}/page-accueil/ite-3.jpg`,
      imageOverlayAlt: "Bénévoles BLUE",
    },
    missionVision: {
      cards: [
        {
          icon: "bullseye",
          title: "Notre Mission",
          text: "Créer des citoyens engagés pour la protection de l'environnement, la réduction de l'empreinte environnementale des populations et la lutte contre la pollution plastique.",
        },
        {
          icon: "eye",
          title: "Notre Vision",
          text: "Bâtir une Côte d'Ivoire où chaque citoyen devient acteur de la protection de l'environnement, pour des océans propres et des générations futures épanouies.",
        },
      ],
    },
    axes: {
      eyebrow: "Méthode d'action",
      title: "Réparer, Préserver, Partager",
      description:
        "Trois objectifs structurent l'ensemble des programmes et actions menés par BLUE sur le terrain.",
      items: [
        {
          icon: "recycle",
          title: "Réparer",
          text: "Collecte de déchets plastiques, nettoyage des plages et des lagunes, plantation d'arbres pour restaurer les écosystèmes.",
        },
        {
          icon: "shield",
          title: "Préserver",
          text: "Prévention des pollutions, protection des océans et promotion des pratiques durables au quotidien.",
        },
        {
          icon: "people-group",
          title: "Partager",
          text: "Sensibilisation environnementale, formation des communautés et transmission des savoirs via Blue Academy.",
        },
      ],
      values: [
        { icon: "handshake", name: "Engagement" },
        { icon: "heart", name: "Solidarité" },
        { icon: "shield", name: "Protection" },
        { icon: "scale", name: "Transparence" },
        { icon: "rotate", name: "Restauration" },
      ],
    },
    timeline: {
      eyebrow: "Chronologie",
      title: "Les grandes étapes de BLUE",
      items: [
        {
          year: "Jan 2022",
          title: "Création de BLUE",
          text: "Fondation de l'ONG à Abidjan, Côte d'Ivoire, avec la mission de créer des citoyens engagés pour la protection de l'environnement.",
        },
        {
          year: "2022",
          title: "Premières actions de terrain",
          text: "Organisation des premières collectes de déchets plastiques et nettoyages de plages avec les premiers bénévoles BLUE Makers.",
        },
        {
          year: "2023",
          title: "Lancement des programmes phares",
          text: "RECYCL'DAY, One BLUE Maker One Tree, ateliers de recyclage créatif et lancement de la plateforme de formation Blue Academy.",
        },
        {
          year: "2024",
          title: "Mobilisation à grande échelle",
          text: "Multiplication des éditions de RECYCL'DAY, célébration de la Journée Mondiale des Océans et campagnes de sensibilisation scolaire.",
        },
        {
          year: "Aujourd'hui",
          title: "Une communauté qui grandit",
          text: "BLUE poursuit sa mission avec un réseau de bénévoles organisés par zones à Abidjan et dans l'intérieur du pays, et le développement de Blue Academy.",
        },
      ],
    },
    team: {
      eyebrow: "Gouvernance",
      title: "Notre équipe dirigeante",
      description: "Un bureau engagé qui coordonne les actions de BLUE sur l'ensemble du territoire.",
      members: [
        { name: "Jesus Aka", role: "Président" },
        { name: "N'Dri", role: "Vice-Présidente" },
        { name: "Jean M. Yeboue", role: "Secrétaire Général" },
        { name: "Anah Toure", role: "Trésorière" },
      ],
    },
    cta: {
      title: "Envie de contribuer à la mission ?",
      text: "Bénévole, partenaire ou apprenant : il existe une place pour vous chez BLUE.",
      buttons: [
        { label: "Devenir bénévole", href: "/benevolat", variant: "primary" },
        { label: "Devenir partenaire", href: "/partenaires", variant: "secondary" },
      ],
    },
  },

  // ─── Bénévolat ────────────────────────────────────────────────────────────
  benevolat: {
    hero: {
      image: `${ILL}/page-landing/testimonials/volunteers-beach-cleanup-teamwork-ocean-conservat.jpg`,
      eyebrow: "Bénévolat",
      title: "Devenez un BLUE Maker",
      description:
        "Rejoignez une communauté de citoyens engagés qui agissent concrètement pour l'environnement, des plages d'Abidjan à l'intérieur du pays.",
      buttons: [
        { label: "Choisir ma zone", href: "#zones", variant: "primary" },
        { label: "Me former d'abord", href: "/academy", variant: "secondary" },
      ],
    },
    fields: {
      eyebrow: "S'engager",
      title: "Ce que font nos bénévoles",
      description:
        "Le bénévolat chez BLUE, c'est de l'action réelle sur le terrain, aux côtés d'une équipe passionnée.",
      items: [
        { icon: "broom", title: "Nettoyages & collectes", text: "Plages, lagunes et espaces publics : collecte et tri des déchets plastiques." },
        { icon: "seedling", title: "Plantations d'arbres", text: "Sessions de reforestation avec suivi des arbres plantés." },
        { icon: "chalkboard", title: "Sensibilisation", text: "Interventions dans les écoles et les communautés, ateliers éducatifs." },
        { icon: "people-group", title: "Événements communautaires", text: "RECYCL'DAY, Journée Mondiale des Océans et autres mobilisations." },
      ],
    },
    steps: {
      eyebrow: "Comment ça marche",
      title: "Rejoindre BLUE en 4 étapes",
      description: "Un parcours simple et transparent pour devenir bénévole actif.",
      items: [
        {
          num: "01",
          title: "Rejoignez votre groupe WhatsApp",
          text: "Choisissez le groupe officiel correspondant à votre zone de résidence pour être informé des prochaines activités.",
        },
        {
          num: "02",
          title: "Participez aux activités",
          text: "Nettoyages de plages et de lagunes, plantations d'arbres, sensibilisations : les actions sont annoncées dans les groupes.",
        },
        {
          num: "03",
          title: "Procurez-vous le T-shirt officiel",
          text: "Le T-shirt BLUE est proposé à 5 000 FCFA. Il vous identifie lors des actions et soutient l'organisation.",
        },
        {
          num: "04",
          title: "Devenez bénévole actif",
          text: "Participez à au moins deux activités officielles pour être reconnu comme bénévole actif de la communauté BLUE.",
        },
      ],
      transparency:
        "En toute transparence : le T-shirt officiel BLUE est proposé à 5 000 FCFA et l'objectif pour être considéré comme bénévole actif est de participer à au moins deux activités. Aucune autre obligation n'est requise.",
    },
    zones: {
      eyebrow: "Étape 1",
      title: "Choisissez votre groupe WhatsApp",
      description:
        "Les groupes officiels organisent les actions par zone. Rejoignez celui qui correspond à votre lieu de résidence.",
      ctaLabel: "Rejoindre le groupe officiel →",
    },
    mrblue: {
      title: "Une question avant de vous lancer ?",
      text: "MR BLUE, notre assistant officiel, vous accompagne : il vous oriente vers le bon groupe selon votre localité et répond à toutes vos questions. Cliquez sur la bulle de discussion en bas à droite de l'écran pour démarrer.",
      cta: { label: "Autres moyens de contact", href: "/contact" },
    },
  },

  // ─── Contact ──────────────────────────────────────────────────────────────
  contact: {
    hero: {
      image: `${ILL}/page-landing/ocean-conservation-initiative-blue.jpg`,
      eyebrow: "Contact",
      title: "Parlons de l'environnement, ensemble",
      description:
        "Une question, un partenariat, une proposition d'action ? L'équipe BLUE est à votre écoute.",
      buttons: [
        { label: "Écrire un email", href: "mailto:blue@bluemakers.net?subject=Contact%20depuis%20le%20site%20BLUE&body=Bonjour%20BLUE%2C", variant: "primary" },
        { label: "Appeler BLUE", href: "tel:+2250778060961", variant: "secondary" },
      ],
    },
    channels: {
      eyebrow: "Coordonnées",
      title: "Nos canaux officiels",
      socialsIntro: "Suivez nos actions sur les réseaux",
    },
    zones: {
      eyebrow: "Communautés",
      title: "Nos groupes WhatsApp par zone",
      description:
        "Pour rejoindre la communauté et être informé des activités près de chez vous, choisissez votre zone.",
      ctaLabel: "Rejoindre →",
    },
    mrblue: {
      title: "Réponse immédiate avec MR BLUE",
      text: "Notre assistant conversationnel répond instantanément à vos questions sur BLUE, le bénévolat et nos formations. Retrouvez-le en bas à droite de votre écran.",
    },
  },

  // ─── Partenaires ──────────────────────────────────────────────────────────
  partenaires: {
    hero: {
      image: `${ILL}/page-landing/action_2.jpg`,
      eyebrow: "Partenaires",
      title: "Ensemble, amplifions l'impact",
      description:
        "Les actions de BLUE prennent leur ampleur grâce à la collaboration avec des acteurs institutionnels, privés, éducatifs et associatifs.",
      buttons: [
        { label: "Proposer un partenariat", href: "mailto:blue@bluemakers.net?subject=Proposition%20de%20partenariat%20BLUE&body=Bonjour%20BLUE%2C", variant: "primary" },
        { label: "Nous contacter", href: "/contact", variant: "secondary" },
      ],
    },
    types: {
      eyebrow: "Collaborer avec BLUE",
      title: "Des formes de partenariat adaptées",
      description:
        "Chaque partenaire contribue selon ses moyens : financement, logistique, expertise, relais de communication ou mobilisation de bénévoles.",
      items: [
        {
          icon: "building-columns",
          title: "Partenariat institutionnel",
          text: "Collectivités, ministères et organismes publics : alignons nos actions avec les politiques environnementales nationales.",
        },
        {
          icon: "building",
          title: "Partenariat privé",
          text: "Entreprises engagées (RSE) : financement d'actions, mécénat de compétences ou mobilisation de vos collaborateurs.",
        },
        {
          icon: "graduation",
          title: "Partenariat éducatif",
          text: "Écoles, universités et centres de formation : accueillez nos programmes de sensibilisation et Blue Academy.",
        },
        {
          icon: "hands-helping",
          title: "Partenariat associatif",
          text: "ONG et organisations de la société civile : mutualisons nos forces pour des actions de plus grande ampleur.",
        },
      ],
    },
    partners: {
      eyebrow: "Ils nous accompagnent",
      title: "Nos partenaires",
      description: "La liste officielle de nos partenaires est en cours de publication sur cette page.",
      list: [],
      emptyIcon: "🤝",
      emptyTitle: "Votre organisation peut apparaître ici",
      emptyText:
        "Cette section accueillera les logos et présentations des partenaires officiels de BLUE. Si votre organisation souhaite soutenir nos actions de lutte contre la pollution plastique, contactez-nous.",
    },
    cta: {
      title: "Une idée de collaboration ?",
      text: "Écrivez-nous ou appelez-nous : l'équipe BLUE étudie chaque proposition avec attention.",
      button: { label: "Voir toutes les coordonnées →", href: "/contact" },
    },
  },

  // ─── Projets ──────────────────────────────────────────────────────────────
  projectsPage: {
    hero: {
      image: `${ILL}/page-landing/sustainable-future-ocean-protection.jpg`,
      eyebrow: "Nos actions",
      title: "Des projets concrets contre la pollution plastique",
      description:
        "Nettoyages de plages et de lagunes, sensibilisation, reforestation, recyclage et formations : découvrez ce que BLUE réalise avec sa communauté.",
      buttons: [
        { label: "Participer à une action", href: "/benevolat", variant: "primary" },
        { label: "Voir les archives", href: "/projects/archive", variant: "secondary" },
      ],
    },
    featured: {
      eyebrow: "Projet phare",
      slug: "recycl-day",
      image: `${ILL}/page-landing/action_1.jpg`,
      imageOverlay: `${ILL}/page-landing/community-cleanup-volunteers-beach.jpg`,
      imageOverlayAlt: "Bénévoles RECYCL'DAY",
      tagline: "Nettoyer, sensibiliser, mobiliser",
      ctaLabel: "Découvrir le projet →",
    },
    catalog: {
      eyebrow: "Catalogue",
      title: "Tous nos programmes",
      description: "Filtrez par type d'action pour explorer les projets menés par BLUE.",
      archiveCta: "Consulter les archives →",
    },
    archive: {
      hero: {
        image: `${ILL}/page-landing/marine-research-ocean-pollution-study.jpg`,
        eyebrow: "Archives",
        title: "L'historique de nos actions",
        description: "Retrouvez l'ensemble des projets et programmes menés par BLUE depuis sa création en 2022.",
      },
      backCta: "← Retour aux projets",
    },
  },
};

/** Catégories de projets (codes conservés de json/data.json). */
export const PROJECT_CATEGORIES = [
  { value: 1, label: "Projets Environnementaux", short: "Projet Environnemental" },
  { value: 2, label: "Formations & Éducation", short: "Formation & Éducation" },
  { value: 9, label: "Autres Initiatives", short: "Autre Initiative" },
];

/** Réglages site par défaut (identité, coordonnées, réseaux, polices, couleurs). */
export const DEFAULT_SITE_IDENTITY = {
  name: "BLUE",
  slogan: "Ensemble contre la pollution plastique",
  logo: "/ong_blue/images/logo.png",
  favicon: "/favicon.ico",
};

export const DEFAULT_SITE_CONTACT = {
  phones: ["+225 07 78 06 09 61", "+225 07 09 61 13 41"],
  email: "blue@bluemakers.net",
  address: "Abidjan, Côte d'Ivoire",
};

export const DEFAULT_SITE_SOCIALS = {
  facebook: "https://www.facebook.com/bluemakers",
  instagram: "https://www.instagram.com/bluemakers",
  linkedin: "https://www.linkedin.com/company/bluemakers",
  whatsapp: "https://chat.whatsapp.com/CTyNHv6t1VJ22htKymlt4w",
  tiktok: "",
  youtube: "",
};
