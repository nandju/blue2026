import "server-only";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const genId = () => `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const mapChatUser = (u) => ({
  id: u.id,
  sessionId: u.session_id,
  lastName: u.last_name,
  firstName: u.first_name,
  age: u.age,
  location: u.location,
  job: u.job,
  isMember: u.is_member,
  motivation: u.motivation,
  createdAt: u.created_at,
});

const mapChatMessage = (m) => ({
  id: m.id,
  userMessage: m.user_message,
  aiResponse: m.ai_response,
  createdAt: m.created_at,
});

export async function getChatUsersServer() {
  const { data, error } = await getSupabaseAdmin()
    .from("chat_users")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data.map(mapChatUser);
}

export async function getChatUserBySessionServer(sessionId) {
  const { data, error } = await getSupabaseAdmin()
    .from("chat_users")
    .select("*")
    .eq("session_id", sessionId)
    .maybeSingle();
  if (error) throw error;
  return data ? mapChatUser(data) : null;
}

export async function addChatUserServer(userData) {
  const existing = await getChatUserBySessionServer(userData.sessionId);
  if (existing) return existing;

  const { data, error } = await getSupabaseAdmin()
    .from("chat_users")
    .insert({
      id: genId(),
      session_id: userData.sessionId,
      last_name: userData.lastName,
      first_name: userData.firstName,
      age: userData.age,
      location: userData.location,
      job: userData.job,
      is_member: userData.isMember || false,
      motivation: userData.motivation,
    })
    .select()
    .single();
  if (error) throw error;
  return mapChatUser(data);
}

export async function getChatMessagesServer(chatUserId) {
  const { data, error } = await getSupabaseAdmin()
    .from("chat_messages")
    .select("*")
    .eq("chat_user_id", chatUserId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data.map(mapChatMessage);
}

export async function addChatMessageServer(chatUserId, userMessage, aiResponse) {
  const { data, error } = await getSupabaseAdmin()
    .from("chat_messages")
    .insert({ chat_user_id: chatUserId, user_message: userMessage, ai_response: aiResponse })
    .select()
    .single();
  if (error) throw error;
  return mapChatMessage(data);
}

export async function getChatStatsServer() {
  const users = await getChatUsersServer();
  const { count: totalMessages, error: countError } = await getSupabaseAdmin()
    .from("chat_messages")
    .select("id", { count: "exact", head: true });
  if (countError) throw countError;

  const today = new Date().toDateString();
  const newToday = users.filter((u) => new Date(u.createdAt).toDateString() === today).length;

  const communeCounts = {};
  users.forEach((u) => {
    if (u.location) {
      const key = u.location.toLowerCase().trim();
      communeCounts[key] = (communeCounts[key] || 0) + 1;
    }
  });
  const topLocations = Object.entries(communeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([loc, count]) => ({ loc, count }));

  return { totalUsers: users.length, totalMessages: totalMessages || 0, newToday, topLocations };
}
