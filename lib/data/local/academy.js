import "server-only";
import seedCourses from "../seed/courses.json";
import { createCollection, nowIso, sameEmail, sameId } from "./collection";
import { ConflictError, NotFoundError } from "../errors";

// Formats identiques à ceux de lib/db/*.server.js (pilote Supabase d'origine) :
// - courses : colonnes SQL (created_at, updated_at…)
// - registrations / certificates : objets « mappés » en camelCase
// - quizResults : lignes SQL brutes (course_id, created_at…)

const coursesCol = createCollection("courses", { seed: seedCourses, idType: "string" });
const registrationsCol = createCollection("registrations");
const quizCol = createCollection("quiz-results");
const certificatesCol = createCollection("certificate-requests");

const COURSE_NOT_FOUND = "Formation introuvable";
const byDateDesc = (key) => (a, b) => String(b[key]).localeCompare(String(a[key]));

export const courses = {
  async list() {
    const list = await coursesCol.all();
    return [...list].sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)));
  },
  get: (id) => coursesCol.get(id),
  count: async () => (await coursesCol.all()).length,
  create(course, by = null) {
    return coursesCol.mutate((list) => {
      if (list.some((c) => sameId(c.id, course.id))) throw new ConflictError("Une formation avec cet identifiant existe déjà");
      const rec = {
        sections: [], resources: [], quiz: [], enrolled: 0,
        ...course,
        created_at: nowIso(), updated_at: nowIso(), created_by: by, updated_by: by,
      };
      list.push(rec);
      return rec;
    });
  },
  update(id, updates, by = null) {
    const { id: _ignored, created_at: _c, ...rest } = updates;
    return coursesCol.update(id, { ...rest, updated_at: nowIso(), updated_by: by }, COURSE_NOT_FOUND);
  },
  async remove(id) {
    const removed = await coursesCol.remove(id, COURSE_NOT_FOUND);
    // Même comportement que « on delete cascade » en SQL.
    await registrationsCol.mutate((list) => { for (let i = list.length - 1; i >= 0; i--) if (sameId(list[i].courseId, id)) list.splice(i, 1); });
    await quizCol.mutate((list) => { for (let i = list.length - 1; i >= 0; i--) if (sameId(list[i].course_id, id)) list.splice(i, 1); });
    await certificatesCol.mutate((list) => { for (let i = list.length - 1; i >= 0; i--) if (sameId(list[i].courseId, id)) list.splice(i, 1); });
    return removed;
  },
  incrementEnrolled(id) {
    return coursesCol.mutate((list) => {
      const c = list.find((x) => sameId(x.id, id));
      if (!c) return null;
      c.enrolled = (c.enrolled || 0) + 1;
      return c;
    });
  },
};

export const registrations = {
  async list() {
    return [...(await registrationsCol.all())].sort(byDateDesc("date"));
  },
  count: async () => (await registrationsCol.all()).length,
  async isRegistered(courseId, email) {
    return (await registrationsCol.all()).some((r) => sameId(r.courseId, courseId) && sameEmail(r.email, email));
  },
  async add(reg) {
    const created = await registrationsCol.mutate((list) => {
      if (list.some((r) => sameId(r.courseId, reg.courseId) && sameEmail(r.email, reg.email))) {
        throw new ConflictError("Déjà inscrit à cette formation");
      }
      const rec = {
        id: list.reduce((m, r) => Math.max(m, Number(r.id) || 0), 0) + 1,
        courseId: reg.courseId,
        firstName: reg.firstName,
        lastName: reg.lastName,
        age: reg.age ?? null,
        organization: reg.organization || null,
        whatsapp: reg.whatsapp,
        email: reg.email,
        date: nowIso(),
      };
      list.push(rec);
      return rec;
    });
    await courses.incrementEnrolled(reg.courseId);
    return created;
  },
};

export const quizResults = {
  add: (r) =>
    quizCol.insert({
      course_id: r.courseId,
      email: r.email,
      score: r.score,
      correct: r.correct,
      total: r.total,
      passed: r.passed,
      created_at: nowIso(),
    }),
  async getLatest(courseId, email) {
    const list = (await quizCol.all()).filter((r) => sameId(r.course_id, courseId) && sameEmail(r.email, email));
    return list.sort(byDateDesc("created_at"))[0] || null;
  },
  async getLatestPassed(courseId, email) {
    const list = (await quizCol.all()).filter((r) => r.passed && sameId(r.course_id, courseId) && sameEmail(r.email, email));
    return list.sort(byDateDesc("created_at"))[0] || null;
  },
};

export const certificates = {
  async list() {
    return [...(await certificatesCol.all())].sort(byDateDesc("date"));
  },
  get: (id) => certificatesCol.get(id),
  async countByStatus(status) {
    return (await certificatesCol.all()).filter((c) => c.status === status).length;
  },
  add: (req) =>
    certificatesCol.insert({
      courseId: req.courseId,
      courseTitle: req.courseTitle,
      email: req.email,
      firstName: req.firstName,
      lastName: req.lastName,
      score: req.score,
      paymentInfo: req.paymentInfo || null,
      status: "pending",
      date: nowIso(),
    }),
  async update(id, updates, by = null) {
    const existing = await certificatesCol.get(id);
    if (!existing) throw new NotFoundError("Demande de certificat introuvable");
    return certificatesCol.update(id, { ...updates, updatedAt: nowIso(), updatedBy: by });
  },
};
