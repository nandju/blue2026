import "server-only";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const mapVolunteer = (v) => ({
  id: v.id,
  firstName: v.first_name,
  lastName: v.last_name,
  location: v.location,
  photo: v.photo_url,
  actions: v.actions,
  contribution: v.contribution,
  period: v.period,
  active: v.active,
});

export async function getVolunteerServer() {
  const { data, error } = await getSupabaseAdmin()
    .from("volunteer_of_month")
    .select("*")
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ? mapVolunteer(data) : null;
}

export async function setVolunteerServer(v) {
  const current = await getVolunteerServer();
  const payload = {
    first_name: v.firstName,
    last_name: v.lastName,
    location: v.location || null,
    photo_url: v.photo || null,
    actions: v.actions || null,
    contribution: v.contribution || null,
    active: !!v.active,
  };

  if (current) {
    const { data, error } = await getSupabaseAdmin()
      .from("volunteer_of_month")
      .update(payload)
      .eq("id", current.id)
      .select()
      .single();
    if (error) throw error;
    return mapVolunteer(data);
  }

  const { data, error } = await getSupabaseAdmin()
    .from("volunteer_of_month")
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return mapVolunteer(data);
}
