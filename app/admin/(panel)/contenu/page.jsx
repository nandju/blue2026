"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getAdminContent, saveContentSection } from "@/lib/store";
import { CONTENT_PAGES, SECTION_SCHEMAS, pageSections, sectionSchema } from "@/lib/content/schemas";
import { HOME_SECTION_ORDER } from "@/lib/content/defaults";
import SectionFields from "@/components/admin/SectionFields";
import ProjectsAdmin from "@/components/admin/ProjectsAdmin";
import LastModified from "@/components/admin/LastModified";
import MoveButtons, { moveItem } from "@/components/admin/MoveButtons";
import { inputCls, cardCls, btnPrimary, btnSecondary, btnGhost } from "@/components/admin/ui";

const SECTION_LABELS = Object.fromEntries(
	HOME_SECTION_ORDER.map((id) => [id, SECTION_SCHEMAS[`home.${id}`]?.label || id])
);

/** Éditeur d'ordre et de visibilité des sections de l'accueil. */
function HomeLayoutEditor({ entry, onSaved, setMessage }) {
	const [layout, setLayout] = useState({ order: HOME_SECTION_ORDER, hidden: [] });
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		if (entry?.value) setLayout({ order: entry.value.order || HOME_SECTION_ORDER, hidden: entry.value.hidden || [] });
	}, [entry]);

	const save = async (value) => {
		setSaving(true);
		try {
			const res = await saveContentSection("home", "layout", value);
			onSaved("home.layout", res);
			setMessage({ type: "ok", text: value === null ? "✓ Mise en page par défaut rétablie" : "✓ Mise en page enregistrée" });
		} catch (e) {
			setMessage({ type: "error", text: e.message });
		} finally {
			setSaving(false);
		}
	};

	const hidden = new Set(layout.hidden);
	const toggle = (id) =>
		setLayout((l) => ({ ...l, hidden: hidden.has(id) ? l.hidden.filter((x) => x !== id) : [...l.hidden, id] }));

	return (
		<div>
			<ul className="space-y-2">
				{layout.order.map((id, i) => (
					<li key={id} className="flex items-center gap-3 bg-[#f7faff] rounded-xl border border-[rgba(13,110,187,0.12)] px-4 py-3">
						<MoveButtons index={i} length={layout.order.length} label={SECTION_LABELS[id] || id}
							onMove={(a, b) => setLayout((l) => ({ ...l, order: moveItem(l.order, a, b) }))} />
						<span className={`flex-1 text-sm font-medium ${hidden.has(id) ? "text-gray-400 line-through" : "text-gray-800"}`}>
							{SECTION_LABELS[id] || id}
						</span>
						<label className="flex items-center gap-2 text-xs text-gray-600">
							<input type="checkbox" checked={!hidden.has(id)} onChange={() => toggle(id)} className="w-4 h-4 accent-[#0D6EBB]" />
							{hidden.has(id) ? "Masquée" : "Visible"}
						</label>
					</li>
				))}
			</ul>
			<div className="flex flex-wrap items-center gap-3 mt-5">
				<button type="button" className={btnPrimary} disabled={saving}
					onClick={() => save(layout)}>
					{saving ? "Enregistrement…" : "Enregistrer"}
				</button>
				{!entry?.isDefault && (
					<button type="button" className={btnGhost} disabled={saving}
						onClick={() => confirm("Rétablir l'ordre et la visibilité par défaut ?") && save(null)}>
						↺ Tout rétablir
					</button>
				)}
			</div>
		</div>
	);
}

/** Éditeur générique d'une section (formulaire par schéma). */
function SectionEditor({ pageId, sectionId, entry, onSaved, setMessage, registerDirty }) {
	const schema = sectionSchema(pageId, sectionId);
	const [overrides, setOverrides] = useState({});
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		setOverrides(structuredClone(entry?.overrides || {}));
	}, [entry]);

	const dirty = useMemo(
		() => JSON.stringify(overrides || {}) !== JSON.stringify(entry?.overrides || {}),
		[overrides, entry]
	);
	useEffect(() => registerDirty(dirty), [dirty, registerDirty]);

	const save = async (value) => {
		setSaving(true);
		try {
			const res = await saveContentSection(pageId, sectionId, value);
			onSaved(`${pageId}.${sectionId}`, res);
			setOverrides(res.overrides || {});
			setMessage({ type: "ok", text: value === null ? "✓ Section rétablie par défaut" : "✓ Section enregistrée — visible immédiatement sur le site" });
		} catch (e) {
			setMessage({ type: "error", text: e.message });
		} finally {
			setSaving(false);
		}
	};

	if (!schema) return <p className="text-sm text-gray-500">Cette section n&apos;est pas modifiable.</p>;

	return (
		<div>
			<SectionFields
				schema={schema}
				overrides={overrides}
				defaults={entry?.defaultValue || {}}
				onChange={setOverrides}
			/>
			<div className="flex flex-wrap items-center gap-3 mt-6 pt-5 border-t border-[rgba(13,110,187,0.1)]">
				<button type="button" className={btnPrimary} disabled={saving || !dirty}
					onClick={() => save(overrides)}>
					{saving ? "Enregistrement…" : "Enregistrer la section"}
				</button>
				{dirty && (
					<button type="button" className={btnGhost} onClick={() => setOverrides(structuredClone(entry?.overrides || {}))}>
						Annuler les changements
					</button>
				)}
				{!entry?.isDefault && (
					<button type="button" className={btnGhost} disabled={saving}
						onClick={() => confirm("Rétablir toute la section par défaut ?") && save(null)}>
						↺ Tout rétablir
					</button>
				)}
			</div>
		</div>
	);
}

export default function AdminContenuPage() {
	const [sections, setSections] = useState(null);
	const [pageId, setPageId] = useState("home");
	const [sectionId, setSectionId] = useState("hero");
	const [message, setMessage] = useState(null);
	const [dirty, setDirty] = useState(false);

	const load = () =>
		getAdminContent()
			.then((res) => setSections(res.sections))
			.catch((e) => setMessage({ type: "error", text: e.message }));

	useEffect(() => {
		load();
	}, []);

	// Avertissement avant de quitter avec des modifications non enregistrées.
	useEffect(() => {
		const onBeforeUnload = (e) => {
			if (!dirty) return;
			e.preventDefault();
			e.returnValue = "";
		};
		window.addEventListener("beforeunload", onBeforeUnload);
		return () => window.removeEventListener("beforeunload", onBeforeUnload);
	}, [dirty]);

	const selectSection = (pid, sid) => {
		if (dirty && !confirm("Des modifications non enregistrées seront perdues. Continuer ?")) return;
		setMessage(null);
		setDirty(false);
		setPageId(pid);
		setSectionId(sid);
	};

	const onSaved = (key, res) => {
		setSections((s) => ({ ...s, [key]: res }));
	};

	const page = CONTENT_PAGES.find((p) => p.id === pageId);
	const sectionList = pageSections(pageId);
	const hasLayout = pageId === "home";
	const hasProjects = pageId === "projectsPage";
	const entry = sections?.[`${pageId}.${sectionId}`];

	return (
		<div className="space-y-6">
			{/* Navigation Page → Section */}
			<div className="flex flex-wrap gap-2">
				{CONTENT_PAGES.map((p) => (
					<button key={p.id} type="button" onClick={() => selectSection(p.id, pageSections(p.id)[0])}
						className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
							pageId === p.id ? "bg-[#0D6EBB] text-white shadow-md" : "bg-white border border-[rgba(13,110,187,0.2)] text-[#0D6EBB] hover:bg-[rgba(13,110,187,0.06)]"
						}`}>
						{p.label}
					</button>
				))}
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
				{/* Sections de la page */}
				<nav className={`${cardCls} p-3 h-fit lg:sticky lg:top-24`} aria-label="Sections">
					{hasLayout && (
						<button type="button" onClick={() => selectSection("home", "layout")}
							className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
								sectionId === "layout" ? "bg-[#0D6EBB] text-white" : "text-gray-700 hover:bg-[rgba(13,110,187,0.06)]"
							}`}>
							🧩 Ordre & visibilité
							{sections?.["home.layout"] && !sections["home.layout"].isDefault && <span className="ml-1.5 text-[10px] opacity-70">• modifié</span>}
						</button>
					)}
					{sectionList.map((sid) => {
						const e = sections?.[`${pageId}.${sid}`];
						return (
							<button key={sid} type="button" onClick={() => selectSection(pageId, sid)}
								className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
									sectionId === sid ? "bg-[#0D6EBB] text-white" : "text-gray-700 hover:bg-[rgba(13,110,187,0.06)]"
								}`}>
								{SECTION_SCHEMAS[`${pageId}.${sid}`]?.label || sid}
								{e && !e.isDefault && <span className={`ml-1.5 text-[10px] ${sectionId === sid ? "opacity-70" : "text-[#0DBD9F]"}`}>• modifié</span>}
							</button>
						);
					})}
					{hasProjects && (
						<button type="button" onClick={() => selectSection("projectsPage", "__projects")}
							className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
								sectionId === "__projects" ? "bg-[#0D6EBB] text-white" : "text-gray-700 hover:bg-[rgba(13,110,187,0.06)]"
							}`}>
							🗂 Actions / Projets
						</button>
					)}
				</nav>

				{/* Éditeur */}
				<div className={`${cardCls} p-6`}>
					<div className="flex flex-wrap items-start justify-between gap-3 mb-5">
						<div>
							<h2 className="font-bold text-gray-900 text-lg">
								{page?.label}
								{sectionId === "__projects"
									? " — Actions / Projets"
									: sectionId === "layout"
										? " — Ordre & visibilité"
										: ` — ${SECTION_SCHEMAS[`${pageId}.${sectionId}`]?.label || sectionId}`}
							</h2>
							{SECTION_SCHEMAS[`${pageId}.${sectionId}`]?.description && (
								<p className="text-sm text-gray-500 mt-0.5">{SECTION_SCHEMAS[`${pageId}.${sectionId}`].description}</p>
							)}
							{sectionId !== "__projects" && entry && (
								<LastModified at={entry.updatedAt} by={entry.updatedBy} isDefault={entry.isDefault} className="mt-1" />
							)}
						</div>
						{page?.path && (
							<Link href={page.path} target="_blank" className={btnSecondary}>
								Voir sur le site ↗
							</Link>
						)}
					</div>

					{message && (
						<p className={`text-sm rounded-xl px-4 py-3 mb-5 ${message.type === "ok" ? "bg-[rgba(13,189,159,0.1)] text-[#0DBD9F]" : "bg-red-50 text-red-500"}`} role="status">
							{message.text}
						</p>
					)}

					{!sections ? (
						<div className="h-64 bg-[#f7faff] rounded-2xl animate-pulse" />
					) : sectionId === "__projects" ? (
						<ProjectsAdmin />
					) : sectionId === "layout" ? (
						<HomeLayoutEditor entry={sections["home.layout"]} onSaved={onSaved} setMessage={setMessage} />
					) : (
						<SectionEditor
							key={`${pageId}.${sectionId}`}
							pageId={pageId}
							sectionId={sectionId}
							entry={entry}
							onSaved={onSaved}
							setMessage={setMessage}
							registerDirty={setDirty}
						/>
					)}
				</div>
			</div>
		</div>
	);
}
