// Client-side data store for BLUE platform using localStorage

const KEYS = {
  COURSES: 'blue_courses',
  REGISTRATIONS: 'blue_registrations',
  QUIZ_RESULTS: 'blue_quiz_results',
  CERTIFICATE_REQUESTS: 'blue_certificate_requests',
  CONVERSATIONS: 'blue_conversations',
  VOLUNTEER: 'blue_volunteer_of_month',
  ADMIN_AUTH: 'blue_admin_auth',
  PROGRESS: 'blue_progress',
};

const isBrowser = typeof window !== 'undefined';

const get = (key) => {
  if (!isBrowser) return null;
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : null;
  } catch { return null; }
};

const set = (key, value) => {
  if (!isBrowser) return;
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
};

// ─── Default course data ───────────────────────────────────────────────────

const DEFAULT_COURSES = [
  {
    id: 'intro-pollution-plastique',
    title: 'Introduction à la Pollution Plastique',
    description: "Comprendre les enjeux de la pollution plastique en Côte d'Ivoire et dans le monde.",
    category: 'environnement',
    level: 'Débutant',
    duration: '2h',
    enrolled: 0,
    video: 'https://www.youtube.com/embed/Ug_Uix88_xE',
    sections: [
      {
        title: '1. La crise du plastique mondiale',
        content: "Chaque année, plus de 300 millions de tonnes de plastique sont produites dans le monde. Une grande partie de ce plastique finit dans nos océans, nos rivières et nos sols, menaçant les écosystèmes et la santé humaine.\n\nEn Côte d'Ivoire, la pollution plastique représente un défi majeur pour l'environnement urbain et côtier d'Abidjan jusqu'aux zones rurales.",
      },
      {
        title: '2. Impact sur les écosystèmes',
        content: "Le plastique met des centaines d'années à se décomposer. En se fragmentant, il forme des microplastiques qui s'infiltrent dans la chaîne alimentaire.\n\nLes animaux marins ingèrent ces particules, et elles se retrouvent finalement dans nos assiettes. La dégradation des récifs coralliens et des mangroves côtières est directement liée à la pollution plastique.",
      },
      {
        title: '3. Solutions et alternatives',
        content: "La lutte contre la pollution plastique passe par plusieurs axes : la réduction à la source, le recyclage et la valorisation des déchets, l'éducation et la sensibilisation des communautés.\n\nBLUE agit sur tous ces fronts en Côte d'Ivoire depuis 2022, formant des ambassadeurs et mobilisant les communautés pour un avenir durable.",
      },
      {
        title: '4. Le rôle de chaque citoyen',
        content: "Chaque geste compte dans la lutte contre la pollution plastique. Réduire l'usage du plastique à usage unique, trier ses déchets, participer aux collectes de nettoyage, et sensibiliser son entourage sont des actions concrètes à notre portée.\n\nBLUE vous accompagne pour devenir un ambassadeur de l'environnement dans votre communauté.",
      },
    ],
    resources: [{ name: 'Guide de réduction plastique BLUE', url: '/docs/blue-guide.pdf' }],
    quiz: [
      { question: "Combien de tonnes de plastique sont produites chaque année dans le monde ?", options: ['100 millions', '200 millions', '300 millions', '500 millions'], answer: 2 },
      { question: "Quelle est l'une des principales conséquences des microplastiques ?", options: ["Augmentation de la température", "Infiltration dans la chaîne alimentaire", "Réduction de la pluie", "Amélioration du sol"], answer: 1 },
      { question: "En quelle année BLUE a-t-elle été fondée ?", options: ['2018', '2020', '2022', '2024'], answer: 2 },
      { question: "Quelle ville abrite le siège de BLUE ?", options: ['Bouaké', 'Yamoussoukro', 'Abidjan', 'San-Pédro'], answer: 2 },
      { question: "Quel est l'un des axes d'action de BLUE pour lutter contre le plastique ?", options: ['Produire plus de plastique', 'Sensibilisation des communautés', 'Importer du plastique', 'Exporter des déchets'], answer: 1 },
    ],
  },
  {
    id: 'formation-ambassadeur',
    title: 'Formation Ambassadeur Environnemental',
    description: "Devenez un ambassadeur BLUE et mobilisez votre communauté pour la protection de l'environnement.",
    category: 'formation',
    level: 'Intermédiaire',
    duration: '3h',
    enrolled: 0,
    video: 'https://www.youtube.com/embed/Ug_Uix88_xE',
    sections: [
      {
        title: "1. Le rôle de l'Ambassadeur BLUE",
        content: "Un ambassadeur BLUE est un leader communautaire formé pour sensibiliser, mobiliser et agir en faveur de l'environnement. Il représente BLUE dans sa communauté et organise des actions de sensibilisation.\n\nLa formation d'ambassadeur est le cœur du programme de BLUE depuis sa fondation en 2022.",
      },
      {
        title: '2. Techniques de sensibilisation communautaire',
        content: "La sensibilisation efficace repose sur des méthodes éprouvées : la communication de proximité, les animations en groupe, l'utilisation des réseaux sociaux, et les partenariats avec les acteurs locaux.\n\nVous apprendrez à adapter votre message selon votre public cible : enfants, adultes ou décideurs.",
      },
      {
        title: "3. Organisation d'événements environnementaux",
        content: "Organiser une collecte de nettoyage, un atelier de recyclage ou une campagne de sensibilisation demande méthode et rigueur.\n\nCette section vous guide étape par étape dans la planification, la mobilisation, la réalisation et le bilan de vos actions environnementales.",
      },
      {
        title: '4. Reportage et documentation',
        content: "Documenter vos actions est essentiel pour mesurer l'impact, rendre compte à BLUE, et partager vos succès avec la communauté.\n\nVous découvrirez comment photographier, filmer et rédiger des rapports d'activité de qualité.",
      },
      {
        title: '5. Rejoindre le réseau BLUE',
        content: "En tant qu'ambassadeur certifié BLUE, vous intégrez un réseau de militants environnementaux engagés à travers toute la Côte d'Ivoire.\n\nVous bénéficierez de formations continues, d'un accès à des ressources exclusives, et d'un accompagnement personnalisé de l'équipe BLUE.",
      },
    ],
    resources: [
      { name: "Manuel de l'Ambassadeur BLUE", url: '/docs/blue-guide.pdf' },
      { name: 'Kit de sensibilisation communautaire', url: '/docs/blue-guide.pdf' },
    ],
    quiz: [
      { question: "Quel est le rôle principal d'un Ambassadeur BLUE ?", options: ['Collecter des fonds', 'Sensibiliser et mobiliser sa communauté', 'Gérer les finances de BLUE', 'Construire des bâtiments'], answer: 1 },
      { question: "Quelle compétence est essentielle pour un ambassadeur efficace ?", options: ['La programmation informatique', 'La communication de proximité', 'La comptabilité', 'La médecine'], answer: 1 },
      { question: "Pourquoi est-il important de documenter ses actions ?", options: ['Pour avoir plus de vacances', "Pour mesurer l'impact et rendre compte", "Pour recevoir plus d'argent", 'Pour quitter BLUE'], answer: 1 },
      { question: "Quel type d'événement un ambassadeur peut-il organiser ?", options: ['Concert de musique', 'Collecte de nettoyage', 'Match de football', 'Concours de cuisine'], answer: 1 },
      { question: "Qu'est-ce que le réseau BLUE offre aux ambassadeurs certifiés ?", options: ['Un salaire mensuel', "Des formations continues et de l'accompagnement", 'Un logement gratuit', 'Un véhicule de service'], answer: 1 },
    ],
  },
  {
    id: 'recyclage-economie-circulaire',
    title: 'Recyclage et Économie Circulaire',
    description: "Maîtrisez les principes du recyclage et de l'économie circulaire pour agir concrètement.",
    category: 'environnement',
    level: 'Avancé',
    duration: '4h',
    enrolled: 0,
    video: 'https://www.youtube.com/embed/Ug_Uix88_xE',
    sections: [
      {
        title: "1. Principes de l'économie circulaire",
        content: "L'économie circulaire vise à maintenir les ressources en circulation le plus longtemps possible, à extraire la valeur maximale pendant leur utilisation, puis à récupérer et régénérer les produits et matériaux en fin de vie.\n\nElle s'oppose à l'économie linéaire « produire, utiliser, jeter » qui épuise les ressources naturelles.",
      },
      {
        title: '2. Le tri des déchets en pratique',
        content: "Un tri efficace est la première étape du recyclage. Vous apprendrez à identifier les différents types de plastiques (PET, HDPE, PVC, LDPE, PP, PS), à comprendre les symboles de recyclage.\n\nVous saurez mettre en place un système de tri adapté à votre environnement, qu'il soit domestique ou professionnel.",
      },
      {
        title: '3. Valorisation des déchets plastiques',
        content: "Les déchets plastiques peuvent être transformés en nouvelles ressources : granulés pour la fabrication de nouveaux produits, matériaux de construction, mobilier urbain.\n\nDécouvrez les technologies de valorisation disponibles en Afrique et les initiatives locales innovantes qui transforment les déchets en opportunités économiques.",
      },
      {
        title: '4. Modèles économiques durables',
        content: "L'économie circulaire ouvre de nouvelles opportunités entrepreneuriales. Des modèles comme l'éco-conception, la location plutôt que la vente, la réparation et la remise à neuf créent de la valeur tout en réduisant les déchets.\n\nDécouvrez des cas concrets d'entreprises africaines qui ont réussi cette transition vers la durabilité.",
      },
    ],
    resources: [{ name: "Guide du recyclage en Côte d'Ivoire", url: '/docs/blue-guide.pdf' }],
    quiz: [
      { question: "Quel est le principe fondamental de l'économie circulaire ?", options: ['Produire plus', 'Maintenir les ressources en circulation', 'Importer plus', 'Exporter plus'], answer: 1 },
      { question: "Quel est le symbole qui identifie un plastique recyclable ?", options: ['Un carré', 'Un triangle avec un numéro', 'Un cercle', 'Une étoile'], answer: 1 },
      { question: "Comment les déchets plastiques peuvent-ils être valorisés ?", options: ["En les brûlant", "En les enfouissant", "En les transformant en granulés ou matériaux", "En les jetant à la mer"], answer: 2 },
      { question: "Qu'est-ce que l'éco-conception ?", options: ["Concevoir des produits sans tenir compte de l'environnement", "Concevoir des produits en intégrant les critères environnementaux dès la création", "Importer des produits écologiques", "Exporter des déchets"], answer: 1 },
      { question: "Quelle est l'alternative à l'économie linéaire ?", options: ["L'économie circulaire", "L'économie informelle", "L'économie de marché", "L'économie planifiée"], answer: 0 },
    ],
  },
];

// ─── Courses ───────────────────────────────────────────────────────────────

export const getCourses = () => {
  const stored = get(KEYS.COURSES);
  if (!stored) { set(KEYS.COURSES, DEFAULT_COURSES); return DEFAULT_COURSES; }
  return stored;
};
export const setCourses = (courses) => set(KEYS.COURSES, courses);
export const getCourse = (id) => getCourses().find((c) => c.id === id) || null;
export const addCourse = (course) => { const c = getCourses(); c.push(course); setCourses(c); };
export const updateCourse = (id, updates) => setCourses(getCourses().map((c) => c.id === id ? { ...c, ...updates } : c));
export const deleteCourse = (id) => setCourses(getCourses().filter((c) => c.id !== id));

// ─── Registrations ─────────────────────────────────────────────────────────

export const getRegistrations = () => get(KEYS.REGISTRATIONS) || [];
export const addRegistration = (reg) => {
  const regs = getRegistrations();
  regs.push({ ...reg, id: Date.now(), date: new Date().toISOString() });
  set(KEYS.REGISTRATIONS, regs);
  // increment enrolled count
  const course = getCourse(reg.courseId);
  if (course) updateCourse(reg.courseId, { enrolled: (course.enrolled || 0) + 1 });
};
export const isRegistered = (courseId, email) =>
  getRegistrations().some((r) => r.courseId === courseId && r.email === email);
export const getRegistration = (courseId, email) =>
  getRegistrations().find((r) => r.courseId === courseId && r.email === email) || null;
export const getRegistrationByCourseAndEmail = getRegistration;

// ─── Progress ──────────────────────────────────────────────────────────────

export const getProgress = () => get(KEYS.PROGRESS) || {};
export const setProgress = (courseId, sectionIndex) => {
  const p = getProgress();
  p[courseId] = Math.max(p[courseId] || 0, sectionIndex);
  set(KEYS.PROGRESS, p);
};
export const getCourseProgress = (courseId) => (getProgress())[courseId] || 0;

// ─── Quiz Results ──────────────────────────────────────────────────────────

export const getQuizResults = () => get(KEYS.QUIZ_RESULTS) || [];
export const addQuizResult = (result) => {
  const results = getQuizResults();
  results.push({ ...result, date: new Date().toISOString() });
  set(KEYS.QUIZ_RESULTS, results);
};
export const getCourseQuizResult = (courseId, email) =>
  getQuizResults().find((r) => r.courseId === courseId && r.email === email) || null;

// ─── Certificate Requests ──────────────────────────────────────────────────

export const getCertificateRequests = () => get(KEYS.CERTIFICATE_REQUESTS) || [];
export const addCertificateRequest = (req) => {
  const reqs = getCertificateRequests();
  reqs.push({ ...req, id: Date.now(), status: 'pending', date: new Date().toISOString() });
  set(KEYS.CERTIFICATE_REQUESTS, reqs);
};
export const updateCertificateRequest = (id, updates) =>
  set(KEYS.CERTIFICATE_REQUESTS, getCertificateRequests().map((r) => r.id === id ? { ...r, ...updates } : r));

// ─── Conversations (MR BLUE) ───────────────────────────────────────────────

export const getConversations = () => get(KEYS.CONVERSATIONS) || [];
export const saveConversation = (conv) => {
  const convs = getConversations();
  const idx = convs.findIndex((c) => c.sessionId === conv.sessionId);
  if (idx >= 0) { convs[idx] = { ...convs[idx], ...conv, updatedAt: new Date().toISOString() }; }
  else { convs.push({ ...conv, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }); }
  set(KEYS.CONVERSATIONS, convs);
};

// ─── Volunteer of the Month ────────────────────────────────────────────────

export const DEFAULT_VOLUNTEER = {
  firstName: 'Amenan',
  lastName: 'Kouassi',
  location: "Abidjan, Côte d'Ivoire",
  photo: null,
  actions: "Organisation de 12 collectes de nettoyage, sensibilisation de 500 personnes dans les quartiers d'Abobo et d'Adjamé.",
  contribution: "Collecte de 2 tonnes de plastique, formation de 30 jeunes ambassadeurs environnementaux.",
  period: new Date().toISOString(),
  active: true,
};
export const getVolunteer = () => get(KEYS.VOLUNTEER) || DEFAULT_VOLUNTEER;
export const setVolunteer = (v) => set(KEYS.VOLUNTEER, v);

// ─── Admin Auth ────────────────────────────────────────────────────────────

const ADMIN_EMAIL = 'admin@blueacademy.ci';
const ADMIN_PASSWORD = 'BlueAdmin2025';

export const adminLogin = (email, password) => {
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const token = btoa(`${email}:${Date.now()}`);
    set(KEYS.ADMIN_AUTH, { token, email, loginTime: new Date().toISOString() });
    return true;
  }
  return false;
};
export const adminLogout = () => set(KEYS.ADMIN_AUTH, null);
export const isAdminAuthenticated = () => { const a = get(KEYS.ADMIN_AUTH); return !!(a && a.token); };
export const getAdminAuth = () => get(KEYS.ADMIN_AUTH);

// ─── Stats ─────────────────────────────────────────────────────────────────

export const getStats = () => ({
  courses: getCourses().length,
  registrations: getRegistrations().length,
  certificates: getCertificateRequests().filter((r) => r.status === 'approved').length,
  conversations: getConversations().length,
  volunteers: 1,
});
