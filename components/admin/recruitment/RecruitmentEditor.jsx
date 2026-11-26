"use client";
import { useMemo, useState } from "react";
import MediaPicker from "@/components/admin/MediaPicker";
import LastModified from "@/components/admin/LastModified";
import FieldsBuilder from "./FieldsBuilder";
import ButtonsEditor from "./ButtonsEditor";
import DynamicForm from "@/components/recruitment/DynamicForm";
import { StatusBadge } from "./RecruitmentList";
import { updateRecruitment, closeRecruitment, reopenRecruitment } from "@/lib/store";
import { RECRUITMENT_TYPES, slugify, fmtDateTime } from "@/lib/recruitmentModel";
import { btnPrimary, btnSecondary, inputCls, labelCls, cardCls } from "@/components/admin/ui";

const TABS = [
	{ key: "infos", label: "Informations" },
	{ key: "periods", label: "Périodes & visibilité" },
	{ key: "fields", label: "Champs du formulaire" },
	{ key: "buttons", label: "Boutons-liens" },
	{ key: "preview", label: "Aperçu" },
];

/** ISO (UTC) → valeur datetime-local. Abidjan = UTC : conversion directe. */
const toLocalInput = (iso) => (iso ? String(iso).slice(0, 16) : "");
/** datetime-local → ISO UTC (heure d'Abidjan = UTC). */
const toIso = (v) => (v ? `${v.length === 16 ? v + ":00" : v}Z` : null);

export default function RecruitmentEditor({ form, onSaved, onError, onSubmissions }) {
	const [tab, setTab] = useState("infos");
	const [d, setD] = useState(() => ({
		title: form.title || "",
		slug: form.slug || "",
		slugTouched: !!form.slug,
		type: RECRUITMENT_TYPES.includes(form.type) ? form.type : (form.type ? "Autre" : "Bénévolat"),
		typeOther: form.typeOther || (RECRUITMENT_TYPES.includes(form.type) ? "" : form.type || ""),
		summary: form.summary || "",
		description: form.description || "",
		coverImage: form.coverImage || "",
		location: form.location || "",
		confirmationMessage: form.confirmationMessage || "",
		maxSubmissions: form.maxSubmissions ?? "",
		position: form.position ?? 0,
		featured: !!form.featured,
		published: !!form.published,
		hidden: !!form.hidden,
		visibleFrom: toLocalInput(form.visibleFrom),
		visibleUntil: toLocalInput(form.visibleUntil),
		applyFrom: toLocalInput(form.applyFrom),
		applyUntil: toLocalInput(form.applyUntil),
		fields: form.fields || [],
		buttons: form.buttons || [],
	}));
	const [saving, setSaving] = useState(false);
	const [dirty, setDirty] = useState(false);
	const [previewMode, setPreviewMode] = useState("desktop");

	const set = (patch) => { setD((p) => ({ ...p, ...patch })); setDirty(true); };

	const setTitle = (title) => {
		const patch = { title };
		if (!d.slugTouched) patch.slug = slugify(title);
		set(patch);
	};

	const summary = useMemo(() => {
		const bits = [];
		if (d.published && !d.hidden) bits.push("Visible sur le site");
		if (d.hidden) bits.push("Masqué");
		if (d.visibleFrom || d.visibleUntil) bits.push(`Apparition ${fmtDateTime(toIso(d.visibleFrom))} → ${fmtDateTime(toIso(d.visibleUntil))}`);
		if (d.applyFrom || d.applyUntil) bits.push(`Candidatures ${fmtDateTime(toIso(d.applyFrom))} → ${fmtDateTime(toIso(d.applyUntil))}`);
		bits.push(`${d.fields.length} champ(s) · ${d.buttons.length} bouton(s)`);
		return bits.join(" · ");
	}, [d]);

	const save = async () => {
		setSaving(true);
		onError("");
		try {
			await updateRecruitment(form.id, {
				...d,
				maxSubmissions: d.maxSubmissions === "" || d.maxSubmissions == null ? null : Number(d.maxSubmissions),
				position: Number(d.position) || 0,
				visibleFrom: toIso(d.visibleFrom),
				visibleUntil: toIso(d.visibleUntil),
				applyFrom: toIso(d.applyFrom),
				applyUntil: toIso(d.applyUntil),
			});
			setDirty(false);
			onSaved();
		} catch (e) {
			onError(e.message);
		} finally {
			setSaving(false);
		}
	};

	const hasSubs = (form.submissionCount || 0) > 0;

	return (
		<div>
			{/* Résumé + statut */}
			<div className={cardCls + " p-5 mb-5 flex flex-wrap items-center justify-between gap-4"}>
				<div className="flex items-center gap-3 flex-wrap">
					<StatusBadge status={form.status} />
					<p className="text-xs text-gray-500">{summary}</p>
				</div>
				<div className="flex items-center gap-2">
					{form.status === "open" && (
						<button onClick={async () => { try { await closeRecruitment(form.id); onSaved(); } catch (e) { onError(e.message); } }} className={btnSecondary + " !text-red-500 !border-red-200"}>
							Fermer les candidatures
						</button>
					)}
					{form.status === "closed" && (
						<button onClick={() => {
							const v = window.prompt("Nouvelle date de clôture (AAAA-MM-JJ HH:mm) :", "");
							if (v) reopenRecruitment(form.id, `${v.includes("T") ? v : v.replace(" ", "T")}:00Z`).then(onSaved).catch((e) => onError(e.message));
						}} className={btnSecondary + " !text-emerald-600 !border-emerald-200"}>
							Rouvrir les candidatures
						</button>
					)}
					<button onClick={onSubmissions} className={btnSecondary}>Candidatures ({form.submissionCount || 0})</button>
					<button onClick={save} disabled={saving || !dirty} className={btnPrimary}>{saving ? "Enregistrement…" : "Enregistrer"}</button>
				</div>
			</div>

			{/* Onglets */}
			<div className="flex gap-1.5 mb-5 overflow-x-auto">
				{TABS.map((t) => (
					<button key={t.key} onClick={() => setTab(t.key)}
						className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${tab === t.key ? "bg-[#0D6EBB] text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-[#0D6EBB]/40"}`}>
						{t.label}
					</button>
				))}
			</div>

			<div className={cardCls + " p-6"}>
				{tab === "infos" && (
					<div className="space-y-5">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
							<div>
								<label className={labelCls}>Titre *</label>
								<input className={inputCls} value={d.title} onChange={(e) => setTitle(e.target.value)} />
							</div>
							<div>
								<label className={labelCls}>Slug * <span className="text-gray-400 font-normal">(URL : /recrutement/{d.slug || "…"})</span></label>
								<input className={inputCls} value={d.slug} onChange={(e) => set({ slug: slugify(e.target.value), slugTouched: true })} />
							</div>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
							<div>
								<label className={labelCls}>Type *</label>
								<select className={inputCls} value={d.type} onChange={(e) => set({ type: e.target.value })}>
									{RECRUITMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
									<option value="Autre">Autre (saisie libre)</option>
								</select>
								{d.type === "Autre" && (
									<input className={inputCls + " mt-2"} value={d.typeOther} placeholder="Type personnalisé…" onChange={(e) => set({ typeOther: e.target.value })} />
								)}
							</div>
							<div>
								<label className={labelCls}>Lieu <span className="text-gray-400 font-normal">(optionnel)</span></label>
								<input className={inputCls} value={d.location} onChange={(e) => set({ location: e.target.value })} placeholder="Abidjan, en ligne…" />
							</div>
						</div>
						<div>
							<label className={labelCls}>Résumé <span className="text-gray-400 font-normal">(affiché sur les cartes)</span></label>
							<input className={inputCls} value={d.summary} onChange={(e) => set({ summary: e.target.value })} />
						</div>
						<div>
							<label className={labelCls}>Description <span className="text-gray-400 font-normal">(paragraphes, listes « - », **gras**)</span></label>
							<textarea className={inputCls + " min-h-[180px] font-mono text-xs"} value={d.description} onChange={(e) => set({ description: e.target.value })} />
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
							<MediaPicker label="Image de couverture" value={d.coverImage || null} onChange={(v) => set({ coverImage: v || "" })} folder="recruitment" />
							<div>
								<label className={labelCls}>Message de confirmation <span className="text-gray-400 font-normal">(après l&rsquo;envoi)</span></label>
								<textarea className={inputCls + " min-h-[90px]"} value={d.confirmationMessage} onChange={(e) => set({ confirmationMessage: e.target.value })}
									placeholder="Merci ! Votre candidature a bien été envoyée…" />
							</div>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-5">
							<div>
								<label className={labelCls}>Candidatures max <span className="text-gray-400 font-normal">(vide = illimité)</span></label>
								<input type="number" min="1" className={inputCls} value={d.maxSubmissions} onChange={(e) => set({ maxSubmissions: e.target.value })} />
							</div>
							<div>
								<label className={labelCls}>Ordre d&rsquo;affichage</label>
								<input type="number" min="0" className={inputCls} value={d.position} onChange={(e) => set({ position: e.target.value })} />
							</div>
							<div className="flex items-end pb-2">
								<label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
									<input type="checkbox" checked={d.featured} onChange={(e) => set({ featured: e.target.checked })} className="w-4 h-4 accent-[#0D6EBB]" />
									Mis en avant (en premier sur la page)
								</label>
							</div>
						</div>
						<LastModified at={form.updatedAt} by={form.updatedBy} />
					</div>
				)}

				{tab === "periods" && (
					<div className="space-y-7">
						{/* Interrupteurs principaux */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<label className={`flex items-start gap-3 rounded-2xl border-2 p-4 cursor-pointer transition-colors ${d.published ? "border-emerald-300 bg-emerald-50/50" : "border-gray-200"}`}>
								<input type="checkbox" checked={d.published} onChange={(e) => set({ published: e.target.checked })} className="mt-1 w-4 h-4 accent-emerald-600" />
								<span>
									<span className="block text-sm font-bold text-gray-800">Publié</span>
									<span className="block text-xs text-gray-500 mt-0.5">Le recrutement peut apparaître sur le site (selon la période d&rsquo;apparition).</span>
								</span>
							</label>
							<label className={`flex items-start gap-3 rounded-2xl border-2 p-4 transition-colors ${d.hidden ? "border-amber-300 bg-amber-50/50" : "border-gray-200"} ${!d.published ? "opacity-50" : "cursor-pointer"}`}>
								<input type="checkbox" checked={d.hidden} disabled={!d.published} onChange={(e) => set({ hidden: e.target.checked })} className="mt-1 w-4 h-4 accent-amber-500" />
								<span>
									<span className="block text-sm font-bold text-gray-800">Masquer immédiatement</span>
									<span className="block text-xs text-gray-500 mt-0.5">Retire le recrutement du site à tout moment, quelles que soient les dates. Le lien direct affichera « Ce recrutement n&rsquo;est plus disponible ».</span>
								</span>
							</label>
						</div>

						{/* Période d'apparition */}
						<div>
							<h3 className="text-sm font-bold text-[#073A63] mb-1">Période d&rsquo;apparition sur le site <span className="text-gray-400 font-normal">(heure d&rsquo;Abidjan, bornes optionnelles)</span></h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label className={labelCls}>Visible du</label>
									<input type="datetime-local" className={inputCls} value={d.visibleFrom} onChange={(e) => set({ visibleFrom: e.target.value })} />
								</div>
								<div>
									<label className={labelCls}>Visible jusqu&rsquo;au</label>
									<input type="datetime-local" className={inputCls} value={d.visibleUntil} onChange={(e) => set({ visibleUntil: e.target.value })} />
								</div>
							</div>
						</div>

						{/* Période de candidature */}
						<div>
							<h3 className="text-sm font-bold text-[#073A63] mb-1">Période de candidature <span className="text-gray-400 font-normal">(doit être comprise dans l&rsquo;apparition)</span></h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label className={labelCls}>Candidatures ouvertes du</label>
									<input type="datetime-local" className={inputCls} value={d.applyFrom} onChange={(e) => set({ applyFrom: e.target.value })} />
								</div>
								<div>
									<label className={labelCls}>Candidatures jusqu&rsquo;au</label>
									<input type="datetime-local" className={inputCls} value={d.applyUntil} onChange={(e) => set({ applyUntil: e.target.value })} />
								</div>
							</div>
							<p className="mt-2 text-xs text-gray-400">
								Sans borne de début : un recrutement publié visible ouvre les candidatures immédiatement. Sans borne de fin : pas de clôture automatique.
							</p>
						</div>
						<LastModified at={form.updatedAt} by={form.updatedBy} />
					</div>
				)}

				{tab === "fields" && (
					<FieldsBuilder fields={d.fields} onChange={(fields) => set({ fields })} hasSubmissions={hasSubs} />
				)}

				{tab === "buttons" && (
					<ButtonsEditor buttons={d.buttons} onChange={(buttons) => set({ buttons })} slug={d.slug || form.slug} />
				)}

				{tab === "preview" && (
					<div>
						<div className="flex items-center gap-2 mb-5">
							<button onClick={() => setPreviewMode("desktop")}
								className={`px-4 py-1.5 rounded-full text-xs font-semibold ${previewMode === "desktop" ? "bg-[#0D6EBB] text-white" : "text-[#0D6EBB] border border-[#0D6EBB]/25"}`}>
								🖥️ Ordinateur
							</button>
							<button onClick={() => setPreviewMode("mobile")}
								className={`px-4 py-1.5 rounded-full text-xs font-semibold ${previewMode === "mobile" ? "bg-[#0D6EBB] text-white" : "text-[#0D6EBB] border border-[#0D6EBB]/25"}`}>
								📱 Mobile
							</button>
						</div>
						<div className={`mx-auto bg-[#f4f9fd] rounded-2xl p-6 ${previewMode === "mobile" ? "max-w-sm" : "max-w-2xl"}`}>
							<div className="bg-white rounded-3xl border border-[#0D6EBB]/10 p-6">
								<h3 className="text-lg font-bold text-[#073A63] mb-1">{d.title || "Titre du recrutement"}</h3>
								<p className="text-xs text-gray-400 mb-5">{d.type === "Autre" ? d.typeOther : d.type}{d.location ? ` · ${d.location}` : ""}</p>
								<DynamicForm mode="preview" form={{ ...form, ...d }} submitLabel="Envoyer ma candidature" />
							</div>
						</div>
						<p className="mt-3 text-xs text-gray-400 text-center">Aperçu sans publication ni enregistrement — les champs sont désactivés.</p>
					</div>
				)}
			</div>
		</div>
	);
}
