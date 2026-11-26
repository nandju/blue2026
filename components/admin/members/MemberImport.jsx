"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { membersBulk } from "@/lib/store";
import { inputCls, labelCls, btnPrimary } from "@/components/admin/ui";

// Import CSV de membres : aperçu avant import, rapport (créés / ignorés /
// erreurs). Colonnes attendues : nom, prénom, téléphone, email, commune,
// statut, activités, tshirt. Le téléphone dédoublonne côté serveur.

const STATUSES = { actif: "active", "en cours": "pending", inactif: "inactive" };

function parseCsv(text) {
  const sep = text.includes(";") ? ";" : ",";
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return { headers: [], rows: [] };
  const headers = lines[0].split(sep).map((h) => h.trim().toLowerCase().replace(/^\ufeff/, ""));
  const col = (...names) => headers.findIndex((h) => names.some((n) => h.includes(n)));
  const iNom = col("nom"), iPrenom = col("prénom", "prenom"), iTel = col("téléphone", "telephone", "tel");
  const iEmail = col("email", "mail"), iCommune = col("commune"), iStatut = col("statut");
  const iAct = col("activit"), iTshirt = col("t-shirt", "tshirt");
  const rows = lines.slice(1).map((l) => {
    const c = l.split(sep).map((v) => v.trim().replace(/^"|"$/g, ""));
    return {
      lastName: c[iNom] || "",
      firstName: c[iPrenom] || "",
      phone: iTel >= 0 ? c[iTel] : "",
      email: iEmail >= 0 ? c[iEmail] : "",
      commune: iCommune >= 0 ? c[iCommune] : "",
      status: iStatut >= 0 ? STATUSES[c[iStatut]?.toLowerCase()] || "pending" : "pending",
      activitiesCount: iAct >= 0 ? parseInt(c[iAct]) || 0 : 0,
      tshirt: iTshirt >= 0 ? /^(oui|yes|1|true)$/i.test(c[iTshirt] || "") : false,
    };
  });
  return { headers, rows };
}

export default function MemberImport({ onClose, onDone }) {
  const [rows, setRows] = useState(null);
  const [busy, setBusy] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");

  const readFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const { rows } = parseCsv(String(reader.result || ""));
      setRows(rows);
      setReport(null);
      setError("");
    };
    reader.readAsText(file, "utf-8");
  };

  const run = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await membersBulk({ type: "import", rows });
      setReport(res);
      onDone?.();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const valid = (rows || []).filter((r) => r.firstName && r.lastName && r.phone);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Importer des membres (CSV)</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        {!report && (
          <>
            <p className="text-sm text-gray-500">
              Colonnes : <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">nom, prénom, téléphone, email, commune, statut, activités, tshirt</code>.
              Les téléphones déjà enregistrés sont ignorés.
            </p>
            <div className="mt-4">
              <label className={labelCls}>Fichier CSV</label>
              <input type="file" accept=".csv,text/csv" onChange={(e) => readFile(e.target.files?.[0])}
                className="w-full text-sm file:mr-4 file:rounded-full file:border-0 file:bg-[rgba(13,110,187,0.1)] file:px-4 file:py-2 file:font-semibold file:text-[#0D6EBB]" />
            </div>
          </>
        )}

        {rows && !report && (
          <>
            <p className="mt-4 text-sm font-semibold text-gray-800">
              Aperçu : {rows.length} ligne(s) — {valid.length} valide(s)
            </p>
            <div className="mt-2 max-h-72 overflow-auto rounded-xl border border-gray-200">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>{["Nom", "Prénom", "Téléphone", "Email", "Commune", "Statut", "Activ.", "T-shirt"].map((h) => (
                    <th key={h} className="px-3 py-2 text-left font-semibold text-gray-600">{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {rows.slice(0, 100).map((r, i) => (
                    <tr key={i} className={!r.firstName || !r.lastName || !r.phone ? "bg-red-50" : ""}>
                      {[r.lastName, r.firstName, r.phone, r.email, r.commune,
                        r.status === "active" ? "Actif" : r.status === "inactive" ? "Inactif" : "En cours",
                        r.activitiesCount, r.tshirt ? "Oui" : "Non"].map((v, j) => (
                          <td key={j} className="px-3 py-1.5 border-t border-gray-100">{v || "—"}</td>
                        ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {rows.length > 100 && <p className="text-xs text-gray-400 mt-1">… et {rows.length - 100} autres lignes</p>}
          </>
        )}

        {report && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3 text-center">
              {[["Créés", report.created, "text-emerald-600"], ["Ignorés (doublons)", report.skipped, "text-amber-600"], ["Erreurs", report.errors.length, "text-red-500"]].map(([l, n, c]) => (
                <div key={l} className="rounded-xl border border-gray-200 p-4">
                  <p className={`text-3xl font-extrabold ${c}`}>{n}</p>
                  <p className="text-xs text-gray-500 mt-1">{l}</p>
                </div>
              ))}
            </div>
            {report.errors.length > 0 && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 max-h-48 overflow-auto">
                {report.errors.map((e, i) => <p key={i} className="text-xs text-red-700">Ligne {e.line} : {e.error}</p>)}
              </div>
            )}
          </div>
        )}

        {error && <p className="mt-3 text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2">{error}</p>}

        <div className="mt-5 flex gap-3">
          {!report ? (
            <button onClick={run} disabled={busy || !valid.length} className={`flex-1 ${btnPrimary}`}>
              {busy ? "Import en cours…" : `Importer ${valid.length} membre(s)`}
            </button>
          ) : (
            <button onClick={onClose} className={`flex-1 ${btnPrimary}`}>Terminer</button>
          )}
          <button onClick={onClose} className="px-5 py-2.5 border border-gray-200 rounded-xl text-gray-600 text-sm hover:bg-gray-50">
            Annuler
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
