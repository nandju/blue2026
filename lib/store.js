// Client-side API facade for the BLUE platform.
// Same function names as the old localStorage-backed store, but every call
// now hits a real Next.js API route backed by Supabase — so admin, learners
// and MR BLUE all share the same data instead of each browser having its own.

async function request(url, options) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err = new Error(body.error || `Erreur ${res.status}`);
    err.status = res.status;
    err.data = body;
    throw err;
  }
  if (res.status === 204) return null;
  return res.json();
}

const qs = (params = {}) => {
  const s = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")).toString();
  return s ? `?${s}` : "";
};

// ─── Courses ───────────────────────────────────────────────────────────────

export const getCourses = () => request("/api/courses");
export const getCourse = (id) => request(`/api/courses/${id}`).catch(() => null);
export const addCourse = (course) => request("/api/courses", { method: "POST", body: JSON.stringify(course) });
export const updateCourse = (id, updates) =>
  request(`/api/courses/${id}`, { method: "PATCH", body: JSON.stringify(updates) });
export const deleteCourse = (id) => request(`/api/courses/${id}`, { method: "DELETE" });

// ─── Registrations ─────────────────────────────────────────────────────────

export const getRegistrations = () => request("/api/registrations");
export const addRegistration = (reg) => request("/api/registrations", { method: "POST", body: JSON.stringify(reg) });

// ─── Progress (kept local — per-device reading progress, not admin data) ───

const PROGRESS_KEY = "blue_progress";
const isBrowser = typeof window !== "undefined";

export const getCourseProgress = (courseId) => {
  if (!isBrowser) return 0;
  try {
    const p = JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}");
    return p[courseId] || 0;
  } catch {
    return 0;
  }
};
export const setProgress = (courseId, sectionIndex) => {
  if (!isBrowser) return;
  try {
    const p = JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}");
    p[courseId] = Math.max(p[courseId] || 0, sectionIndex);
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
  } catch {}
};

// ─── Quiz Results ────────────────────────────────────────────────────────

export const addQuizResult = (result) => request("/api/quiz-results", { method: "POST", body: JSON.stringify(result) });
export const getCourseQuizResult = (courseId, email) =>
  request(`/api/quiz-results?courseId=${encodeURIComponent(courseId)}&email=${encodeURIComponent(email)}`);

// ─── Certificate Requests ────────────────────────────────────────────────

export const getCertificateRequests = () => request("/api/certificate-requests");
export const addCertificateRequest = (req) =>
  request("/api/certificate-requests", { method: "POST", body: JSON.stringify(req) });
export const updateCertificateRequest = (id, updates) =>
  request(`/api/certificate-requests/${id}`, { method: "PATCH", body: JSON.stringify(updates) });

// ─── Volunteer of the Month ─────────────────────────────────────────────

export const getVolunteer = () => request("/api/volunteer");
// Admin — bénévoles du mois
export const listVolunteers = () => request("/api/admin/volunteers");
export const createVolunteer = (v) => request("/api/admin/volunteers", { method: "POST", body: JSON.stringify(v) });
export const updateVolunteer = (id, patch) => request(`/api/admin/volunteers/${id}`, { method: "PATCH", body: JSON.stringify(patch) });
export const deleteVolunteer = (id) => request(`/api/admin/volunteers/${id}`, { method: "DELETE" });
export const duplicateVolunteer = (id) => request(`/api/admin/volunteers/${id}/duplicate`, { method: "POST" });
export const republishVolunteerNotify = (id) => request(`/api/admin/volunteers/${id}/republish`, { method: "POST" });

// ─── Admin Auth ──────────────────────────────────────────────────────────

/** Connexion nominative : { name, department, departmentOther, email, password }. Lève une erreur en cas d'échec. */
export const adminLogin = (credentials) =>
  request("/api/auth/login", { method: "POST", body: JSON.stringify(credentials) });
export const adminLogout = () => request("/api/auth/logout", { method: "POST" });
export const getAdminSession = () => request("/api/auth/me");
export const isAdminAuthenticated = () =>
  request("/api/auth/me")
    .then(() => true)
    .catch(() => false);
export const getLoginDepartments = () => request("/api/auth/departments");

// ─── Admin : réglages ────────────────────────────────────────────────────

export const getDepartmentsSetting = () => request("/api/admin/settings/departments");
export const saveDepartmentsSetting = (departments) =>
  request("/api/admin/settings/departments", { method: "PUT", body: JSON.stringify({ departments }) });
export const getAdminSettings = () => request("/api/admin/settings");
export const saveSiteSetting = (key, value) =>
  request("/api/admin/settings", { method: "PUT", body: JSON.stringify({ key, value }) });

// ─── Admin : contenu du site ─────────────────────────────────────────────

export const getAdminContent = () => request("/api/admin/content");
/** value=null → rétablit la section par défaut. */
export const saveContentSection = (page, section, value) =>
  request("/api/admin/content", { method: "PUT", body: JSON.stringify({ page, section, value }) });

// ─── Admin : projets / actions ───────────────────────────────────────────

export const getAdminProjects = () => request("/api/admin/projects");
export const createProject = (data) =>
  request("/api/admin/projects", { method: "POST", body: JSON.stringify(data) });
export const updateProject = (id, patch) =>
  request(`/api/admin/projects/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(patch) });
export const deleteProject = (id) =>
  request(`/api/admin/projects/${encodeURIComponent(id)}`, { method: "DELETE" });
export const saveProjectsOrder = (order) =>
  request("/api/admin/projects", { method: "PUT", body: JSON.stringify({ order }) });

// ─── Projets (public) ────────────────────────────────────────────────────

export const getProjects = () => request("/api/projects");
export const getProjectBySlug = (slug) => request(`/api/projects/${encodeURIComponent(slug)}`);

// ─── Admin : médiathèque ─────────────────────────────────────────────────

export const getMediaList = (filters) => request(`/api/admin/media${qs(filters)}`);
export const deleteMedia = (id, force = false) =>
  request(`/api/admin/media/${id}${force ? "?force=1" : ""}`, { method: "DELETE" });
export const getMediaUsages = (id) => request(`/api/admin/media/${id}/usages`);

// ─── Admin : journal ─────────────────────────────────────────────────────

export const getLoginLogs = (filters) => request(`/api/admin/logs/logins${qs(filters)}`);
export const getActivityLogs = (filters) => request(`/api/admin/logs/activities${qs(filters)}`);
export const getLogFacets = () => request("/api/admin/logs/facets");
export const logExportUrl = (type, filters) => `/api/admin/logs/export${qs({ type, ...filters })}`;

// ─── Chat Users (MR BLUE Chatbot) ────────────────────────────────────────

export const getChatUsers = () => request("/api/chat-users");
export const getChatUserBySession = (sessionId) => request(`/api/chat-users?sessionId=${encodeURIComponent(sessionId)}`);
export const addChatUser = async (userData) => {
  const user = await request("/api/chat-users", { method: "POST", body: JSON.stringify(userData) });
  return user.id;
};
export const getChatMessages = (userId) => request(`/api/chat-users/${userId}/messages`);
export const addChatMessage = (userId, userMessage, aiResponse) =>
  request(`/api/chat-users/${userId}/messages`, { method: "POST", body: JSON.stringify({ userMessage, aiResponse }) });
export const getChatStats = () => request("/api/chat-stats");

// ─── Stats ───────────────────────────────────────────────────────────────

export const getStats = () => request("/api/stats");
