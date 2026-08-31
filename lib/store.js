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
    throw new Error(body.error || `Erreur ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

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
export const setVolunteer = (v) => request("/api/volunteer", { method: "PUT", body: JSON.stringify(v) });

// ─── Admin Auth ──────────────────────────────────────────────────────────

export const adminLogin = async (email, password) => {
  try {
    await request("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
    return true;
  } catch {
    return false;
  }
};
export const adminLogout = () => request("/api/auth/logout", { method: "POST" });
export const isAdminAuthenticated = () =>
  request("/api/auth/me")
    .then(() => true)
    .catch(() => false);

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
