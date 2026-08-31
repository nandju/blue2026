import "server-only";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function getCoursesServer() {
  const { data, error } = await getSupabaseAdmin()
    .from("courses")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data;
}

export async function getCourseServer(id) {
  const { data, error } = await getSupabaseAdmin()
    .from("courses")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function addCourseServer(course) {
  const { data, error } = await getSupabaseAdmin()
    .from("courses")
    .insert({
      id: course.id,
      title: course.title,
      description: course.description,
      category: course.category,
      level: course.level,
      duration: course.duration,
      video: course.video,
      sections: course.sections || [],
      resources: course.resources || [],
      quiz: course.quiz || [],
      enrolled: course.enrolled || 0,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateCourseServer(id, updates) {
  const { data, error } = await getSupabaseAdmin()
    .from("courses")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteCourseServer(id) {
  const { error } = await getSupabaseAdmin().from("courses").delete().eq("id", id);
  if (error) throw error;
}

export async function incrementCourseEnrolledServer(id) {
  const course = await getCourseServer(id);
  if (!course) return null;
  return updateCourseServer(id, { enrolled: (course.enrolled || 0) + 1 });
}
