import "server-only";
import { createCollection, nowIso, sameId } from "./collection";
import { NotFoundError } from "../errors";

const usersCol = createCollection("chat-users", { idType: "string" });
const messagesCol = createCollection("chat-messages");

const genId = () => `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export const chat = {
  async listUsers() {
    return [...(await usersCol.all())].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  },
  getUser: (id) => usersCol.get(id),
  async getUserBySession(sessionId) {
    return (await usersCol.all()).find((u) => u.sessionId === sessionId) || null;
  },
  addUser(data) {
    return usersCol.mutate((list) => {
      const existing = list.find((u) => u.sessionId === data.sessionId);
      if (existing) return existing;
      const rec = {
        id: genId(),
        sessionId: data.sessionId,
        lastName: data.lastName ?? null,
        firstName: data.firstName ?? null,
        age: data.age ?? null,
        location: data.location ?? null,
        job: data.job ?? null,
        isMember: !!data.isMember,
        motivation: data.motivation ?? null,
        createdAt: nowIso(),
      };
      list.push(rec);
      return rec;
    });
  },
  async listMessages(chatUserId) {
    return (await messagesCol.all())
      .filter((m) => sameId(m.chatUserId, chatUserId))
      .sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)))
      .map(({ chatUserId: _u, ...m }) => m);
  },
  async addMessage(chatUserId, userMessage, aiResponse) {
    if (!(await usersCol.get(chatUserId))) throw new NotFoundError("Utilisateur MR BLUE introuvable");
    const { chatUserId: _u, ...rec } = await messagesCol.insert({ chatUserId, userMessage, aiResponse, createdAt: nowIso() });
    return rec;
  },
  async stats() {
    const users = await usersCol.all();
    const totalMessages = (await messagesCol.all()).length;
    const today = new Date().toDateString();
    const newToday = users.filter((u) => new Date(u.createdAt).toDateString() === today).length;
    const counts = {};
    users.forEach((u) => {
      if (u.location) {
        const key = u.location.toLowerCase().trim();
        counts[key] = (counts[key] || 0) + 1;
      }
    });
    const topLocations = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([loc, count]) => ({ loc, count }));
    return { totalUsers: users.length, totalMessages, newToday, topLocations };
  },
};
