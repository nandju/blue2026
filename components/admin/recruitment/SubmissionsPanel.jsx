"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
	getSubmissions, getSubmission, updateSubmission, deleteSubmission,
	bulkSubmissionStatus, submissionsExportUrl,
} from "@/lib/store";
import { SUBMISSION_STATUSES, SUBMISSION_STATUS_KEYS, toMemberDraft, DISPLAY_ONLY_TYPES } from "@/lib/recruitmentModel";
import { inputCls, labelCls, btnPrimary, btnSecondary, btnGhost, cardCls, formatDateTime } from "@/components/admin/ui";

const STATUS_COLORS = {
	new: "#0D6EBB", reviewed: "#8b5cf6", shortlisted: "#f59e0b", accepted: "#059669", rejected: "#dc2626",
};

const answerText = (v) => {
	if (v == null) return "—";
	if (Array.isArray(v)) return v.join(", ");
	if (typeof v === "boolean") return v ? "Oui" : "Non";
	if (typeof v === "object") return v.name || "—";
	return String(v);
};

function DetailPanel({ sid, form, onClose, onChanged, onError }) {
	const [data, setData] = useState(null);
	const [note, setNote] = useState("");

	useEffect(() => {
		getSubmission(sid).then((d) => { setData(d); setNote(d.submission.note || ""); }).catch((e) => onError(e.message));
	}, [sid]); // eslint-disable-line react-hooks/exhaustive-deps

	if (!data) return <div className={cardCls + " p-6 text-sm text-gray-400"}>Chargement…</div>;
	const { submission: s, fields } = data;
	const answerable = (fields || []).filter((f) => !DISPLAY_ONLY_TYPES.has(f.type));
	const draft = toMemberDraft(s, form);

	return (
		<div className={cardCls + " p-6 space-y-5"}>
			<div className="flex items-start justify-between gap-3">
				<div>
					<h3 className="font-bold text-[#073A63]">Candidature du {formatDateTime(s.createdAt)}</h3>
					<p className="text-xs text-gray-400 mt-0.5">{s.email || "—"} {s.phone ? `· ${s.phone}` : ""}</p>
				</div>
				<button onClick={onClose} className={btnGhost}>Fermer ✕</button>
			</div>

			{/* Réponses avec leurs libellés (même les champs supprimés depuis) */}
			<div className="space-y-3">
				{answerable.map((f) => {
					const v = s.answers?.[f.id];
					const isFile = f.type === "file" && v?.storagePath;
					return (
						<div key={f.id} className="grid grid-cols-[180px_1fr] gap-2 text-sm">
							<span className="text-gray-500 font-medium">{f.label}</span>
							<span className="text-gray-800">
								{isFile ? (
									<a href={`/api/admin/recruitment/files/${v.storagePath}`} target="_blank" rel="noopener noreferrer"
										className="text-[#0D6EBB] underline hover:text-[#0DBD9F]">📎 {v.name}</a>
								) : answerText(v)}
							</span>
						</div>
					);
				})}
				{/* Réponses orphelines (champ supprimé depuis) */}
				{Object.entries(s.answers || {})
					.filter(([id]) => !answerable.some((f) => f.id === id))
					.map(([id, v]) => (
						<div key={id} className="grid grid-cols-[180px_1fr] gap-2 text-sm opacity-60">
							<span className="text-gray-500 font-medium italic">(champ supprimé)</span>
							<span className="text-gray-800">{answerText(v)}</span>
						</div>
					))}
			</div>

			{/* Statut + note */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
				<div>
					<label className={labelCls}>Statut</label>
					<select className={inputCls} value={s.status}
						onChange={async (e) => { try { await updateSubmission(sid, { status: e.target.value }); onChanged(); } catch (err) { onError(err.message); } }}>
						{SUBMISSION_STATUS_KEYS.map((k) => <option key={k} value={k}>{SUBMISSION_STATUSES[k]}</option>)}
					</select>
				</div>
				<div>
					<label className={labelCls}>Note interne</label>
					<div className="flex gap-2">
						<input className={inputCls} value={note} onChange={(e) => setNote(e.target.value)} />
						<button className={btnSecondary + " !px-3"}
							onClick={async () => { try { await updateSubmission(sid, { note }); onChanged(); } catch (err) { onError(err.message); } }}>OK</button>
					</div>
				</div>
			</div>

			{/* Historique des statuts */}
			{(s.history || []).length > 0 && (
				<div>
					<p className={labelCls}>Historique</p>
					<ul className="text-xs text-gray-500 space-y-1">
						{s.history.map((h, i) => (
							<li key={i}>
								{h.from ? `${SUBMISSION_STATUSES[h.from] || h.from} → ` : ""}{SUBMISSION_STATUSES[h.status] || h.status}
								{" — "}{formatDateTime(h.at)}{h.by ? ` · ${h.by}` : ""}
							</li>
						))}
					</ul>
				</div>
			)}

			{/* Convertir en membre — phase 5 */}
			<div className="pt-3 border-t border-gray-100 flex items-center gap-3">
				<button
					disabled
					title={JSON.stringify(draft, null, 2)}
					className={btnSecondary + " opacity-60 cursor-not-allowed"}>
					👥 Convertir en membre BLUE
				</button>
				<span className="text-xs text-gray-400">Disponible en phase 5</span>
			</div>

			<button
				onClick={async () => {
					if (!window.confirm("Supprimer définitivement cette candidature ?")) return;
					try { await deleteSubmission(sid); onChanged(); onClose(); } catch (err) { onError(err.message); }
				}}
				className={btnGhost + " !text-red-500"}>
				Supprimer la candidature
			</button>
		</div>
	);
}

export default function SubmissionsPanel({ form, onError }) {
	const [filters, setFilters] = useState({ status: "", q: "", sort: "newest", page: 1 });
	const [data, setData] = useState(null);
	const [selected, setSelected] = useState(new Set());
	const [detailId, setDetailId] = useState(null);
	const [bulkStatus, setBulkStatus] = useState("reviewed");

	const columns = useMemo(
		() => (form.fields || []).filter((f) => f.showInTable && !DISPLAY_ONLY_TYPES.has(f.type) && f.type !== "file"),
		[form]
	);

	const load = useCallback(() => {
		getSubmissions(form.id, filters).then(setData).catch((e) => onError(e.message));
	}, [form.id, filters]); // eslint-disable-line react-hooks/exhaustive-deps
	useEffect(load, [load]);

	const items = data?.items || [];
	const totalPages = Math.max(1, Math.ceil((data?.total || 0) / (data?.pageSize || 20)));

	const toggle = (id) => setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
	const toggleAll = () => setSelected((s) => (s.size === items.length ? new Set() : new Set(items.map((i) => i.id))));

	const applyBulk = async () => {
		if (!selected.size) return;
		try {
			await bulkSubmissionStatus(form.id, [...selected], bulkStatus);
			setSelected(new Set());
			load();
		} catch (e) { onError(e.message); }
	};

	return (
		<div className="space-y-5">
			{/* Filtres */}
			<div className={cardCls + " p-4 flex flex-wrap items-center gap-3"}>
				<input className={inputCls + " !w-56"} placeholder="Rechercher dans les réponses…"
					value={filters.q} onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value, page: 1 }))} />
				<select className={inputCls + " !w-44"} value={filters.status}
					onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value, page: 1 }))}>
					<option value="">Tous les statuts</option>
					{SUBMISSION_STATUS_KEYS.map((k) => <option key={k} value={k}>{SUBMISSION_STATUSES[k]}</option>)}
				</select>
				<select className={inputCls + " !w-40"} value={filters.sort}
					onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value }))}>
					<option value="newest">Plus récentes</option>
					<option value="oldest">Plus anciennes</option>
				</select>
				<span className="text-xs text-gray-400 ml-auto">{data?.total ?? 0} candidature(s)</span>
				<a href={submissionsExportUrl(form.id, filters)} className={btnSecondary + " text-xs"}>⬇ Export CSV</a>
			</div>

			{/* Actions groupées */}
			{selected.size > 0 && (
				<div className="flex items-center gap-3 bg-[#0D6EBB]/5 border border-[#0D6EBB]/15 rounded-xl px-4 py-2.5">
					<span className="text-sm font-medium text-[#0D6EBB]">{selected.size} sélectionnée(s)</span>
					<select className={inputCls + " !w-44"} value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value)}>
						{SUBMISSION_STATUS_KEYS.map((k) => <option key={k} value={k}>{SUBMISSION_STATUSES[k]}</option>)}
					</select>
					<button onClick={applyBulk} className={btnPrimary + " !py-1.5 text-xs"}>Appliquer le statut</button>
					<button onClick={() => setSelected(new Set())} className={btnGhost}>Annuler</button>
				</div>
			)}

			{detailId && (
				<DetailPanel sid={detailId} form={form} onClose={() => setDetailId(null)} onChanged={load} onError={onError} />
			)}

			{/* Tableau */}
			<div className={cardCls + " overflow-x-auto"}>
				{items.length === 0 ? (
					<p className="p-10 text-center text-sm text-gray-400">Aucune candidature pour l&rsquo;instant.</p>
				) : (
					<table className="w-full text-sm">
						<thead>
							<tr className="text-left text-xs text-gray-400 border-b border-gray-100">
								<th className="p-3 w-8"><input type="checkbox" className="w-4 h-4 accent-[#0D6EBB]" checked={selected.size === items.length && items.length > 0} onChange={toggleAll} /></th>
								{columns.map((f) => <th key={f.id} className="p-3 font-semibold">{f.label}</th>)}
								<th className="p-3 font-semibold">Date</th>
								<th className="p-3 font-semibold">Statut</th>
								<th className="p-3" />
							</tr>
						</thead>
						<tbody>
							{items.map((s) => (
								<tr key={s.id} className="border-b border-gray-50 hover:bg-[#0D6EBB]/[0.03] cursor-pointer" onClick={() => setDetailId(s.id)}>
									<td className="p-3" onClick={(e) => e.stopPropagation()}>
										<input type="checkbox" className="w-4 h-4 accent-[#0D6EBB]" checked={selected.has(s.id)} onChange={() => toggle(s.id)} />
									</td>
									{columns.map((f) => (
										<td key={f.id} className="p-3 max-w-[200px] truncate text-gray-700" title={answerText(s.answers?.[f.id])}>
											{answerText(s.answers?.[f.id])}
										</td>
									))}
									<td className="p-3 text-xs text-gray-500 whitespace-nowrap">{formatDateTime(s.createdAt)}</td>
									<td className="p-3">
										<span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold"
											style={{ backgroundColor: `${STATUS_COLORS[s.status] || "#6b7280"}1a`, color: STATUS_COLORS[s.status] || "#6b7280" }}>
											{SUBMISSION_STATUSES[s.status] || s.status}
										</span>
									</td>
									<td className="p-3 text-xs text-[#0D6EBB] font-medium">Détails →</td>
								</tr>
							))}
						</tbody>
					</table>
				)}
			</div>

			{/* Pagination */}
			{totalPages > 1 && (
				<div className="flex items-center justify-center gap-2">
					<button disabled={filters.page <= 1} onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))} className={btnSecondary + " !px-3 !py-1 text-xs"}>←</button>
					<span className="text-xs text-gray-500">{filters.page} / {totalPages}</span>
					<button disabled={filters.page >= totalPages} onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))} className={btnSecondary + " !px-3 !py-1 text-xs"}>→</button>
				</div>
			)}
		</div>
	);
}
