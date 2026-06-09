"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  isAdminAuthenticated, adminLogout,
  getChatUsers, getChatMessages, getChatStats,
} from "@/lib/store";

const DATE_FILTERS = [
  { value: "all", label: "Tous" },
  { value: "today", label: "Aujourd'hui" },
  { value: "week", label: "7 derniers jours" },
  { value: "month", label: "30 derniers jours" },
];

function StatCard({ icon, label, value, color }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-[rgba(13,110,187,0.1)] flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${color}`}>{icon}</div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function UserCard({ user, selected, onClick }) {
  const initials = `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase();
  const date = new Date(user.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl border transition-colors ${
        selected ? "bg-[rgba(13,110,187,0.08)] border-[#0D6EBB]" : "bg-white border-[rgba(13,110,187,0.08)] hover:bg-gray-50"
      }`}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0D6EBB] to-[#0DBD9F] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          {initials || "?"}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm truncate">{user.firstName} {user.lastName}</p>
          <p className="text-xs text-gray-500 truncate">📍 {user.location || "—"}</p>
        </div>
        <span className="text-[10px] text-gray-400 flex-shrink-0">{date}</span>
      </div>
    </button>
  );
}

function UserProfile({ user, messages }) {
  const fields = [
    { label: "Nom complet", value: `${user.firstName} ${user.lastName}` },
    { label: "Âge", value: user.age },
    { label: "Localité", value: user.location },
    { label: "Profession", value: user.job },
    { label: "Motivation", value: user.motivation },
    { label: "Date d'inscription", value: new Date(user.createdAt).toLocaleString("fr-FR") },
  ];

  return (
    <motion.div key={user.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="h-full flex flex-col">
      {/* Profile header */}
      <div className="bg-gradient-to-r from-[#0D6EBB] to-[#0DBD9F] rounded-2xl p-5 mb-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white font-bold text-xl">
            {`${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase()}
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">{user.firstName} {user.lastName}</h3>
            <p className="text-white/80 text-sm">📍 {user.location}</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-white/70 text-xs">Conversations</p>
            <p className="text-white font-bold text-2xl">{messages.length}</p>
          </div>
        </div>
      </div>

      {/* Profile fields */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {fields.map((f) => (
          <div key={f.label} className="bg-white rounded-xl p-3 border border-[rgba(13,110,187,0.08)]">
            <p className="text-[10px] text-gray-400 uppercase tracking-wide">{f.label}</p>
            <p className="text-sm text-gray-800 font-medium mt-0.5 truncate">{f.value || "—"}</p>
          </div>
        ))}
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto space-y-3">
        <h4 className="text-sm font-bold text-gray-700">Historique des conversations ({messages.length})</h4>
        {messages.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">Aucune conversation enregistrée</p>
        ) : (
          messages.map((msg, i) => (
            <div key={msg.id || i} className="bg-white rounded-xl border border-[rgba(13,110,187,0.08)] p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#0D6EBB] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-[10px] font-bold">U</span>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-400 mb-1">{new Date(msg.createdAt).toLocaleString("fr-FR")}</p>
                  <p className="text-sm text-gray-800">{msg.userMessage}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 pl-2 border-l-2 border-[#0DBD9F]">
                <div className="w-6 h-6 rounded-full bg-[#0DBD9F] flex items-center justify-center flex-shrink-0 mt-0.5 text-white text-[10px] font-bold">MB</div>
                <p className="text-sm text-gray-600 flex-1">{msg.aiResponse}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}

export default function AdminChatbot() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ totalUsers: 0, totalMessages: 0, newToday: 0, topLocations: [] });
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedMsgs, setSelectedMsgs] = useState([]);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("all");

  useEffect(() => {
    if (!isAdminAuthenticated()) { router.replace("/admin"); return; }
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = () => {
    setUsers(getChatUsers());
    setStats(getChatStats());
  };

  const selectUser = (user) => {
    setSelectedUser(user);
    setSelectedMsgs(getChatMessages(user.id));
  };

  const filteredUsers = users.filter((u) => {
    const matchSearch = !search ||
      `${u.firstName} ${u.lastName} ${u.location} ${u.job}`.toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;
    if (dateFilter === "all") return true;
    const d = new Date(u.createdAt);
    const now = new Date();
    if (dateFilter === "today") return d.toDateString() === now.toDateString();
    if (dateFilter === "week") return d >= new Date(now - 7 * 864e5);
    if (dateFilter === "month") return d >= new Date(now - 30 * 864e5);
    return true;
  });

  return (
    <div className="min-h-screen bg-[#f7faff] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-[rgba(13,110,187,0.1)] px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard" className="text-[#0D6EBB] hover:text-[#0DBD9F] text-sm transition-colors">← Dashboard</Link>
          <div className="w-px h-5 bg-gray-200" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#0D6EBB] flex items-center justify-center text-white text-xs font-bold">MB</div>
            <h1 className="font-bold text-gray-900">MR BLUE — Gestion des conversations</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={loadData} className="text-sm text-[#0D6EBB] hover:text-[#0DBD9F] transition-colors">↻ Actualiser</button>
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">← Site</Link>
          <button onClick={() => { adminLogout(); router.replace("/admin"); }}
            className="text-sm text-red-400 hover:text-red-600 transition-colors">Déconnexion</button>
        </div>
      </header>

      <div className="flex-1 p-6 space-y-6 max-w-[1400px] mx-auto w-full">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon="👥" label="Utilisateurs total" value={stats.totalUsers} color="bg-blue-50 text-blue-600" />
          <StatCard icon="💬" label="Conversations total" value={stats.totalMessages} color="bg-teal-50 text-teal-600" />
          <StatCard icon="🆕" label="Nouveaux aujourd'hui" value={stats.newToday} color="bg-green-50 text-green-600" />
          <div className="bg-white rounded-2xl p-5 border border-[rgba(13,110,187,0.1)]">
            <p className="text-xs text-gray-500 mb-2 font-medium">Top localités</p>
            {stats.topLocations?.length === 0 && <p className="text-xs text-gray-400">Aucune donnée</p>}
            {stats.topLocations?.slice(0, 3).map((l) => (
              <div key={l.loc} className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-700 capitalize truncate">{l.loc}</span>
                <span className="text-xs font-bold text-[#0D6EBB] ml-2">{l.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main content */}
        <div className="flex gap-6 h-[calc(100vh-280px)]">
          {/* User list */}
          <div className="w-80 flex-shrink-0 flex flex-col gap-3">
            <div className="flex gap-2">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un utilisateur..."
                className="flex-1 bg-white rounded-xl px-4 py-2.5 text-sm border border-[rgba(13,110,187,0.15)] outline-none focus:border-[#0D6EBB] transition-colors"
              />
            </div>
            <div className="flex gap-1 flex-wrap">
              {DATE_FILTERS.map((f) => (
                <button key={f.value} onClick={() => setDateFilter(f.value)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    dateFilter === f.value ? "bg-[#0D6EBB] text-white" : "bg-white text-gray-500 border border-[rgba(13,110,187,0.15)] hover:border-[#0D6EBB]"
                  }`}>
                  {f.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400">{filteredUsers.length} utilisateur{filteredUsers.length !== 1 ? "s" : ""}</p>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-4xl mb-3">💬</p>
                  <p className="text-sm text-gray-400">Aucun utilisateur trouvé</p>
                </div>
              ) : (
                filteredUsers.map((u) => (
                  <UserCard key={u.id} user={u} selected={selectedUser?.id === u.id} onClick={() => selectUser(u)} />
                ))
              )}
            </div>
          </div>

          {/* Conversation detail */}
          <div className="flex-1 bg-white rounded-2xl border border-[rgba(13,110,187,0.1)] p-6 overflow-hidden flex flex-col">
            <AnimatePresence mode="wait">
              {selectedUser ? (
                <UserProfile key={selectedUser.id} user={selectedUser} messages={selectedMsgs} />
              ) : (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#0D6EBB] to-[#0DBD9F] flex items-center justify-center text-white text-3xl font-bold mb-4">MB</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">MR BLUE Analytics</h3>
                  <p className="text-gray-400 text-sm max-w-xs">Sélectionnez un utilisateur dans la liste pour consulter son profil et son historique de conversation.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
