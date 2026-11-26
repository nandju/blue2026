"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
	getAdminRecruitments, createRecruitment, updateRecruitment, deleteRecruitment,
	duplicateRecruitment, closeRecruitment, reopenRecruitment,
} from "@/lib/store";
import { STATUSES, starterFields, slugify } from "@/lib/recruitmentModel";
import RecruitmentList from "@/components/admin/recruitment/RecruitmentList";
import RecruitmentEditor from "@/components/admin/recruitment/RecruitmentEditor";
import SubmissionsPanel from "@/components/admin/recruitment/SubmissionsPanel";
import { btnPrimary, btnSecondary } from "@/components/admin/ui";

export default function AdminRecruitmentPage() {
	const [view, setView] = useState("list"); // list | edit | submissions
	const [items, setItems] = useState(null);
	const [currentId, setCurrentId] = useState(null);
	const [error, setError] = useState("");
	const [notice, setNotice] = useState("");

	const load = useCallback(() => {
		getAdminRecruitments().then(setItems).catch((e) => setError(e.message));
	}, []);
	useEffect(load, [load]);

	const current = useMemo(() => (items || []).find((r) => r.id === currentId) || null, [items, currentId]);
	const counts = useMemo(() => {
		const list = items || [];
		return {
			open: list.filter((r) => r.status === "open").length,
			drafts: list.filter((r) => r.status === "draft").length,
			submissions: list.reduce((s, r) => s + (r.submissionCount || 0), 0),
		};
	}, [items]);

	const flash = (msg) => { setNotice(msg); setTimeout(() => setNotice(""), 5000); };

	const handleCreate = async () => {
		setError("");
		try {
			const rec = await createRecruitment({
				title: "Nouveau recrutement",
				slug: slugify(`recrutement-${Date.now()}`),
				type: "Bénévolat",
				summary: "",
				description: "",
				fields: starterFields(),
				buttons: [],
			});
			await load();
			setCurrentId(rec.id);
			setView("edit");
		} catch (e) {
			setError(e.message);
		}
	};

	const patch = async (id, p, msg) => {
		setError("");
		try {
			await updateRecruitment(id, p);
			await load();
			if (msg) flash(msg);
		} catch (e) {
			setError(e.message);
		}
	};

	const handleDelete = async (r) => {
		const n = r.submissionCount || 0;
		const warn = n > 0 ? ` Attention : ${n} candidature(s) seront aussi supprimées.` : "";
		if (!window.confirm(`Supprimer « ${r.title} » ?${warn} Cette action est définitive.`)) return;
		setError("");
		try {
			await deleteRecruitment(r.id);
			if (currentId === r.id) { setCurrentId(null); setView("list"); }
			await load();
		} catch (e) {
			setError(e.message);
		}
	};

	const handleDuplicate = async (r) => {
		setError("");
		try {
			await duplicateRecruitment(r.id);
			await load();
			flash("Recrutement dupliqué en brouillon (sans les candidatures).");
		} catch (e) {
			setError(e.message);
		}
	};

	const handleClose = async (r) => {
		if (!window.confirm(`Fermer les candidatures de « ${r.title} » maintenant ?`)) return;
		try { await closeRecruitment(r.id); await load(); flash("Candidatures clôturées."); }
		catch (e) { setError(e.message); }
	};

	const handleReopen = async (r) => {
		const v = window.prompt("Nouvelle date de clôture (AAAA-MM-JJ HH:mm, heure d'Abidjan) :", "");
		if (!v) return;
		const iso = v.includes("T") ? v : v.replace(" ", "T");
		try { await reopenRecruitment(r.id, `${iso}:00Z`); await load(); flash("Candidatures rouvertes."); }
		catch (e) { setError(e.message); }
	};

	return (
		<div className="p-4 md:p-8 max-w-7xl mx-auto">
			{/* En-tête */}
			<div className="flex flex-wrap items-start justify-between gap-4 mb-6">
				<div>
					<h1 className="text-2xl font-bold text-[#073A63]">Recrutement</h1>
					<p className="text-sm text-gray-500 mt-1">
						{view === "list" && `${counts.open} ouvert(s) · ${counts.drafts} brouillon(s) · ${counts.submissions} candidature(s)`}
						{view === "edit" && current && `Édition : ${current.title}`}
						{view === "submissions" && current && `Candidatures : ${current.title}`}
					</p>
				</div>
				{view === "list" ? (
					<button onClick={handleCreate} className={btnPrimary}>+ Nouveau recrutement</button>
				) : (
					<button onClick={() => setView("list")} className={btnSecondary}>← Retour à la liste</button>
				)}
			</div>

			{error && <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">{error}</p>}
			{notice && <p className="mb-4 text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2.5">{notice}</p>}

			{items === null ? (
				<p className="text-sm text-gray-400">Chargement…</p>
			) : view === "list" ? (
				<RecruitmentList
					items={items}
					onEdit={(r) => { setCurrentId(r.id); setView("edit"); }}
					onSubmissions={(r) => { setCurrentId(r.id); setView("submissions"); }}
					onDelete={handleDelete}
					onDuplicate={handleDuplicate}
					onClose={handleClose}
					onReopen={handleReopen}
					onPatch={patch}
				/>
			) : view === "edit" && current ? (
				<RecruitmentEditor
					key={current.id}
					form={current}
					onSaved={async () => { await load(); flash("Enregistré."); }}
					onError={setError}
					onSubmissions={() => setView("submissions")}
				/>
			) : view === "submissions" && current ? (
				<SubmissionsPanel form={current} onError={setError} />
			) : null}
		</div>
	);
}
