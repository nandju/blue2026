"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getDepartmentsSetting, saveDepartmentsSetting, getAdminSettings, saveSiteSetting } from "@/lib/store";
import LastModified from "@/components/admin/LastModified";
import MoveButtons, { moveItem } from "@/components/admin/MoveButtons";
import MediaPicker from "@/components/admin/MediaPicker";
import { inputCls, labelCls, cardCls, btnPrimary, btnSecondary, btnGhost } from "@/components/admin/ui";
import { FONT_OPTIONS, googleFontsUrl, fontById } from "@/lib/content/fonts";
import { DEFAULT_COLORS, isValidHex, whiteTextReadable, paletteFrom } from "@/lib/colors";

const SOCIAL_FIELDS = [
	{ key: "facebook", label: "Facebook" },
	{ key: "instagram", label: "Instagram" },
	{ key: "linkedin", label: "LinkedIn" },
	{ key: "whatsapp", label: "WhatsApp (lien du groupe ou wa.me)" },
	{ key: "tiktok", label: "TikTok" },
	{ key: "youtube", label: "YouTube" },
];

function DepartmentsEditor() {
	const [list, setList] = useState(null);
	const [entry, setEntry] = useState(null);
	const [newItem, setNewItem] = useState("");
	const [saving, setSaving] = useState(false);
	const [message, setMessage] = useState(null);

	const apply = (data) => {
		setEntry(data);
		setList(data.value);
	};

	useEffect(() => {
		getDepartmentsSetting().then(apply).catch((e) => setMessage({ type: "error", text: e.message }));
	}, []);

	const save = async (value) => {
		setSaving(true);
		setMessage(null);
		try {
			apply(await saveDepartmentsSetting(value));
			setMessage({ type: "ok", text: value === null ? "✓ Liste par défaut rétablie" : "✓ Liste enregistrée" });
		} catch (e) {
			setMessage({ type: "error", text: e.message });
		} finally {
			setSaving(false);
		}
	};

	const add = () => {
		const v = newItem.trim();
		if (!v) return;
		if (list.some((d) => d.toLowerCase() === v.toLowerCase())) {
			setMessage({ type: "error", text: "Ce département existe déjà." });
			return;
		}
		setList([...list, v]);
		setNewItem("");
		setMessage(null);
	};

	if (!list) {
		return message ? <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">{message.text}</p> : <div className="h-64 bg-white rounded-2xl animate-pulse" />;
	}

	const dirty = JSON.stringify(list) !== JSON.stringify(entry.value);
	const isDefaultList = JSON.stringify(entry.value) === JSON.stringify(entry.defaultValue);

	return (
		<SettingCard title="Départements (connexion admin)" description="Liste proposée à l'étape « Qui êtes-vous ? ». « Autre » est toujours ajouté en dernier." entry={entry}
			onReset={() => confirm("Rétablir la liste par défaut ?") && save(null)} saving={saving}>
			<ul className="space-y-2">
				{list.map((d, i) => (
					<li key={`${d}-${i}`} className="flex items-center gap-3">
						<MoveButtons index={i} length={list.length} onMove={(from, to) => setList(moveItem(list, from, to))} label={d} />
						<input value={d} onChange={(e) => setList(list.map((x, idx) => (idx === i ? e.target.value : x)))} className={inputCls} maxLength={60} aria-label={`Département ${i + 1}`} />
						<button type="button" onClick={() => setList(list.filter((_, idx) => idx !== i))} disabled={list.length <= 1}
							className="text-red-400 hover:text-red-600 text-sm px-2 py-1 rounded-lg hover:bg-red-50 disabled:opacity-30" aria-label={`Retirer ${d}`}>✕</button>
					</li>
				))}
				<li className="flex items-center gap-3 pl-10 text-sm text-gray-400 italic">Autre (champ libre)</li>
			</ul>

			<div className="flex gap-2 mt-4">
				<input value={newItem} onChange={(e) => setNewItem(e.target.value)} placeholder="Nouveau département…" className={inputCls} maxLength={60}
					onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())} />
				<button type="button" className={btnSecondary} onClick={add}>+ Ajouter</button>
			</div>

			<SaveBar dirty={dirty} saving={saving} message={message} onSave={() => save(list.map((d) => d.trim()).filter(Boolean))}
				onCancel={() => setList(entry.value)} />
		</SettingCard>
	);
}

// ─── Blocs génériques ──────────────────────────────────────────────────────

function SettingCard({ title, description, entry, onReset, saving, children, showReset = true }) {
	return (
		<div className={`${cardCls} p-6`}>
			<div className="flex flex-wrap items-start justify-between gap-3 mb-4">
				<div>
					<h3 className="font-bold text-gray-900">{title}</h3>
					{description && <p className="text-sm text-gray-500 mt-0.5">{description}</p>}
					{entry && <LastModified at={entry.updatedAt} by={entry.updatedBy} isDefault={entry.isDefault} className="mt-1" />}
				</div>
				{showReset && entry && !entry.isDefault && (
					<button type="button" className={btnGhost} disabled={saving} onClick={onReset}>
						↺ Rétablir par défaut
					</button>
				)}
			</div>
			{children}
		</div>
	);
}

function SaveBar({ dirty, saving, message, onSave, onCancel, label = "Enregistrer" }) {
	return (
		<div className="flex flex-wrap items-center gap-3 mt-6 pt-4 border-t border-[rgba(13,110,187,0.1)]">
			<motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className={btnPrimary} disabled={!dirty || saving}
				onClick={onSave}>
				{saving ? "Enregistrement…" : label}
			</motion.button>
			{dirty && <button type="button" className={btnGhost} onClick={onCancel}>Annuler les changements</button>}
			{message && (
				<p className={`text-sm ${message.type === "ok" ? "text-[#0DBD9F]" : "text-red-500"}`} role="status">{message.text}</p>
			)}
		</div>
	);
}

/** Éditeur générique d'un bloc de réglages ({ key } sur /api/admin/settings). */
function SettingsEditor({ settingKey, entry, onSaved, children, onLocalChange }) {
	const [value, setValue] = useState(entry.value);
	const [saving, setSaving] = useState(false);
	const [message, setMessage] = useState(null);

	useEffect(() => {
		setValue(entry.value);
	}, [entry]);

	const dirty = JSON.stringify(value) !== JSON.stringify(entry.value);
	const set = (v) => {
		setValue(v);
		onLocalChange?.(v);
	};

	const save = async (val) => {
		setSaving(true);
		setMessage(null);
		try {
			onSaved(settingKey, await saveSiteSetting(settingKey, val));
			setMessage({ type: "ok", text: val === null ? "✓ Réglages par défaut rétablis" : "✓ Réglages enregistrés" });
		} catch (e) {
			setMessage({ type: "error", text: e.message });
		} finally {
			setSaving(false);
		}
	};

	return (
		<>
			{children({ value, set, saving })}
			<SaveBar dirty={dirty} saving={saving} message={message} onSave={() => save(value)} onCancel={() => set(entry.value)} />
			<input type="hidden" data-setting={settingKey} />
			<button type="button" hidden data-reset={settingKey} onClick={() => save(null)} />
		</>
	);
}

// ─── Identité ──────────────────────────────────────────────────────────────

function IdentityEditor({ entry, onSaved }) {
	return (
		<SettingsEditor settingKey="identity" entry={entry} onSaved={onSaved}>
			{({ value, set }) => (
				<div className="space-y-4">
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div>
							<label className={labelCls}>Nom de l’organisation</label>
							<input value={value.name || ""} onChange={(e) => set({ ...value, name: e.target.value })} maxLength={80} className={inputCls} />
						</div>
						<div>
							<label className={labelCls}>Slogan</label>
							<input value={value.slogan || ""} onChange={(e) => set({ ...value, slogan: e.target.value })} maxLength={160} className={inputCls} />
						</div>
					</div>
					<MediaPicker type="image" label="Logo (navbar, pied de page, JSON-LD)"
						value={value.logo === entry.defaultValue.logo ? null : value.logo} defaultValue={entry.defaultValue.logo}
						folder="identite" onChange={(v) => set({ ...value, logo: v ?? entry.defaultValue.logo })} previewClassName="w-32 h-32 mx-auto" />
					<MediaPicker type="image" label="Favicon (icône de l'onglet navigateur)"
						value={value.favicon === entry.defaultValue.favicon ? null : value.favicon} defaultValue={entry.defaultValue.favicon}
						folder="identite" onChange={(v) => set({ ...value, favicon: v ?? entry.defaultValue.favicon })} previewClassName="w-16 h-16 mx-auto" />
				</div>
			)}
		</SettingsEditor>
	);
}

// ─── Coordonnées & réseaux ─────────────────────────────────────────────────

function ContactEditor({ entry, onSaved }) {
	return (
		<SettingsEditor settingKey="contact" entry={entry} onSaved={onSaved}>
			{({ value, set }) => (
				<div className="space-y-4">
					<div>
						<label className={labelCls}>Téléphones</label>
						{(value.phones || []).map((p, i) => (
							<div key={i} className="flex gap-2 mb-1.5">
								<input value={p} onChange={(e) => set({ ...value, phones: value.phones.map((x, j) => (j === i ? e.target.value : x)) })}
									maxLength={30} className={inputCls} aria-label={`Téléphone ${i + 1}`} />
								<button type="button" onClick={() => set({ ...value, phones: value.phones.filter((_, j) => j !== i) })}
									className="text-red-400 hover:text-red-600 px-2" aria-label={`Retirer le téléphone ${i + 1}`}>✕</button>
							</div>
						))}
						<button type="button" className={btnGhost} onClick={() => set({ ...value, phones: [...(value.phones || []), ""] })}>+ Ajouter un téléphone</button>
					</div>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div>
							<label className={labelCls}>Email</label>
							<input value={value.email || ""} onChange={(e) => set({ ...value, email: e.target.value })} maxLength={120} className={inputCls} />
						</div>
						<div>
							<label className={labelCls}>Adresse</label>
							<input value={value.address || ""} onChange={(e) => set({ ...value, address: e.target.value })} maxLength={200} className={inputCls} />
						</div>
					</div>
				</div>
			)}
		</SettingsEditor>
	);
}

function SocialsEditor({ entry, onSaved }) {
	return (
		<SettingsEditor settingKey="socials" entry={entry} onSaved={onSaved}>
			{({ value, set }) => (
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					{SOCIAL_FIELDS.map((f) => (
						<div key={f.key}>
							<label className={labelCls}>{f.label}</label>
							<input value={value[f.key] || ""} onChange={(e) => set({ ...value, [f.key]: e.target.value })}
								placeholder="https://…" maxLength={500} className={inputCls} />
							<p className="text-[11px] text-gray-400 mt-0.5">Vide = masqué sur le site</p>
						</div>
					))}
				</div>
			)}
		</SettingsEditor>
	);
}

// ─── Typographie ───────────────────────────────────────────────────────────

function FontsEditor({ entry, onSaved }) {
	const [preview, setPreview] = useState(entry.value); // polices en cours d'essai
	useEffect(() => setPreview(entry.value), [entry]);
	const shown = preview;
	const fontUrl = googleFontsUrl(shown);

	return (
		<SettingsEditor settingKey="fonts" entry={entry} onSaved={onSaved} onLocalChange={setPreview}>
			{({ value, set }) => (
				<div className="space-y-5">
					{/* Charge les 2 polices affichées dans l'aperçu */}
					{/* eslint-disable-next-line @next/next/no-css-tags */}
					<link rel="stylesheet" href={fontUrl} />
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						{[
							{ key: "heading", label: "Police des titres" },
							{ key: "body", label: "Police du texte" },
						].map((f) => (
							<div key={f.key}>
								<label className={labelCls}>{f.label}</label>
								<select value={value[f.key] || "outfit"} onChange={(e) => set({ ...value, [f.key]: e.target.value })} className={inputCls}>
									{FONT_OPTIONS.map((o) => (
										<option key={o.id} value={o.id}>{o.label}</option>
									))}
								</select>
							</div>
						))}
					</div>
					<div className="rounded-2xl border border-[rgba(13,110,187,0.12)] bg-[#f7faff] p-5" aria-label="Aperçu des polices">
						<p className="text-[11px] uppercase tracking-[0.2em] text-gray-400 mb-3">Aperçu en direct</p>
						<p className="text-2xl font-bold" style={{ fontFamily: fontById(shown.heading).stack }}>
							Ensemble contre la pollution plastique
						</p>
						<p className="mt-2 text-sm leading-relaxed" style={{ fontFamily: fontById(shown.body).stack }}>
							BLUE mobilise citoyens et communautés pour lutter contre la pollution plastique et protéger l&apos;environnement en Côte d&apos;Ivoire.
						</p>
					</div>
				</div>
			)}
		</SettingsEditor>
	);
}

// ─── Couleurs ──────────────────────────────────────────────────────────────

const COLOR_FIELDS = [
	{ key: "primary", label: "Couleur principale", defaultHex: DEFAULT_COLORS.primary },
	{ key: "secondary", label: "Couleur secondaire", defaultHex: DEFAULT_COLORS.secondary },
	{ key: "dark", label: "Couleur foncée (titres, fonds)", defaultHex: DEFAULT_COLORS.dark },
];

function ColorsEditor({ entry, onSaved }) {
	return (
		<SettingsEditor settingKey="colors" entry={entry} onSaved={onSaved}>
			{({ value, set, saving }) => (
				<div className="space-y-5">
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
						{COLOR_FIELDS.map((f) => {
							const v = value[f.key] || f.defaultHex;
							const ok = isValidHex(v);
							const readable = ok && whiteTextReadable(v);
							return (
								<div key={f.key} className="rounded-2xl border border-[rgba(13,110,187,0.12)] p-4">
									<label className={labelCls}>{f.label}</label>
									<div className="flex items-center gap-3">
										<input type="color" value={ok ? v : f.defaultHex} onChange={(e) => set({ ...value, [f.key]: e.target.value.toUpperCase() })}
											className="w-12 h-10 rounded-lg cursor-pointer border border-gray-200" aria-label={`${f.label} — palette`} />
										<input value={v} onChange={(e) => set({ ...value, [f.key]: e.target.value.toUpperCase() })}
											maxLength={7} className={inputCls} aria-label={`${f.label} — code hexadécimal`} />
									</div>
									<p className={`text-[11px] mt-1.5 ${ok ? (readable ? "text-gray-400" : "text-amber-600") : "text-red-500"}`}>
										{!ok ? "Code hexadécimal invalide (#RRGGBB)" : readable ? "Texte blanc lisible ✓" : "⚠ Texte blanc peu lisible sur cette couleur"}
									</p>
								</div>
							);
						})}
					</div>
					{/* Aperçu */}
					{(() => {
						const p = paletteFrom(value);
						return (
							<div className="rounded-2xl border border-[rgba(13,110,187,0.12)] overflow-hidden" aria-label="Aperçu des couleurs">
								<div className="h-16 flex items-center justify-center text-white text-sm font-bold" style={{ background: `linear-gradient(90deg, ${p.primary}, ${p.secondary})` }}>
									Bouton principal · Dégradé
								</div>
								<div className="flex">
									<div className="flex-1 h-10 flex items-center justify-center text-white text-xs" style={{ background: p.navy }}>Fond foncé</div>
									<div className="flex-1 h-10 flex items-center justify-center text-white text-xs" style={{ background: p.primary }}>Principale</div>
									<div className="flex-1 h-10 flex items-center justify-center text-xs" style={{ background: p.secondary, color: whiteTextReadable(p.secondary) ? "#fff" : "#073A63" }}>Secondaire</div>
								</div>
							</div>
						);
					})()}
					<button type="button" className={btnGhost} disabled={saving}
						onClick={() => confirm("Rétablir les couleurs BLUE d'origine ?") && set({ ...DEFAULT_COLORS })}>
						↺ Rétablir les couleurs BLUE
					</button>
				</div>
			)}
		</SettingsEditor>
	);
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function AdminWebmasterPage() {
	const [settings, setSettings] = useState(null);
	const [error, setError] = useState(null);

	useEffect(() => {
		getAdminSettings()
			.then((res) => setSettings(res.settings))
			.catch((e) => setError(e.message));
	}, []);

	const onSaved = (key, res) => setSettings((s) => ({ ...s, [key]: res }));

	return (
		<div className="space-y-6 max-w-3xl">
			{error && <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">{error}</p>}
			{!settings ? (
				!error && <div className="h-64 bg-white rounded-2xl animate-pulse" />
			) : (
				<>
					<SettingCard title="Identité du site" description="Logo, favicon, nom et slogan utilisés dans la navbar, le pied de page et le référencement."
						entry={settings.identity} onReset={() => saveSiteSetting("identity", null).then((r) => onSaved("identity", r))}>
						<IdentityEditor entry={settings.identity} onSaved={onSaved} />
					</SettingCard>
					<SettingCard title="Coordonnées" description="Téléphones, email et adresse affichés dans le pied de page, la page contact et les données structurées (SEO)."
						entry={settings.contact} onReset={() => saveSiteSetting("contact", null).then((r) => onSaved("contact", r))}>
						<ContactEditor entry={settings.contact} onSaved={onSaved} />
					</SettingCard>
					<SettingCard title="Réseaux sociaux" description="Liens affichés dans le pied de page et la page contact. Un réseau vide est masqué."
						entry={settings.socials} onReset={() => saveSiteSetting("socials", null).then((r) => onSaved("socials", r))}>
						<SocialsEditor entry={settings.socials} onSaved={onSaved} />
					</SettingCard>
					<SettingCard title="Typographie" description="Police des titres et du texte. Seules les deux polices choisies sont chargées sur le site."
						entry={settings.fonts} onReset={() => saveSiteSetting("fonts", null).then((r) => onSaved("fonts", r))}>
						<FontsEditor entry={settings.fonts} onSaved={onSaved} />
					</SettingCard>
					<SettingCard title="Couleurs" description="Couleurs principale, secondaire et foncée, appliquées sur tout le site (boutons, navbar, titres…)."
						entry={settings.colors} onReset={() => saveSiteSetting("colors", null).then((r) => onSaved("colors", r))}>
						<ColorsEditor entry={settings.colors} onSaved={onSaved} />
					</SettingCard>
					<DepartmentsEditor />
				</>
			)}
		</div>
	);
}
