"use client";
import MediaPicker from "./MediaPicker";
import GalleryEditor from "./GalleryEditor";
import MoveButtons, { moveItem } from "./MoveButtons";
import { ICON_OPTIONS } from "@/lib/content/icons";
import { inputCls, labelCls, btnGhost, btnSecondary } from "./ui";

const getPath = (obj, path) => String(path).split(".").reduce((o, k) => (o == null ? o : o[k]), obj);
const setPath = (obj, path, v) => {
	const keys = String(path).split(".");
	const last = keys.pop();
	const target = keys.reduce((o, k) => (o[k] = o[k] ?? {}), obj);
	if (v === undefined) delete target[last];
	else target[last] = v;
};

/**
 * Édite un objet d'« overrides » selon le schéma d'une section.
 * Convention : clé absente = valeur par défaut ; les champs montrent la valeur
 * par défaut en grisé et proposent « Rétablir par défaut ».
 *
 * props :
 *  - schema    : { fields: [...] }
 *  - overrides : objet de personnalisation (état local)
 *  - defaults  : valeurs par défaut de la section
 *  - onChange  : (newOverrides) => void
 */
export default function SectionFields({ schema, overrides, defaults, onChange }) {
	return (
		<div className="space-y-5">
			{schema.fields.map((field) => (
				<Field
					key={field.path || field.key}
					field={field}
					overrides={overrides}
					defaults={defaults}
					onChange={onChange}
					pathPrefix=""
				/>
			))}
		</div>
	);
}

function Field({ field, overrides, defaults, onChange, pathPrefix }) {
	const path = pathPrefix ? `${pathPrefix}.${field.path || field.key}` : field.path || field.key;
	const over = getPath(overrides, path);
	const def = getPath(defaults, path);
	const isDefault = over === undefined || over === null;
	const effective = isDefault ? def : over;

	const set = (v) => {
		const next = structuredClone(overrides || {});
		setPath(next, path, v === null ? undefined : v);
		onChange(next);
	};
	const reset = () => {
		const next = structuredClone(overrides || {});
		setPath(next, path, undefined);
		onChange(next);
	};

	const head = (
		<div className="flex items-center justify-between gap-3 mb-1.5">
			<label className={labelCls + " mb-0"}>{field.label}</label>
			{!isDefault && (
				<button type="button" className={btnGhost} onClick={reset}>
					↺ Rétablir par défaut
				</button>
			)}
		</div>
	);
	const defaultHint = isDefault && def !== undefined && def !== null && def !== "" && field.type !== "gallery" && field.type !== "list" && field.type !== "image" && field.type !== "video" && (
		<p className="text-[11px] text-gray-400 mt-1">Valeur par défaut utilisée.</p>
	);

	switch (field.type) {
		case "textarea":
			return (
				<div>
					{head}
					<textarea
						value={effective || ""}
						onChange={(e) => set(e.target.value)}
						maxLength={field.max}
						rows={Math.min(8, Math.max(3, Math.ceil((field.max || 400) / 120)))}
						className={inputCls}
					/>
					{defaultHint}
				</div>
			);
		case "text":
			return (
				<div>
					{head}
					<input value={effective || ""} onChange={(e) => set(e.target.value)} maxLength={field.max} className={inputCls} />
					{defaultHint}
				</div>
			);
		case "select":
			return (
				<div>
					{head}
					<select value={effective ?? ""} onChange={(e) => set(e.target.value)} className={inputCls}>
						{(field.options || []).map((o) => (
							<option key={o.value} value={o.value}>{o.label}</option>
						))}
					</select>
				</div>
			);
		case "icon":
			return (
				<div>
					{head}
					<select value={effective || "bullseye"} onChange={(e) => set(e.target.value)} className={inputCls}>
						{ICON_OPTIONS.map((o) => (
							<option key={o.value} value={o.value}>{o.label}</option>
						))}
					</select>
				</div>
			);
		case "image":
		case "video":
			return (
				<div>
					{head}
					<MediaPicker
						type={field.type}
						value={isDefault ? null : over}
						defaultValue={def || null}
						onChange={(v) => set(v)}
						folder={field.folder || "general"}
						label={undefined}
					/>
				</div>
			);
		case "gallery":
			return (
				<div>
					{head}
					<GalleryEditor
						value={isDefault ? null : over}
						defaultItems={def || []}
						onChange={(v) => set(v)}
						folder={field.folder || "general"}
						max={field.max}
					/>
				</div>
			);
		case "link": {
			const v = effective || { label: "", href: "" };
			return (
				<div>
					{head}
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
						<input value={v.label || ""} onChange={(e) => set({ ...v, label: e.target.value })} placeholder="Libellé" maxLength={60} className={inputCls} aria-label={`${field.label} — libellé`} />
						<input value={v.href || ""} onChange={(e) => set({ ...v, href: e.target.value })} placeholder="Lien (/, https://, mailto:, tel:)" maxLength={500} className={inputCls} aria-label={`${field.label} — lien`} />
					</div>
					{defaultHint}
				</div>
			);
		}
		case "stringlist": {
			const items = Array.isArray(effective) && effective.length ? effective : Array.isArray(def) ? def : [];
			const commit = (list) => set(list.length ? list : undefined);
			return (
				<div>
					{head}
					<ul className="space-y-2">
						{items.map((it, i) => (
							<li key={i} className="flex items-start gap-2">
								<MoveButtons index={i} length={items.length} onMove={(a, b) => commit(moveItem(items, a, b))} label={`l'élément ${i + 1}`} />
								{field.textarea ? (
									<textarea value={it} onChange={(e) => commit(items.map((x, j) => (j === i ? e.target.value : x)))} rows={3} className={inputCls} aria-label={`${field.label} ${i + 1}`} />
								) : (
									<input value={it} onChange={(e) => commit(items.map((x, j) => (j === i ? e.target.value : x)))} className={inputCls} aria-label={`${field.label} ${i + 1}`} />
								)}
								<button type="button" onClick={() => commit(items.filter((_, j) => j !== i))}
									className="text-red-400 hover:text-red-600 text-sm px-2 py-2 rounded-lg hover:bg-red-50" aria-label={`Retirer l'élément ${i + 1}`}>✕</button>
							</li>
						))}
					</ul>
					<button type="button" className={btnSecondary + " mt-2"} disabled={items.length >= (field.max || 30)}
						onClick={() => commit([...items, ""])}>
						{field.addLabel || "+ Ajouter"}
					</button>
					{field.help && <p className="text-[11px] text-gray-400 mt-1">{field.help}</p>}
				</div>
			);
		}
		case "list": {
			const items = Array.isArray(effective) && effective.length ? effective : Array.isArray(def) ? def : [];
			const commit = (list) => set(list.length ? list : undefined);
			const updateItem = (i, key, v) => commit(items.map((x, j) => (j === i ? { ...x, [key]: v } : x)));
			const blank = Object.fromEntries((field.itemFields || []).map((f) => [f.key, f.type === "link" ? { label: "", href: "" } : f.type === "list" || f.type === "stringlist" ? [] : ""]));
			return (
				<div>
					{head}
					<ul className="space-y-3">
						{items.map((it, i) => (
							<li key={i} className="bg-[#f7faff] rounded-xl border border-[rgba(13,110,187,0.12)] p-4">
								<div className="flex items-center justify-between gap-3 mb-3">
									<div className="flex items-center gap-2 min-w-0">
										<MoveButtons index={i} length={items.length} onMove={(a, b) => commit(moveItem(items, a, b))} label={`l'élément ${i + 1}`} />
										<span className="text-sm font-semibold text-[var(--color-primary)] truncate">
											{field.itemLabel ? field.itemLabel(it) : `Élément ${i + 1}`}
										</span>
									</div>
									<button type="button" onClick={() => commit(items.filter((_, j) => j !== i))}
										className="text-red-400 hover:text-red-600 text-sm px-2 py-1 rounded-lg hover:bg-red-50" aria-label={`Supprimer l'élément ${i + 1}`}>✕</button>
								</div>
								<div className="grid grid-cols-1 gap-3">
									{(field.itemFields || []).map((sub) => (
										<SubField key={sub.key} field={sub} item={it} index={i} onChange={(v) => updateItem(i, sub.key, v)} />
									))}
								</div>
							</li>
						))}
					</ul>
					<button type="button" className={btnSecondary + " mt-2"} disabled={items.length >= (field.max || 30)}
						onClick={() => commit([...items, { ...blank }])}>
						{field.addLabel || "+ Ajouter"}
					</button>
				</div>
			);
		}
		default:
			return null;
	}
}

/** Champ à l'intérieur d'un élément de liste (sous-formulaire simplifié). */
function SubField({ field, item, index, onChange }) {
	const v = item?.[field.key];
	const mini = "text-xs text-gray-500 mb-1 block";
	switch (field.type) {
		case "textarea":
			return (
				<div>
					<span className={mini}>{field.label}{field.required ? " *" : ""}</span>
					<textarea value={v || ""} onChange={(e) => onChange(e.target.value)} maxLength={field.max} rows={3} className={inputCls} />
				</div>
			);
		case "image":
		case "video":
			return (
				<div>
					<span className={mini}>{field.label}</span>
					<MediaPicker type={field.type} value={v ?? null} defaultValue={null} onChange={onChange} folder={field.folder || "general"}
						previewClassName="w-full aspect-[16/6]" />
				</div>
			);
		case "gallery":
			return (
				<div>
					<span className={mini}>{field.label}</span>
					<GalleryEditor value={v || null} defaultItems={[]} onChange={onChange} folder={field.folder || "general"} max={field.max} />
				</div>
			);
		case "icon":
			return (
				<div>
					<span className={mini}>{field.label}</span>
					<select value={v || "bullseye"} onChange={(e) => onChange(e.target.value)} className={inputCls}>
						{ICON_OPTIONS.map((o) => (
							<option key={o.value} value={o.value}>{o.label}</option>
						))}
					</select>
				</div>
			);
		case "select":
			return (
				<div>
					<span className={mini}>{field.label}</span>
					<select value={v ?? field.options?.[0]?.value ?? ""} onChange={(e) => onChange(e.target.value)} className={inputCls}>
						{(field.options || []).map((o) => (
							<option key={o.value} value={o.value}>{o.label}</option>
						))}
					</select>
				</div>
			);
		case "link": {
			const val = v || { label: "", href: "" };
			return (
				<div>
					<span className={mini}>{field.label}</span>
					<div className="grid grid-cols-2 gap-2">
						<input value={val.label || ""} onChange={(e) => onChange({ ...val, label: e.target.value })} placeholder="Libellé" className={inputCls} aria-label={`${field.label} — libellé`} />
						<input value={val.href || ""} onChange={(e) => onChange({ ...val, href: e.target.value })} placeholder="Lien" className={inputCls} aria-label={`${field.label} — lien`} />
					</div>
				</div>
			);
		}
		case "stringlist": {
			const items = Array.isArray(v) ? v : [];
			return (
				<div>
					<span className={mini}>{field.label}</span>
					{items.map((s, i) => (
						<div key={i} className="flex gap-2 mb-1.5">
							<input value={s} onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))} className={inputCls} aria-label={`${field.label} ${i + 1}`} />
							<button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} className="text-red-400 px-2" aria-label={`Retirer ${i + 1}`}>✕</button>
						</div>
					))}
					<button type="button" className={btnGhost} onClick={() => onChange([...items, ""])}>+ Ajouter</button>
				</div>
			);
		}
		default:
			return (
				<div>
					<span className={mini}>{field.label}{field.required ? " *" : ""}</span>
					<input value={v || ""} onChange={(e) => onChange(e.target.value)} maxLength={field.max} className={inputCls} data-index={index} />
				</div>
			);
	}
}
