"use client";
import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getLoginLogs, getActivityLogs, getLogFacets, logExportUrl } from "@/lib/store";
import { formatLogDate, formatLogTime, sessionEnd } from "@/lib/adminLogFormat";
import { inputCls, btnSecondary } from "@/components/admin/ui";

const TABS = [
  { id: "activities", label: "Activités" },
  { id: "logins", label: "Connexions" },
];

const PERIODS = [
  { value: "all", label: "Toute la période" },
  { value: "today", label: "Aujourd'hui" },
  { value: "7", label: "7 derniers jours" },
  { value: "30", label: "30 derniers jours" },
  { value: "custom", label: "Personnalisée…" },
];

const day = (d) => d.toISOString().slice(0, 10);
const EMPTY_FILTERS = { period: "all", from: "", to: "", person: "", department: "", module: "", action: "", result: "", q: "" };

function toQuery(filters, page) {
  const { period, ...rest } = filters;
  const q = { ...rest, page, pageSize: 25 };
  const now = new Date();
  if (period === "today") q.from = q.to = day(now);
  else if (period === "7" || period === "30") {
    q.from = day(new Date(now.getTime() - (Number(period) - 1) * 864e5));
    q.to = day(now);
  } else if (period !== "custom") {
    q.from = "";
    q.to = "";
  }
  return q;
}

function Pagination({ data, onPage }) {
  if (!data || data.pages <= 1) return null;
  return (
    <div className="flex items-center justify-between mt-4 text-sm">
      <span className="text-gray-500">{data.total} entrée{data.total > 1 ? "s" : ""} · page {data.page} / {data.pages}</span>
      <div className="flex gap-2">
        <button className={btnSecondary} disabled={data.page <= 1} onClick={() => onPage(data.page - 1)}>← Précédent</button>
        <button className={btnSecondary} disabled={data.page >= data.pages} onClick={() => onPage(data.page + 1)}>Suivant →</button>
      </div>
    </div>
  );
}

function ActivityRow({ a }) {
  const [open, setOpen] = useState(false);
  const hasChanges = a.changes?.length > 0;
  return (
    <li className="py-3">
      <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-4">
        <div className="md:w-36 shrink-0 text-xs text-gray-500">
          <p className="font-medium text-gray-700">{formatLogDate(a.at)}</p>
          <p>{formatLogTime(a.at)}</p>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-800">
            <span className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[rgba(13,110,187,0.08)] text-[#0D6EBB] mr-2">{a.action}</span>
            <span className="text-gray-500">{a.module} —</span> <span className="font-medium">{a.target}</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">{a.name} ({a.department})</p>
          {hasChanges && (
            <button onClick={() => setOpen((o) => !o)} className="text-xs text-[#0D6EBB] hover:text-[#0DBD9F] mt-1">
              {open ? "Masquer" : "Voir"} les modifications ({a.changes.length})
            </button>
          )}
          {open && (
            <ul className="mt-2 space-y-1 bg-[#f7faff] rounded-xl p-3">
              {a.changes.map((c, i) => (
                <li key={i} className="text-xs text-gray-600 break-words">
                  <span className="font-semibold text-gray-800">{c.field}</span> : <span className="line-through text-gray-400">{c.from}</span> → <span className="text-gray-800">{c.to}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </li>
  );
}

function LoginsTable({ items }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-gray-500 border-b border-[rgba(13,110,187,0.1)]">
            <th className="py-2 pr-3 font-medium">Date</th>
            <th className="py-2 pr-3 font-medium">Personne</th>
            <th className="py-2 pr-3 font-medium">Résultat</th>
            <th className="py-2 pr-3 font-medium">IP</th>
            <th className="py-2 pr-3 font-medium">Navigateur · Appareil</th>
            <th className="py-2 pr-3 font-medium">Fin de session</th>
          </tr>
        </thead>
        <tbody>
          {items.map((l) => (
            <tr key={l.id} className="border-b border-[rgba(13,110,187,0.06)] align-top">
              <td className="py-3 pr-3 whitespace-nowrap text-xs">
                <p className="font-medium text-gray-700">{formatLogDate(l.at)}</p>
                <p className="text-gray-500">{formatLogTime(l.at)}</p>
              </td>
              <td className="py-3 pr-3">
                <p className="font-medium text-gray-800">{l.name}</p>
                <p className="text-xs text-gray-500">{l.department}</p>
              </td>
              <td className="py-3 pr-3">
                {l.success ? (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[rgba(13,189,159,0.12)] text-[#0DBD9F]">Réussie</span>
                ) : (
                  <>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-500">Échouée</span>
                    <p className="text-xs text-gray-500 mt-1">{l.reason}</p>
                  </>
                )}
              </td>
              <td className="py-3 pr-3 text-xs text-gray-600 whitespace-nowrap">{l.ip}</td>
              <td className="py-3 pr-3 text-xs text-gray-600">{l.browser} · {l.os}<br /><span className="text-gray-400">{l.device}</span></td>
              <td className="py-3 pr-3 text-xs text-gray-600">{sessionEnd(l)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminJournalPage() {
  const [tab, setTab] = useState("activities");
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [facets, setFacets] = useState({ names: [], departments: [], modules: [], actions: [] });
  const [error, setError] = useState("");

  useEffect(() => { getLogFacets().then(setFacets).catch(() => {}); }, []);

  // Recherche libre : appliquée après une courte pause de saisie.
  useEffect(() => {
    const t = setTimeout(() => setFilters((f) => (f.q === search ? f : { ...f, q: search })), 350);
    return () => clearTimeout(t);
  }, [search]);

  const query = toQuery(filters, page);
  const queryKey = JSON.stringify({ tab, query });

  const load = useCallback(() => {
    setError("");
    setData(null);
    const fn = tab === "logins" ? getLoginLogs : getActivityLogs;
    const { module, action, result, ...common } = query;
    fn(tab === "logins" ? { ...common, result } : { ...common, module, action })
      .then(setData)
      .catch((e) => setError(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryKey]);
  useEffect(() => { load(); }, [load]);

  const setFilter = (key, value) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
  };
  const changeTab = (id) => {
    setTab(id);
    setPage(1);
  };
  const reset = () => {
    setFilters(EMPTY_FILTERS);
    setSearch("");
    setPage(1);
  };

  const exportCsv = () => {
    const { page: _p, pageSize: _s, module, action, result, ...common } = query;
    window.location.href = logExportUrl(tab, tab === "logins" ? { ...common, result } : { ...common, module, action });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2 bg-white rounded-xl p-1 border border-[rgba(13,110,187,0.1)]" role="tablist">
          {TABS.map((t) => (
            <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => changeTab(t.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.id ? "bg-[#0D6EBB] text-white" : "text-gray-600 hover:bg-gray-50"}`}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 hidden sm:inline">🔒 Journal en lecture seule</span>
          <button className={btnSecondary} onClick={exportCsv}>⬇ Exporter en CSV</button>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-2xl border border-[rgba(13,110,187,0.12)] p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <select value={filters.period} onChange={(e) => setFilter("period", e.target.value)} className={inputCls} aria-label="Période">
            {PERIODS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
          <input list="journal-names" value={filters.person} onChange={(e) => setFilter("person", e.target.value)} placeholder="Personne…" className={inputCls} aria-label="Personne" />
          <datalist id="journal-names">{facets.names.map((n) => <option key={n} value={n} />)}</datalist>
          <select value={filters.department} onChange={(e) => setFilter("department", e.target.value)} className={inputCls} aria-label="Département">
            <option value="">Tous les départements</option>
            {facets.departments.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          {tab === "activities" ? (
            <select value={filters.module} onChange={(e) => setFilter("module", e.target.value)} className={inputCls} aria-label="Module">
              <option value="">Tous les modules</option>
              {facets.modules.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          ) : (
            <select value={filters.result} onChange={(e) => setFilter("result", e.target.value)} className={inputCls} aria-label="Résultat">
              <option value="">Réussies et échouées</option>
              <option value="success">Réussies</option>
              <option value="failure">Échouées</option>
            </select>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {filters.period === "custom" && (
            <>
              <label className="text-xs text-gray-500">Du
                <input type="date" value={filters.from} onChange={(e) => setFilter("from", e.target.value)} className={inputCls} />
              </label>
              <label className="text-xs text-gray-500">Au
                <input type="date" value={filters.to} onChange={(e) => setFilter("to", e.target.value)} className={inputCls} />
              </label>
            </>
          )}
          {tab === "activities" && (
            <select value={filters.action} onChange={(e) => setFilter("action", e.target.value)} className={inputCls} aria-label="Action">
              <option value="">Toutes les actions</option>
              {facets.actions.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          )}
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Rechercher…" className={inputCls} aria-label="Recherche" />
          <button onClick={reset} className="text-sm text-gray-500 hover:text-[#0D6EBB] text-left sm:text-center">Réinitialiser les filtres</button>
        </div>
      </div>

      {error && <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">{error}</p>}

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          className="bg-white rounded-2xl border border-[rgba(13,110,187,0.12)] p-4 md:p-5">
          {data === null && !error ? (
            <div className="space-y-3">{[0, 1, 2, 3].map((i) => <div key={i} className="h-12 bg-[#f7faff] rounded-xl animate-pulse" />)}</div>
          ) : data?.items.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-12">Aucune entrée pour ces filtres.</p>
          ) : data && tab === "activities" ? (
            <ul className="divide-y divide-[rgba(13,110,187,0.08)]">{data.items.map((a) => <ActivityRow key={a.id} a={a} />)}</ul>
          ) : data ? (
            <LoginsTable items={data.items} />
          ) : null}
          <Pagination data={data} onPage={setPage} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
