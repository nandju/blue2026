"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getMembers, deleteMember, membersBulk, membersExportUrl, memberDraftFromSubmission,
} from "@/lib/store";
import LastModified from "@/components/admin/LastModified";
import { inputCls, btnPrimary } from "@/components/admin/ui";
import MemberForm from "@/components/admin/members/MemberForm";
import MemberImport from "@/components/admin/members/MemberImport";
import { MEMBER_STATUSES, MEMBER_ORIGINS, MEMBER_KINDS } from "@/lib/memberModel";

const PAGE_SIZE = 20;

// Registre des membres BLUE : fiches, statuts, codes d'accès Academy,
// import/export CSV, conversion de candidatures acceptées.
export default function AdminMembersPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ q: "", status: "", tshirt: "", kind: "member", origin: "", sort: "recent" });
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(new Set());
  const [modal, setModal] = useState(null); // null | { type:'form', member } | { type:'import' }
  const [linkNotice, setLinkNotice] = useState("");

  const load = useCallback(() => {
    getMembers({ ...filters, page, pageSize: PAGE_SIZE })
      .then(setData)
      .catch((e) => setError(e.message));
  }, [filters, page]);
  useEffect(() => { load(); }, [load]);

  // Pont « Convertir en membre » depuis une candidature acceptée (?from=sid).
  useEffect(() => {
    const sid = new URLSearchParams(window.location.search).get("from");
    if (!sid) return;
    memberDraftFromSubmission(sid)
      .then(({ draft, existing }) => {
        if (existing) {
          setLinkNotice(
            `Le téléphone ${draft.phone} correspond déjà au membre ${existing.identifier} (${existing.firstName} ${existing.lastName}). ` +
            "Vous pouvez lier la candidature en ouvrant sa fiche, ou modifier le téléphone dans le nouveau membre."
          );
          setModal({ type: "form", member: { ...draft, phone: draft.phone } , existing });
        } else {
          setModal({ type: "form", member: draft });
        }
        window.history.replaceState(null, "", "/admin/membres");
      })
      .catch((e) => setError(e.message));
  }, []);

  const set = (k, v) => { setFilters((f) => ({ ...f, [k]: v })); setPage(1); };
  const items = data?.items || [];
  const totalPages = Math.max(1, Math.ceil((data?.total || 0) / PAGE_SIZE));
  const allSelected = items.length > 0 && items.every((m) => selected.has(m.id));

  const toggleAll = () =>
    setSelected((s) => (allSelected ? new Set() : new Set(items.map((m) => m.id))));
  const toggleOne = (id) =>
    setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const bulkStatus = async (status) => {
    if (!selected.size) return;
    try {
      await membersBulk({ ids: [...selected], status });
      setSelected(new Set());
      load();
    } catch (e) { setError(e.message); }
  };

  const remove = async (m) => {
    if (!confirm(`Supprimer ${m.identifier} — ${m.firstName} ${m.lastName} ?\nSon identifiant ne sera jamais réattribué.`)) return;
    try { await deleteMember(m.id); load(); } catch (e) { alert(e.message); }
  };

  const exportUrl = membersExportUrl({ ...filters, kind: filters.kind || undefined });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          Registre des membres {data ? <span className="text-sm font-normal text-gray-400">({data.total})</span> : ""}
        </h2>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setModal({ type: "import" })}
            className="px-4 py-2 rounded-xl border border-[rgba(13,110,187,0.25)] text-[#0D6EBB] text-sm font-semibold hover:bg-[rgba(13,110,187,0.06)] transition-colors">
            ⬆ Import CSV
          </button>
          <a href={exportUrl} className="px-4 py-2 rounded-xl border border-[rgba(13,110,187,0.25)] text-[#0D6EBB] text-sm font-semibold hover:bg-[rgba(13,110,187,0.06)] transition-colors">
            Export CSV ↓
          </a>
          <motion.button onClick={() => setModal({ type: "form", member: null })} whileHover={{ scale: 1.02 }} className={btnPrimary}>
            + Nouveau membre
          </motion.button>
        </div>
      </div>

      {linkNotice && (
        <p className="mb-4 rounded-xl bg-sky-50 border border-sky-200 px-4 py-3 text-sm text-sky-800">
          {linkNotice}{" "}
          <button onClick={() => setLinkNotice("")} className="font-bold underline">OK</button>
        </p>
      )}
      {error && <p className="mb-4 text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">{error}</p>}

      {/* Filtres */}
      <div className="flex flex-wrap gap-2 mb-4">
        <input value={filters.q} onChange={(e) => set("q", e.target.value)}
          placeholder="Rechercher (nom, téléphone, identifiant…)" className={`${inputCls} flex-1 min-w-52`} />
        <select value={filters.kind} onChange={(e) => set("kind", e.target.value)} className={`${inputCls} w-auto`}>
          <option value="member">Membres BLUE</option>
          <option value="external">Accès payants</option>
          <option value="">Tous</option>
        </select>
        <select value={filters.status} onChange={(e) => set("status", e.target.value)} className={`${inputCls} w-auto`}>
          <option value="">Tous statuts</option>
          {Object.values(MEMBER_STATUSES).map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
        <select value={filters.tshirt} onChange={(e) => set("tshirt", e.target.value)} className={`${inputCls} w-auto`}>
          <option value="">T-shirt : tous</option>
          <option value="yes">T-shirt : oui</option>
          <option value="no">T-shirt : non</option>
        </select>
        <select value={filters.origin} onChange={(e) => set("origin", e.target.value)} className={`${inputCls} w-auto`}>
          <option value="">Toutes origines</option>
          {Object.entries(MEMBER_ORIGINS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
        </select>
        <select value={filters.sort} onChange={(e) => set("sort", e.target.value)} className={`${inputCls} w-auto`}>
          <option value="recent">Plus récents</option>
          <option value="oldest">Plus anciens</option>
          <option value="name">Nom A→Z</option>
        </select>
      </div>

      {/* Actions groupées */}
      {selected.size > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl bg-[rgba(13,110,187,0.06)] border border-[rgba(13,110,187,0.15)] px-4 py-3">
          <span className="text-sm font-semibold text-gray-700">{selected.size} sélectionné(s)</span>
          {Object.values(MEMBER_STATUSES).map((s) => (
            <button key={s.key} onClick={() => bulkStatus(s.key)}
              className="px-3 py-1.5 rounded-lg bg-white border border-[rgba(13,110,187,0.2)] text-xs font-semibold text-[#0D6EBB] hover:bg-[rgba(13,110,187,0.08)]">
              → {s.label}
            </button>
          ))}
          <button onClick={() => setSelected(new Set())} className="text-xs text-gray-400 hover:text-gray-600 ml-auto">Désélectionner</button>
        </div>
      )}

      {/* Liste */}
      {!data && !error && <div className="space-y-3">{[0, 1, 2].map((i) => <div key={i} className="h-16 bg-white rounded-xl animate-pulse" />)}</div>}
      {data && items.length === 0 && (
        <div className="text-center py-16 text-gray-400"><p className="text-3xl mb-2">👥</p><p>Aucun membre</p></div>
      )}

      <div className="space-y-2">
        {items.map((m) => (
          <motion.div key={m.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="bg-white rounded-xl border border-[rgba(13,110,187,0.12)] p-4 flex items-center gap-4">
            <input type="checkbox" checked={selected.has(m.id)} onChange={() => toggleOne(m.id)}
              className="w-4 h-4 accent-[#0D6EBB] shrink-0" aria-label={`Sélectionner ${m.identifier}`} />
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#0D6EBB]">{m.identifier}</span>
                <span className="font-semibold text-gray-900">{m.firstName} {m.lastName}</span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                  style={{ background: `${MEMBER_STATUSES[m.status]?.color}18`, color: MEMBER_STATUSES[m.status]?.color }}>
                  {MEMBER_STATUSES[m.status]?.label || m.status}
                </span>
                {m.suggestActive && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    ★ Éligible Actif
                  </span>
                )}
                {m.kind === "external" && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">Accès payant</span>
                )}
                {m.accessDisabled && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200">Accès désactivé</span>
                )}
              </div>
              <p className="text-gray-500 text-xs mt-1">
                {m.phone}{m.email ? ` · ${m.email}` : ""}{m.commune ? ` · ${m.commune}` : ""} · {m.activitiesCount ?? 0} activité(s)
                {m.tshirt ? " · T-shirt ✓" : ""} · {MEMBER_ORIGINS[m.origin] || m.origin}
              </p>
              {m.updatedAt && <LastModified at={m.updatedAt} by={m.updatedBy} className="mt-0.5" />}
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => setModal({ type: "form", member: m })}
                className="text-[#0D6EBB] hover:text-[#0DBD9F] text-sm font-medium px-3 py-1 rounded-lg hover:bg-[rgba(13,110,187,0.06)]">
                Modifier
              </button>
              <button onClick={() => remove(m)}
                className="text-red-400 hover:text-red-600 text-sm font-medium px-3 py-1 rounded-lg hover:bg-red-50">
                Supprimer
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 disabled:opacity-40 hover:bg-gray-50">← Précédent</button>
          <span className="text-sm text-gray-500">Page {page} / {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 disabled:opacity-40 hover:bg-gray-50">Suivant →</button>
        </div>
      )}

      <div className="mt-4 flex justify-center">
        <button onClick={toggleAll} className="text-xs text-gray-400 hover:text-gray-600">
          {allSelected ? "Tout désélectionner" : "Tout sélectionner"}
        </button>
      </div>

      <AnimatePresence>
        {modal?.type === "form" && (
          <MemberForm
            member={modal.member}
            existing={modal.existing}
            onClose={() => setModal(null)}
            onSaved={() => load()}
          />
        )}
        {modal?.type === "import" && (
          <MemberImport onClose={() => setModal(null)} onDone={load} />
        )}
      </AnimatePresence>
    </div>
  );
}
