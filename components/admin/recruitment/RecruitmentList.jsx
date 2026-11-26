"use client";
import { useMemo, useState } from "react";
import { STATUSES, fmtDateTime, fmtDate } from "@/lib/recruitmentModel";
import { btnSecondary, btnGhost, cardCls } from "@/components/admin/ui";

export function StatusBadge({ status }) {
	const s = STATUSES[status] || STATUSES.draft;
	return (
		<span
			className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
			style={{ backgroundColor: `${s.color}1a`, color: s.color }}>
			<span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.color }} />
			{s.label}
		</span>
	);
}

/** Chronologie simple : barres de période apparition / candidatures. */
function Timeline({ items }) {
	const rows = items.filter((r) => r.visibleFrom || r.visibleUntil || r.applyFrom || r.applyUntil);
	if (!rows.length) return null;

	const all = [];
	for (const r of rows) {
		for (const k of ["visibleFrom", "visibleUntil", "applyFrom", "applyUntil"]) {
			const d = r[k] ? new Date(r[k]).getTime() : null;
			if (d) all.push(d);
		}
	}
	if (!all.length) return null;
	const now = Date.now();
	const min = Math.min(...all, now) - 86400000;
	const max = Math.max(...all, now) + 86400000;
	const pct = (t) => `${Math.max(0, Math.min(100, ((t - min) / (max - min)) * 100))}%`;

	return (
		<div className={cardCls + " p-5 mb-6"}>
			<h3 className="text-sm font-semibold text-[#073A63] mb-4">Chronologie</h3>
			<div className="space-y-3">
				{rows.map((r) => {
					const vF = r.visibleFrom ? new Date(r.visibleFrom).getTime() : min;
					const vU = r.visibleUntil ? new Date(r.visibleUntil).getTime() : max;
					const aF = r.applyFrom ? new Date(r.applyFrom).getTime() : null;
					const aU = r.applyUntil ? new Date(r.applyUntil).getTime() : null;
					return (
						<div key={r.id} className="flex items-center gap-3">
							<span className="w-40 truncate text-xs text-gray-600" title={r.title}>{r.title}</span>
							<div className="flex-1 relative h-8">
								{/* Période d'apparition */}
								<div
									className="absolute top-1 h-2.5 rounded-full bg-[#0D6EBB]/20"
									style={{ left: pct(vF), width: `calc(${pct(vU)} - ${pct(vF)})` }}
									title={`Visible : ${fmtDateTime(r.visibleFrom)} → ${fmtDateTime(r.visibleUntil)}`}
								/>
								{/* Période de candidature */}
								{aF != null && (
									<div
										className="absolute top-4 h-2.5 rounded-full bg-[#0DBD9F]/50"
										style={{ left: pct(aF), width: `calc(${pct(aU ?? max)} - ${pct(aF)})` }}
										title={`Candidatures : ${fmtDateTime(r.applyFrom)} → ${fmtDateTime(r.applyUntil)}`}
									/>
								)}
								{/* Maintenant */}
								<div className="absolute top-0 bottom-0 w-px bg-red-400" style={{ left: pct(now) }} />
							</div>
						</div>
					);
				})}
			</div>
			<div className="mt-3 flex items-center gap-5 text-[11px] text-gray-500">
				<span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded bg-[#0D6EBB]/20 inline-block" /> Apparition sur le site</span>
				<span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded bg-[#0DBD9F]/50 inline-block" /> Candidatures</span>
				<span className="flex items-center gap-1.5"><span className="w-px h-3 bg-red-400 inline-block" /> Aujourd&rsquo;hui</span>
			</div>
		</div>
	);
}

export default function RecruitmentList({ items, onEdit, onSubmissions, onDelete, onDuplicate, onClose, onReopen, onPatch }) {
	const [view, setView] = useState("cards");

	return (
		<div>
			{/* Toggle liste / chronologie */}
			<div className="flex items-center gap-2 mb-5">
				<button
					onClick={() => setView("cards")}
					className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${view === "cards" ? "bg-[#0D6EBB] text-white" : "text-[#0D6EBB] border border-[#0D6EBB]/25"}`}>
					Fiches
				</button>
				<button
					onClick={() => setView("timeline")}
					className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${view === "timeline" ? "bg-[#0D6EBB] text-white" : "text-[#0D6EBB] border border-[#0D6EBB]/25"}`}>
					Chronologie
				</button>
			</div>

			{view === "timeline" && <Timeline items={items} />}

			{items.length === 0 ? (
				<div className={cardCls + " p-12 text-center"}>
					<p className="text-4xl mb-4">📣</p>
					<p className="text-gray-500 text-sm">Aucun recrutement pour l&rsquo;instant. Créez le premier avec « + Nouveau recrutement ».</p>
				</div>
			) : (
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
					{items.map((r) => (
						<div key={r.id} className={cardCls + " p-5 flex flex-col gap-4"}>
							<div className="flex items-start justify-between gap-3">
								<div className="min-w-0">
									<div className="flex items-center gap-2 flex-wrap">
										<StatusBadge status={r.status} />
										<span className="text-[11px] font-semibold uppercase tracking-wider text-[#0DBD9F]">{r.typeOther || r.type}</span>
										{r.featured && <span className="text-[11px] font-semibold text-amber-500">★ À la une</span>}
									</div>
									<h3 className="mt-2 font-bold text-[#073A63] truncate" title={r.title}>{r.title}</h3>
									<p className="text-xs text-gray-400">/recrutement/{r.slug}</p>
								</div>
								<button
									onClick={() => onSubmissions(r)}
									className="shrink-0 text-center px-3 py-1.5 rounded-xl bg-[#0D6EBB]/5 hover:bg-[#0D6EBB]/10 transition-colors"
									title="Voir les candidatures">
									<span className="block text-lg font-bold text-[#0D6EBB]">{r.submissionCount || 0}</span>
									<span className="block text-[10px] text-gray-500">candidature(s)</span>
								</button>
							</div>

							{/* Périodes */}
							<div className="grid grid-cols-2 gap-2 text-[11px] text-gray-500">
								<span className="bg-gray-50 rounded-lg px-2.5 py-1.5">
									Apparition : {fmtDateTime(r.visibleFrom)} → {fmtDateTime(r.visibleUntil)}
								</span>
								<span className="bg-gray-50 rounded-lg px-2.5 py-1.5">
									Candidatures : {fmtDateTime(r.applyFrom)} → {fmtDateTime(r.applyUntil)}
								</span>
							</div>

							{/* Actions */}
							<div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-gray-100">
								<button onClick={() => onEdit(r)} className={btnSecondary + " !px-3 !py-1.5 text-xs"}>Modifier</button>
								<button onClick={() => onSubmissions(r)} className={btnSecondary + " !px-3 !py-1.5 text-xs"}>Candidatures</button>
								{r.published ? (
									<button onClick={() => onPatch(r.id, { published: false }, "« " + r.title + " » repassé en brouillon.")}
										className={btnGhost}>Repasser en brouillon</button>
								) : (
									<button onClick={() => onPatch(r.id, { published: true }, "« " + r.title + " » publié.")}
										className={btnGhost + " !text-emerald-600"}>Publier</button>
								)}
								{r.published && !r.hidden && (
									<button onClick={() => onPatch(r.id, { hidden: true }, "« " + r.title + " » masqué immédiatement.")}
										className={btnGhost + " !text-amber-600"}>Masquer</button>
								)}
								{r.hidden && (
									<button onClick={() => onPatch(r.id, { hidden: false }, "« " + r.title + " » affiché à nouveau.")}
										className={btnGhost + " !text-emerald-600"}>Afficher</button>
								)}
								{r.status === "open" && (
									<button onClick={() => onClose(r)} className={btnGhost + " !text-red-500"}>Fermer les candidatures</button>
								)}
								{r.status === "closed" && (
									<button onClick={() => onReopen(r)} className={btnGhost + " !text-emerald-600"}>Rouvrir</button>
								)}
								<button onClick={() => onDuplicate(r)} className={btnGhost}>Dupliquer</button>
								<button onClick={() => onDelete(r)} className={btnGhost + " !text-red-500"}>Supprimer</button>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
