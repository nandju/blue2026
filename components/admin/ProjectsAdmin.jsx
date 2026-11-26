"use client";
import { useEffect, useState } from "react";
import {
	getAdminProjects,
	createProject,
	updateProject,
	deleteProject,
	saveProjectsOrder,
} from "@/lib/store";
import MediaPicker from "./MediaPicker";
import GalleryEditor from "./GalleryEditor";
import MoveButtons, { moveItem } from "./MoveButtons";
import { inputCls, labelCls, btnPrimary, btnSecondary, btnGhost, btnDanger, cardCls } from "./ui";
import { PROJECT_CATEGORIES } from "@/lib/content/defaults";

const slugify = (s) =>
	String(s || "")
		.normalize("NFD")
		.replace(/[̀-ͯ]/g, "")
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, 80);

const EMPTY = {
	title: "",
	slug: "",
	year: new Date().getFullYear().toString(),
	desc: [""],
	tech: [""],
	category: [1],
	thumbnail: "",
	images: [],
	show: true,
};

export default function ProjectsAdmin() {
	const [projects, setProjects] = useState(null);
	const [message, setMessage] = useState(null);
	const [editing, setEditing] = useState(null); // { mode: "create"|"edit", data }
	const [savingOrder, setSavingOrder] = useState(false);

	const load = () =>
		getAdminProjects()
			.then(setProjects)
			.catch((e) => setMessage({ type: "error", text: e.message }));

	useEffect(() => {
		load();
	}, []);

	const move = async (from, to) => {
		const next = moveItem(projects, from, to);
		setProjects(next);
		setSavingOrder(true);
		try {
			setProjects(await saveProjectsOrder(next.map((p) => String(p.id))));
		} catch (e) {
			setMessage({ type: "error", text: e.message });
			load();
		} finally {
			setSavingOrder(false);
		}
	};

	const toggleShow = async (p) => {
		try {
			const rec = await updateProject(p.id, { show: !p.show });
			setProjects((list) => list.map((x) => (String(x.id) === String(p.id) ? rec : x)));
			setMessage({ type: "ok", text: rec.show ? "✓ Projet affiché sur le site" : "✓ Projet masqué" });
		} catch (e) {
			setMessage({ type: "error", text: e.message });
		}
	};

	const remove = async (p) => {
		if (!confirm(`Supprimer définitivement le projet « ${p.title} » ?`)) return;
		try {
			await deleteProject(p.id);
			setProjects((list) => list.filter((x) => String(x.id) !== String(p.id)));
			setMessage({ type: "ok", text: "✓ Projet supprimé" });
		} catch (e) {
			setMessage({ type: "error", text: e.message });
		}
	};

	if (!projects) {
		return message ? <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">{message.text}</p> : <div className="h-64 bg-white rounded-2xl animate-pulse" />;
	}

	if (editing) {
		return (
			<ProjectForm
				mode={editing.mode}
				initial={editing.data}
				onCancel={() => setEditing(null)}
				onDone={async () => {
					setEditing(null);
					await load();
				}}
			/>
		);
	}

	return (
		<div className="space-y-4">
			{message && (
				<p className={`text-sm rounded-xl px-4 py-3 ${message.type === "ok" ? "bg-[rgba(13,189,159,0.1)] text-[#0DBD9F]" : "bg-red-50 text-red-500"}`} role="status">
					{message.text}
				</p>
			)}
			<div className="flex items-center justify-between">
				<p className="text-sm text-gray-500">{projects.length} projet{projects.length > 1 ? "s" : ""} · ordre d&apos;affichage sur /projects{savingOrder ? " · enregistrement…" : ""}</p>
				<button type="button" className={btnPrimary} onClick={() => setEditing({ mode: "create", data: { ...EMPTY } })}>
					+ Nouveau projet
				</button>
			</div>
			<ul className="space-y-3">
				{projects.map((p, i) => (
					<li key={p.id} className={`${cardCls} p-4 flex flex-wrap items-center gap-4`}>
						<MoveButtons index={i} length={projects.length} onMove={move} label={`le projet ${p.title}`} />
						{p.thumbnail ? (
							// eslint-disable-next-line @next/next/no-img-element
							<img src={p.thumbnail} alt="" className="w-20 h-14 rounded-lg object-cover shrink-0" />
						) : (
							<span className="w-20 h-14 rounded-lg bg-[rgba(13,110,187,0.08)] shrink-0" />
						)}
						<div className="flex-1 min-w-0">
							<p className="font-semibold text-gray-900 truncate">{p.title}</p>
							<p className="text-xs text-gray-500 truncate">
								/{p.slug} · {p.year} · {(p.tech || []).join(", ")}
							</p>
						</div>
						<span className={`text-xs font-medium px-2.5 py-1 rounded-full ${p.show !== false ? "bg-[rgba(13,189,159,0.12)] text-[#0DBD9F]" : "bg-gray-100 text-gray-500"}`}>
							{p.show !== false ? "Visible" : "Masqué"}
						</span>
						<div className="flex gap-1.5">
							<button type="button" className={btnSecondary} onClick={() => setEditing({ mode: "edit", data: p })}>Modifier</button>
							<button type="button" className={btnGhost} onClick={() => toggleShow(p)}>{p.show !== false ? "Masquer" : "Afficher"}</button>
							<button type="button" className={btnDanger} onClick={() => remove(p)}>Supprimer</button>
						</div>
					</li>
				))}
			</ul>
		</div>
	);
}

function ProjectForm({ mode, initial, onCancel, onDone }) {
	const [data, setData] = useState(() => ({
		...EMPTY,
		...initial,
		desc: Array.isArray(initial.desc) && initial.desc.length ? [...initial.desc] : [""],
		tech: Array.isArray(initial.tech) && initial.tech.length ? [...initial.tech] : [""],
		images: Array.isArray(initial.images) ? initial.images.map((u) => (typeof u === "string" ? { url: u, alt: "", caption: "" } : u)) : [],
		category: Array.isArray(initial.category) && initial.category.length ? [...initial.category] : [1],
	}));
	const [slugTouched, setSlugTouched] = useState(mode === "edit");
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");

	const patch = (p) => setData((d) => ({ ...d, ...p }));
	const save = async () => {
		if (!data.title.trim()) return setError("Le titre est obligatoire.");
		if (!data.slug.trim()) return setError("Le slug est obligatoire.");
		setSaving(true);
		setError("");
		try {
			const payload = {
				...data,
				slug: slugify(data.slug),
				desc: data.desc.map((s) => s.trim()).filter(Boolean),
				tech: data.tech.map((s) => s.trim()).filter(Boolean),
				images: (data.images || []).map((it) => it.url).filter(Boolean),
				preview: data.preview || "",
				code: data.code || "",
			};
			if (mode === "create") await createProject(payload);
			else await updateProject(initial.id, payload);
			await onDone();
		} catch (e) {
			setError(e.message);
		} finally {
			setSaving(false);
		}
	};

	const lineList = (key, label) => (
		<div>
			<span className={labelCls}>{label}</span>
			{data[key].map((s, i) => (
				<div key={i} className="flex gap-2 mb-1.5">
					<textarea value={s} rows={key === "desc" ? 3 : 1} onChange={(e) => patch({ [key]: data[key].map((x, j) => (j === i ? e.target.value : x)) })}
						className={inputCls} aria-label={`${label} ${i + 1}`} />
					<button type="button" onClick={() => patch({ [key]: data[key].filter((_, j) => j !== i) })} disabled={data[key].length <= 1}
						className="text-red-400 hover:text-red-600 px-2 disabled:opacity-30" aria-label={`Retirer ${i + 1}`}>✕</button>
				</div>
			))}
			<button type="button" className={btnGhost} onClick={() => patch({ [key]: [...data[key], ""] })}>+ Ajouter</button>
		</div>
	);

	return (
		<div className={`${cardCls} p-6 space-y-5`}>
			<div className="flex items-center justify-between">
				<h3 className="font-bold text-gray-900">{mode === "create" ? "Nouveau projet" : `Modifier « ${initial.title} »`}</h3>
				<button type="button" className={btnGhost} onClick={onCancel}>← Retour à la liste</button>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div>
					<label className={labelCls}>Titre *</label>
					<input
						value={data.title}
						onChange={(e) => {
							const v = e.target.value;
							patch({ title: v, ...(slugTouched ? {} : { slug: slugify(v) }) });
						}}
						maxLength={160}
						className={inputCls}
					/>
				</div>
				<div>
					<label className={labelCls}>Slug (adresse /projects/…) *</label>
					<input value={data.slug} onChange={(e) => { setSlugTouched(true); patch({ slug: slugify(e.target.value) }); }}
						maxLength={80} className={inputCls} placeholder="mon-projet" />
					<p className="text-[11px] text-gray-400 mt-1">Unique. Lettres minuscules, chiffres et tirets.</p>
				</div>
				<div>
					<label className={labelCls}>Année</label>
					<input value={data.year} onChange={(e) => patch({ year: e.target.value })} maxLength={10} className={inputCls} />
				</div>
				<div>
					<label className={labelCls}>Catégories</label>
					<div className="flex flex-wrap gap-2 pt-1">
						{PROJECT_CATEGORIES.map((cat) => {
							const on = data.category.includes(cat.value);
							return (
								<button key={cat.value} type="button"
									onClick={() => patch({ category: on ? data.category.filter((v) => v !== cat.value) : [...data.category, cat.value] })}
									className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${on ? "bg-[#0D6EBB] text-white" : "bg-white border border-[rgba(13,110,187,0.25)] text-[#0D6EBB]"}`}>
									{cat.short}
								</button>
							);
						})}
					</div>
				</div>
			</div>

			{lineList("desc", "Description (paragraphes)")}
			{lineList("tech", "Domaines / mots-clés")}

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div>
					<label className={labelCls}>Lien de prévisualisation (facultatif)</label>
					<input value={data.preview || ""} onChange={(e) => patch({ preview: e.target.value })} maxLength={500} className={inputCls} />
				</div>
				<div>
					<label className={labelCls}>Lien du code (facultatif)</label>
					<input value={data.code || ""} onChange={(e) => patch({ code: e.target.value })} maxLength={500} className={inputCls} />
				</div>
			</div>

			<MediaPicker type="image" label="Miniature" value={data.thumbnail || null} defaultValue={null} folder="projets"
				onChange={(v) => patch({ thumbnail: v || "" })} />

			<div>
				<span className={labelCls}>Galerie d&apos;images</span>
				<GalleryEditor value={data.images} defaultItems={[]} folder="projets" max={20}
					onChange={(list) => patch({ images: list || [] })} />
			</div>

			<label className="flex items-center gap-2 text-sm text-gray-700">
				<input type="checkbox" checked={data.show !== false} onChange={(e) => patch({ show: e.target.checked })} className="w-4 h-4 accent-[#0D6EBB]" />
				Visible sur le site
			</label>

			{error && <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3" role="alert">{error}</p>}
			<div className="flex gap-3">
				<button type="button" className={btnPrimary} disabled={saving} onClick={save}>
					{saving ? "Enregistrement…" : mode === "create" ? "Créer le projet" : "Enregistrer"}
				</button>
				<button type="button" className={btnGhost} onClick={onCancel}>Annuler</button>
			</div>
		</div>
	);
}
