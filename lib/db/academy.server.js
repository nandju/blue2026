import "server-only";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { incrementCourseEnrolledServer } from "@/lib/db/courses.server";

// ─── Registrations ─────────────────────────────────────────────────────────

const mapRegistration = (r) => ({
  id: r.id,
  courseId: r.course_id,
  firstName: r.first_name,
  lastName: r.last_name,
  age: r.age,
  organization: r.organization,
  whatsapp: r.whatsapp,
  email: r.email,
  date: r.created_at,
});

export async function getRegistrationsServer() {
  const { data, error } = await getSupabaseAdmin()
    .from("registrations")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data.map(mapRegistration);
}

export async function addRegistrationServer(reg) {
  const { data, error } = await getSupabaseAdmin()
    .from("registrations")
    .insert({
      course_id: reg.courseId,
      first_name: reg.firstName,
      last_name: reg.lastName,
      age: reg.age || null,
      organization: reg.organization || null,
      whatsapp: reg.whatsapp,
      email: reg.email,
    })
    .select()
    .single();
  if (error) throw error;
  await incrementCourseEnrolledServer(reg.courseId);
  return mapRegistration(data);
}

export async function isRegisteredServer(courseId, email) {
  const { data, error } = await getSupabaseAdmin()
    .from("registrations")
    .select("id")
    .eq("course_id", courseId)
    .eq("email", email)
    .maybeSingle();
  if (error) throw error;
  return !!data;
}

// ─── Quiz results ───────────────────────────────────────────────────────────

export async function addQuizResultServer(result) {
  const { data, error } = await getSupabaseAdmin()
    .from("quiz_results")
    .insert({
      course_id: result.courseId,
      email: result.email,
      score: result.score,
      correct: result.correct,
      total: result.total,
      passed: result.passed,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getCourseQuizResultServer(courseId, email) {
  const { data, error } = await getSupabaseAdmin()
    .from("quiz_results")
    .select("*")
    .eq("course_id", courseId)
    .eq("email", email)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// ─── Certificate requests ───────────────────────────────────────────────────

const mapCertificateRequest = (r) => ({
  id: r.id,
  courseId: r.course_id,
  courseTitle: r.course_title,
  email: r.email,
  firstName: r.first_name,
  lastName: r.last_name,
  score: r.score,
  paymentInfo: r.payment_info,
  status: r.status,
  date: r.created_at,
});

export async function getCertificateRequestsServer() {
  const { data, error } = await getSupabaseAdmin()
    .from("certificate_requests")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data.map(mapCertificateRequest);
}

export async function addCertificateRequestServer(req) {
  const { data, error } = await getSupabaseAdmin()
    .from("certificate_requests")
    .insert({
      course_id: req.courseId,
      course_title: req.courseTitle,
      email: req.email,
      first_name: req.firstName,
      last_name: req.lastName,
      score: req.score,
      payment_info: req.paymentInfo || null,
    })
    .select()
    .single();
  if (error) throw error;
  return mapCertificateRequest(data);
}

export async function updateCertificateRequestServer(id, updates) {
  const { data, error } = await getSupabaseAdmin()
    .from("certificate_requests")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return mapCertificateRequest(data);
}
