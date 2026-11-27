"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { updateCourse, addCourse, courseAiAction } from "@/lib/store";
import { publishBlockers } from "@/lib/courseRules";
import MediaPicker from "@/components/admin/MediaPicker";
import MoveButtons, { moveItem } from "@/components/admin/MoveButtons";
import { inputCls, labelCls, btnPrimary, btnSecondary, btnDanger, btnGhost } from "@/components/admin/ui";

const TABS = [
	{ id: "infos", label: "Informations" },
	{ id: "modules", label: "Modules" },
	{ id: "quiz", label: "Quiz" },
	{ id: "ressources", label: "Ressources" },
];

const emptySection = () => ({ title: "", summary: "", content: "", keyPoints: [] });
const emptyQuestion = () => ({ question: "", options: ["", "", "", ""], answer: 0, explanation: "" });
const slug = () => `formation-${Date.now().toString(36)}`;

// Éditeur de formation : onglets structurés (remplace les zones
// « Titre|Contenu »), publication contrôlée, outils IA si un PDF source est
// associé. Renvoie onSaved(course) après écriture.
export default function CourseEditor({ course, isNew, onSaved, onClose }) {
	const [form, setForm] = useState(() => ({
		id: isNew ? slug() : course.id,
		title: "", description: "", category: "environnement", level: "Débutant",
		duration: "", video: "", cover: "", sections: [], resources: [], quiz: [],
		objectives: [], glossary: [], price_fcfa: 0, status: "draft",
		pass_threshold: 80, quiz_duration_min: 20, source_pdf: null,
		enrolled: 0, ...course,
	}));
	const [tab, setTab] = useState("infos");
	const [dirty, setDirty] = useState(false);
	const [saving, setSaving] = useState(false);
	const [publishing, setPublishing] = useState(false);
	const [error, setError] = useState("");
	const [notice, setNotice] = useState("");
	const [aiBusy, setAiBusy] = useState(null); // "section:i" | "quiz" | "questions"
	const [aiPreview, setAiPreview] = useState(null); // { kind, index?, data, provider, model }
	const formRef = useRef(form);
	formRef.current = form;

	const set = (patch) => { setForm((f) => ({ ...f, ...patch })); setDirty(true); setNotice(""); };
	const hasAi = Boolean(form.source_pdf?.url);
	const blockers = publishBlockers(form);
	const wasPublished = !isNew && course.status === "published";

	// Avertissement « modifications non enregistrées ».
	useEffect(() => {
		const onUnload = (e) => { if (dirty) { e.preventDefault(); e.returnValue = ""; } };
		window.addEventListener("beforeunload", onUnload);
		return () => window.removeEventListener("beforeunload", onUnload);
	}, [dirty]);

	const tryClose = () => {
		if (dirty && !confirm("Des modifications ne sont pas enregistrées. Quitter quand même ?")) return;
		onClose();
	};

	const save = async (nextStatus) => {
		setSaving(true); setError("");
		try {
			const payload = { ...form };
			if (nextStatus) payload.status = nextStatus;
			// Quiz modifié sur une formation publiée avec inscrits : avertissement.
			if (!isNew && wasPublished && (form.enrolled || 0) > 0 &&
				JSON.stringify(payload.quiz) !== JSON.stringify(course.quiz)) {
				if (!confirm(`Cette formation publiée compte ${form.enrolled} inscrit(s). Modifier le quiz peut perturber les parcours en cours. Continuer ?`)) {
					setSaving(false); return null;
				}
			}
			const saved = isNew ? await addCourse(payload) : await updateCourse(form.id, payload);
			setForm((f) => ({ ...f, ...saved }));
			setDirty(false);
			setNotice("Enregistré.");
			onSaved?.(saved);
			return saved;
		} catch (e) {
			setError(e.message);
			return null;
		} finally {
			setSaving(false);
		}
	};

	const publish = async () => {
		setPublishing(true);
		const saved = await save("published");
		setPublishing(false);
		if (saved) setNotice("Formation publiée.");
	};

	const unpublish = async () => {
		if (!confirm("Dépublier cette formation ? Elle disparaîtra du catalogue public (les données sont conservées).")) return;
		setPublishing(true);
		await save("draft");
		setPublishing(false);
	};

	const runAi = async (action, index, label) => {
		setAiBusy(action === "section" ? `section:${index}` : action);
		setError("");
		try {
			const res = await courseAiAction(form.id, { action, index, count: action === "questions" ? 5 : undefined });
			setAiPreview({ kind: action, index, data: res.result, provider: res.provider, model: res.model, label });
		} catch (e) {
			setError(e.message);
		} finally {
			setAiBusy(null);
		}
	};

	const applyAiPreview = () => {
		const p = aiPreview;
		if (!p) return;
		if (p.kind === "section") {
			const sections = [...form.sections];
			sections[p.index] = p.data;
			set({ sections });
		} else if (p.kind === "quiz") {
			set({ quiz: p.data });
		} else if (p.kind === "questions") {
			set({ quiz: [...form.quiz, ...p.data] });
		}
		setAiPreview(null);
	};

	const updSection = (i, patch) => set({ sections: form.sections.map((s, j) => (j === i ? { ...s, ...patch } : s)) });
	const updQuestion = (i, patch) => set({ quiz: form.quiz.map((q, j) => (j === i ? { ...q, ...patch } : q)) });
	const updObjective = (i, v) => set({ objectives: form.objectives.map((o, j) => (j === i ? v : o)) });
	const updGlossary = (i, patch) => set({ glossary: form.glossary.map((g, j) => (j === i ? { ...g, ...patch } : g)) });
	const updResource = (i, patch) => set({ resources: form.resources.map((r, j) => (j === i ? { ...r, ...patch } : r)) });

	return (
		<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
			className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4">
			<motion.div initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }}
				className="bg-[#f6f8fb] rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col" role="dialog" aria-modal="true">
				{/* En-tête */}
				<div className="flex items-center justify-between px-6 pt-5 pb-3">
					<div>
						<h3 className="text-lg font-bold text-gray-900">
							{isNew ? "Nouvelle formation" : `Modifier — ${course.title}`}
						</h3>
						<p className="text-xs text-gray-500 mt-0.5">
							Statut : <span className={`font-semibold ${form.status === "published" ? "text-[#0DBD9F]" : "text-amber-600"}`}>{form.status === "published" ? "Publié" : "Brouillon"}</span>
							{form.ai_provider ? ` · Générée par ${form.ai_provider} (${form.ai_model})` : ""}
							{dirty ? " · modifications non enregistrées" : ""}
						</p>
					</div>
					<button onClick={tryClose} className="text-gray-400 hover:text-gray-600 text-xl" aria-label="Fermer">✕</button>
				</div>

				{/* Onglets */}
				<div className="flex gap-1 px-6 border-b border-[rgba(13,110,187,0.1)]" role="tablist">
					{TABS.map((t) => (
						<button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}
							className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${tab === t.id ? "bg-white text-[#0D6EBB] border border-b-0 border-[rgba(13,110,187,0.15)]" : "text-gray-500 hover:text-gray-700"}`}>
							{t.label}
							{t.id === "modules" ? ` (${form.sections.length})` : t.id === "quiz" ? ` (${form.quiz.length})` : ""}
						</button>
					))}
				</div>

				{/* Corps */}
				<div className="flex-1 overflow-y-auto px-6 py-5">
					{tab === "infos" && (
						<div className="space-y-4 bg-white rounded-xl border border-[rgba(13,110,187,0.12)] p-5">
							<div>
								<label className={labelCls}>Titre</label>
								<input value={form.title} onChange={(e) => set({ title: e.target.value })} className={inputCls} />
							</div>
							<div>
								<label className={labelCls}>Description</label>
								<textarea value={form.description} onChange={(e) => set({ description: e.target.value })} rows={3} className={`${inputCls} resize-y`} />
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className={labelCls}>Catégorie</label>
									<select value={form.category} onChange={(e) => set({ category: e.target.value })} className={inputCls}>
										<option value="environnement">Environnement</option>
										<option value="formation">Formation</option>
									</select>
								</div>
								<div>
									<label className={labelCls}>Niveau</label>
									<select value={form.level} onChange={(e) => set({ level: e.target.value })} className={inputCls}>
										<option>Débutant</option><option>Intermédiaire</option><option>Avancé</option>
									</select>
								</div>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className={labelCls}>Durée (ex : 2h)</label>
									<input value={form.duration} onChange={(e) => set({ duration: e.target.value })} className={inputCls} />
								</div>
								<div>
									<label className={labelCls}>Vidéo (URL YouTube embed)</label>
									<input value={form.video || ""} onChange={(e) => set({ video: e.target.value })} className={inputCls} />
								</div>
							</div>
							<div>
								<MediaPicker type="image" folder="formations" label="Image de couverture"
									value={form.cover ?? ""} onChange={(v) => set({ cover: v || "" })} />
							</div>
							<div className="grid grid-cols-3 gap-4">
								<div>
									<label className={labelCls}>Prix non-membre (FCFA)</label>
									<input type="number" min="0" step="500" value={form.price_fcfa ?? 0}
										onChange={(e) => set({ price_fcfa: Number(e.target.value) || 0 })} className={inputCls} />
									<p className="text-[11px] text-gray-400 mt-1">0 = gratuite pour tout le monde. Gratuite pour les membres actifs dans tous les cas.</p>
								</div>
								<div>
									<label className={labelCls}>Seuil de réussite (%)</label>
									<input type="number" min="1" max="100" value={form.pass_threshold ?? 80}
										onChange={(e) => set({ pass_threshold: Number(e.target.value) || 80 })} className={inputCls} />
								</div>
								<div>
									<label className={labelCls}>Durée du quiz (min)</label>
									<input type="number" min="1" max="180" value={form.quiz_duration_min ?? 20}
										onChange={(e) => set({ quiz_duration_min: Number(e.target.value) || 20 })} className={inputCls} />
								</div>
							</div>
							<div>
								<div className="flex items-center justify-between mb-1">
									<label className={`${labelCls} mb-0`}>Objectifs d&apos;apprentissage</label>
									<button type="button" className={btnGhost} onClick={() => set({ objectives: [...form.objectives, ""] })}>+ Ajouter</button>
								</div>
								<div className="space-y-2">
									{form.objectives.map((o, i) => (
										<div key={i} className="flex gap-2">
											<input value={o} onChange={(e) => updObjective(i, e.target.value)} className={inputCls} placeholder={`Objectif ${i + 1}`} />
											<button type="button" className={btnDanger} onClick={() => set({ objectives: form.objectives.filter((_, j) => j !== i) })}>✕</button>
										</div>
									))}
									{!form.objectives.length && <p className="text-xs text-gray-400">Aucun objectif — affiché sur la page de la formation.</p>}
								</div>
							</div>
						</div>
					)}

					{tab === "modules" && (
						<div className="space-y-4">
							{form.sections.map((s, i) => (
								<div key={i} className="bg-white rounded-xl border border-[rgba(13,110,187,0.12)] p-5">
									<div className="flex items-start gap-3">
										<MoveButtons index={i} length={form.sections.length} label="le module"
											onMove={(a, b) => set({ sections: moveItem(form.sections, a, b) })} />
										<div className="flex-1 space-y-3">
											<div className="flex items-center gap-2">
												<span className="text-xs font-bold text-[#0D6EBB] bg-[rgba(13,110,187,0.08)] rounded-lg px-2 py-1">Module {i + 1}</span>
												<div className="flex-1" />
												{hasAi && (
													<button type="button" disabled={aiBusy !== null} onClick={() => runAi("section", i, `Régénérer le module ${i + 1}`)}
														className={btnGhost}>
														{aiBusy === `section:${i}` ? "Génération…" : "✨ Régénérer"}
													</button>
												)}
												<button type="button" className={btnGhost}
													onClick={() => set({ sections: [...form.sections.slice(0, i + 1), { ...s }, ...form.sections.slice(i + 1)] })}>
													Dupliquer
												</button>
												<button type="button" className={btnDanger}
													onClick={() => set({ sections: form.sections.filter((_, j) => j !== i) })}>Supprimer</button>
											</div>
											<input value={s.title} onChange={(e) => updSection(i, { title: e.target.value })} placeholder="Titre du module" className={inputCls} />
											<input value={s.summary || ""} onChange={(e) => updSection(i, { summary: e.target.value })} placeholder="Résumé en une phrase (sommaire)" className={inputCls} />
											<textarea value={s.content} onChange={(e) => updSection(i, { content: e.target.value })} rows={5}
												placeholder="Contenu (paragraphes séparés par une ligne vide ; listes avec « - » ; **gras** supporté)" className={`${inputCls} resize-y`} />
											<div>
												<div className="flex items-center justify-between">
													<span className="text-xs font-medium text-gray-600">Points clés (encadré de fin de module)</span>
													<button type="button" className={btnGhost} onClick={() => updSection(i, { keyPoints: [...(s.keyPoints || []), ""] })}>+ Point</button>
												</div>
												<div className="space-y-1.5 mt-1">
													{(s.keyPoints || []).map((k, ki) => (
														<div key={ki} className="flex gap-2">
															<input value={k} onChange={(e) => updSection(i, { keyPoints: s.keyPoints.map((x, xj) => (xj === ki ? e.target.value : x)) })}
																className={`${inputCls} !py-1.5 text-xs`} placeholder={`Point clé ${ki + 1}`} />
															<button type="button" className={btnDanger} onClick={() => updSection(i, { keyPoints: s.keyPoints.filter((_, xj) => xj !== ki) })}>✕</button>
														</div>
													))}
												</div>
											</div>
										</div>
									</div>
								</div>
							))}
							<button type="button" onClick={() => set({ sections: [...form.sections, emptySection()] })} className={btnSecondary}>
								+ Ajouter un module
							</button>
						</div>
					)}

					{tab === "quiz" && (
						<div className="space-y-4">
							<div className={`rounded-xl px-4 py-3 text-sm ${blockers.length ? "bg-amber-50 border border-amber-200 text-amber-800" : "bg-[rgba(13,189,159,0.08)] border border-[rgba(13,189,159,0.3)] text-[#0a8f78]"}`}>
								{blockers.length
									? <>Avant publication : {blockers.join(" ")}</>
									: "Quiz complet — la formation peut être publiée."}
								{hasAi && (
									<span className="float-right flex gap-2">
										<button type="button" disabled={aiBusy !== null} onClick={() => runAi("quiz", undefined, "Régénérer le quiz")} className={btnGhost}>
											{aiBusy === "quiz" ? "Génération…" : "✨ Régénérer le quiz"}
										</button>
										<button type="button" disabled={aiBusy !== null} onClick={() => runAi("questions", undefined, "Ajouter 5 questions")} className={btnGhost}>
											{aiBusy === "questions" ? "Génération…" : "✨ +5 questions"}
										</button>
									</span>
								)}
							</div>
							{form.quiz.map((q, i) => (
								<div key={i} className="bg-white rounded-xl border border-[rgba(13,110,187,0.12)] p-5">
									<div className="flex items-start gap-3">
										<MoveButtons index={i} length={form.quiz.length} label="la question"
											onMove={(a, b) => set({ quiz: moveItem(form.quiz, a, b) })} />
										<div className="flex-1 space-y-3">
											<div className="flex items-center gap-2">
												<span className="text-xs font-bold text-[#0D6EBB] bg-[rgba(13,110,187,0.08)] rounded-lg px-2 py-1">Q{i + 1}</span>
												<div className="flex-1" />
												<button type="button" className={btnDanger} onClick={() => set({ quiz: form.quiz.filter((_, j) => j !== i) })}>Supprimer</button>
											</div>
											<textarea value={q.question} onChange={(e) => updQuestion(i, { question: e.target.value })} rows={2}
												placeholder="Question" className={`${inputCls} resize-y`} />
											<div className="space-y-2">
												{q.options.map((opt, oi) => (
													<div key={oi} className="flex items-center gap-2">
														<input type="radio" name={`answer-${i}`} checked={q.answer === oi}
															onChange={() => updQuestion(i, { answer: oi })}
															title="Bonne réponse" className="w-4 h-4 accent-[#0DBD9F]" />
														<span className="text-xs font-bold text-gray-400 w-4">{String.fromCharCode(65 + oi)}.</span>
														<input value={opt} onChange={(e) => updQuestion(i, { options: q.options.map((o, j) => (j === oi ? e.target.value : o)) })}
															className={`${inputCls} !py-1.5`} placeholder={`Option ${String.fromCharCode(65 + oi)}`} />
														{q.options.length > 2 && (
															<button type="button" className={btnDanger}
																onClick={() => {
																	const options = q.options.filter((_, j) => j !== oi);
																	updQuestion(i, { options, answer: q.answer > oi ? q.answer - 1 : q.answer === oi ? 0 : q.answer });
																}}>✕</button>
														)}
													</div>
												))}
												{q.options.length < 8 && (
													<button type="button" className={btnGhost} onClick={() => updQuestion(i, { options: [...q.options, ""] })}>+ Ajouter une option</button>
												)}
											</div>
											<input value={q.explanation || ""} onChange={(e) => updQuestion(i, { explanation: e.target.value })}
												placeholder="Explication de la bonne réponse (affichée après soumission)" className={`${inputCls} !py-1.5 text-xs`} />
										</div>
									</div>
								</div>
							))}
							<button type="button" onClick={() => set({ quiz: [...form.quiz, emptyQuestion()] })} className={btnSecondary}>
								+ Ajouter une question
							</button>
						</div>
					)}

					{tab === "ressources" && (
						<div className="space-y-4">
							{form.source_pdf?.url && (
								<div className="bg-[rgba(13,110,187,0.05)] border border-[rgba(13,110,187,0.15)] rounded-xl px-4 py-3 text-sm text-[#0D6EBB]">
									📄 PDF source : <strong>{form.source_pdf.name}</strong> — utilisé par les outils IA et visible en ressource pour les apprenants.
								</div>
							)}
							<div className="bg-white rounded-xl border border-[rgba(13,110,187,0.12)] p-5 space-y-3">
								{form.resources.map((r, i) => (
									<div key={i} className="flex items-center gap-2">
										<input value={r.name} onChange={(e) => updResource(i, { name: e.target.value })} placeholder="Nom de la ressource" className={`${inputCls} !w-56`} />
										<input value={r.url} onChange={(e) => updResource(i, { url: e.target.value })} placeholder="URL (/uploads/… ou https://…)" className={`${inputCls} flex-1`} />
										<button type="button" className={btnDanger} onClick={() => set({ resources: form.resources.filter((_, j) => j !== i) })}>Supprimer</button>
									</div>
								))}
								<button type="button" onClick={() => set({ resources: [...form.resources, { name: "", url: "" }] })} className={btnSecondary}>
									+ Ajouter une ressource
								</button>
								<p className="text-[11px] text-gray-400">Les ressources ne sont visibles que par les apprenants qui ont accès à la formation.</p>
							</div>
							<div className="bg-white rounded-xl border border-[rgba(13,110,187,0.12)] p-5">
								<MediaPicker type="pdf" folder="courses" label="Ajouter un PDF depuis la médiathèque"
									value="" onChange={(v) => v && set({ resources: [...form.resources, { name: v.split("/").pop(), url: v }] })} />
							</div>
							<div className="bg-white rounded-xl border border-[rgba(13,110,187,0.12)] p-5">
								<div className="flex items-center justify-between mb-2">
									<label className={`${labelCls} mb-0`}>Glossaire</label>
									<button type="button" className={btnGhost} onClick={() => set({ glossary: [...form.glossary, { term: "", definition: "" }] })}>+ Entrée</button>
								</div>
								<div className="space-y-2">
									{form.glossary.map((g, i) => (
										<div key={i} className="flex gap-2">
											<input value={g.term} onChange={(e) => updGlossary(i, { term: e.target.value })} placeholder="Terme" className={`${inputCls} !w-52`} />
											<input value={g.definition} onChange={(e) => updGlossary(i, { definition: e.target.value })} placeholder="Définition" className={`${inputCls} flex-1`} />
											<button type="button" className={btnDanger} onClick={() => set({ glossary: form.glossary.filter((_, j) => j !== i) })}>✕</button>
										</div>
									))}
								</div>
							</div>
						</div>
					)}
				</div>

				{/* Pied */}
				<div className="px-6 py-4 border-t border-[rgba(13,110,187,0.1)] bg-white rounded-b-2xl">
					{error && <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2 mb-3" role="alert">{error}</p>}
					{notice && <p className="text-sm text-[#0a8f78] bg-[rgba(13,189,159,0.08)] rounded-xl px-4 py-2 mb-3">{notice}</p>}
					<div className="flex flex-wrap items-center gap-3">
						<motion.button onClick={() => save()} disabled={saving || publishing} whileHover={{ scale: 1.02 }} className={btnPrimary}>
							{saving ? "Enregistrement…" : isNew ? "Créer le brouillon" : "Enregistrer le brouillon"}
						</motion.button>
						{!isNew && (
							<>
								<a href={`/academy/${form.id}`} target="_blank" rel="noreferrer" className={btnSecondary}>
									Prévisualiser ↗
								</a>
								{form.status === "published" ? (
									<button onClick={unpublish} disabled={publishing || saving} className={btnSecondary}>
										{publishing ? "…" : "Dépublier"}
									</button>
								) : (
									<motion.button onClick={publish} disabled={publishing || saving || blockers.length > 0}
										whileHover={{ scale: 1.02 }} title={blockers.length ? blockers.join(" ") : ""}
										className="bg-[#0DBD9F] hover:bg-[#0D6EBB] text-white rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50">
										{publishing ? "Publication…" : "Publier"}
									</motion.button>
								)}
							</>
						)}
						<div className="flex-1" />
						<button onClick={tryClose} className="px-5 py-2.5 border border-gray-200 rounded-xl text-gray-600 text-sm hover:bg-gray-50 transition-colors">
							{dirty ? "Annuler" : "Fermer"}
						</button>
					</div>
				</div>
			</motion.div>

			{/* Aperçu IA avant remplacement */}
			<AnimatePresence>
				{aiPreview && (
					<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
						className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center px-4">
						<div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col p-6">
							<h4 className="font-bold text-gray-900 mb-1">{aiPreview.label}</h4>
							<p className="text-xs text-gray-400 mb-4">Proposition de {aiPreview.provider} ({aiPreview.model}) — rien n&apos;est remplacé sans votre accord.</p>
							<div className="flex-1 overflow-y-auto space-y-3 text-sm">
								{aiPreview.kind === "section" ? (
									<div className="space-y-2">
										<p className="font-semibold">{aiPreview.data.title}</p>
										<p className="text-gray-500 italic">{aiPreview.data.summary}</p>
										<p className="whitespace-pre-wrap text-gray-700">{aiPreview.data.content}</p>
										{(aiPreview.data.keyPoints || []).length > 0 && (
											<ul className="list-disc pl-5 text-gray-700">{aiPreview.data.keyPoints.map((k, i) => <li key={i}>{k}</li>)}</ul>
										)}
									</div>
								) : (
									(aiPreview.data || []).map((q, i) => (
										<div key={i} className="border border-gray-200 rounded-xl p-3">
											<p className="font-medium">{i + 1}. {q.question}</p>
											<ul className="mt-1 text-gray-600">
												{q.options.map((o, oi) => (
													<li key={oi} className={oi === q.answer ? "text-[#0a8f78] font-semibold" : ""}>
														{oi === q.answer ? "✓ " : "· "}{o}
													</li>
												))}
											</ul>
											{q.explanation && <p className="text-xs text-gray-400 mt-1">{q.explanation}</p>}
										</div>
									))
								)}
							</div>
							<div className="flex gap-3 mt-4">
								<button onClick={applyAiPreview} className={btnPrimary}>
									{aiPreview.kind === "questions" ? "Ajouter au quiz" : aiPreview.kind === "quiz" ? "Remplacer le quiz" : "Remplacer le module"}
								</button>
								<button onClick={() => setAiPreview(null)} className={btnSecondary}>Annuler</button>
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</motion.div>
	);
}
