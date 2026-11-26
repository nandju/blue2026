"use client";
import { useState } from "react";
import MoveButtons from "@/components/admin/MoveButtons";
import { FIELD_TYPES, FIELD_TYPE_KEYS, OPTION_TYPES, DISPLAY_ONLY_TYPES, FILE_KINDS, DEFAULT_FIELD, newFieldId } from "@/lib/recruitmentModel";
import { inputCls, labelCls, btnSecondary, btnGhost } from "@/components/admin/ui";

function FieldEditor({ field, onChange, hasSubmissions }) {
	const set = (p) => {
		if (hasSubmissions && p.type && p.type !== field.type) {
			if (!window.confirm(`Des candidatures existent déjà : changer le type de « ${field.label} » peut rendre les réponses existantes illisibles dans le tableau. Continuer ?`)) return;
		}
		onChange({ ...field, ...p });
	};
	const isOptions = OPTION_TYPES.has(field.type);
	const isDisplay = DISPLAY_ONLY_TYPES.has(field.type);
	const isNumber = field.type === "number";
	const isFile = field.type === "file";

	return (
		<div className="space-y-3">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
				<div>
					<label className={labelCls}>Libellé *</label>
					<input className={inputCls} value={field.label} onChange={(e) => set({ label: e.target.value })} />
				</div>
				<div>
					<label className={labelCls}>Type</label>
					<select className={inputCls} value={field.type} onChange={(e) => set({ type: e.target.value })}>
						{FIELD_TYPE_KEYS.map((t) => <option key={t} value={t}>{FIELD_TYPES[t]}</option>)}
					</select>
				</div>
			</div>

			{!isDisplay && (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
					<div>
						<label className={labelCls}>Placeholder</label>
						<input className={inputCls} value={field.placeholder || ""} onChange={(e) => set({ placeholder: e.target.value })} />
					</div>
					<div>
						<label className={labelCls}>Texte d&rsquo;aide</label>
						<input className={inputCls} value={field.help || ""} onChange={(e) => set({ help: e.target.value })} />
					</div>
				</div>
			)}
			{field.type === "paragraph" && (
				<div>
					<label className={labelCls}>Texte affiché</label>
					<textarea className={inputCls + " min-h-[70px]"} value={field.help || ""} onChange={(e) => set({ help: e.target.value })} />
				</div>
			)}

			{isOptions && (
				<div>
					<label className={labelCls}>Options (une par ligne) *</label>
					<textarea className={inputCls + " min-h-[90px] font-mono text-xs"} value={(field.options || []).join("\n")}
						onChange={(e) => set({ options: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) })} />
				</div>
			)}

			{isNumber && (
				<div className="grid grid-cols-2 gap-3">
					<div>
						<label className={labelCls}>Minimum</label>
						<input type="number" className={inputCls} value={field.min ?? ""} onChange={(e) => set({ min: e.target.value === "" ? null : Number(e.target.value) })} />
					</div>
					<div>
						<label className={labelCls}>Maximum</label>
						<input type="number" className={inputCls} value={field.max ?? ""} onChange={(e) => set({ max: e.target.value === "" ? null : Number(e.target.value) })} />
					</div>
				</div>
			)}

			{isFile && (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
					<div>
						<label className={labelCls}>Types autorisés</label>
						<div className="flex flex-wrap gap-3 pt-1">
							{Object.entries(FILE_KINDS).map(([k, v]) => (
								<label key={k} className="flex items-center gap-1.5 text-sm text-gray-700 cursor-pointer">
									<input type="checkbox" className="w-4 h-4 accent-[#0D6EBB]"
										checked={(field.fileKinds || []).includes(k)}
										onChange={(e) => set({ fileKinds: e.target.checked ? [...(field.fileKinds || []), k] : (field.fileKinds || []).filter((x) => x !== k) })} />
									{v.label}
								</label>
							))}
						</div>
					</div>
					<div>
						<label className={labelCls}>Taille max (Mo)</label>
						<input type="number" min="1" max="50" className={inputCls} value={field.maxSizeMb || 5}
							onChange={(e) => set({ maxSizeMb: Number(e.target.value) || 5 })} />
					</div>
				</div>
			)}

			{!isDisplay && (
				<div className="flex flex-wrap gap-5 pt-1">
					<label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
						<input type="checkbox" checked={!!field.required} onChange={(e) => set({ required: e.target.checked })} className="w-4 h-4 accent-[#0D6EBB]" />
						Obligatoire
					</label>
					<label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
						<input type="checkbox" checked={!!field.showInTable} onChange={(e) => set({ showInTable: e.target.checked })} className="w-4 h-4 accent-[#0D6EBB]" />
						Afficher en colonne dans le tableau des candidatures
					</label>
				</div>
			)}
			<p className="text-[10px] text-gray-300 font-mono">id : {field.id}</p>
		</div>
	);
}

export default function FieldsBuilder({ fields = [], onChange, hasSubmissions }) {
	const [openId, setOpenId] = useState(null);
	const [addType, setAddType] = useState("text");

	const move = (index, dir) => {
		const next = [...fields];
		const j = index + dir;
		if (j < 0 || j >= next.length) return;
		[next[index], next[j]] = [next[j], next[index]];
		onChange(next);
	};
	const update = (index, field) => {
		const next = [...fields];
		next[index] = field;
		onChange(next);
	};
	const remove = (index) => {
		const f = fields[index];
		if (hasSubmissions && !window.confirm(`Des candidatures existent déjà : supprimer « ${f.label} » retire ce champ du futur formulaire (les réponses existantes restent consultables dans les fiches). Continuer ?`)) return;
		if (!hasSubmissions && !window.confirm(`Supprimer le champ « ${f.label} » ?`)) return;
		onChange(fields.filter((_, i) => i !== index));
	};
	const duplicate = (index) => {
		const copy = { ...fields[index], id: newFieldId(), label: `${fields[index].label} (copie)` };
		const next = [...fields];
		next.splice(index + 1, 0, copy);
		onChange(next);
	};
	const add = () => {
		const f = DEFAULT_FIELD(addType);
		f.label = FIELD_TYPES[addType];
		onChange([...fields, f]);
		setOpenId(f.id);
	};

	return (
		<div className="space-y-4">
			{hasSubmissions && (
				<p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5">
					⚠️ Des candidatures existent déjà : vous serez averti avant de supprimer un champ ou d&rsquo;en changer le type.
				</p>
			)}
			{fields.map((f, i) => (
				<div key={f.id} className="border border-gray-200 rounded-2xl">
					<button type="button" onClick={() => setOpenId(openId === f.id ? null : f.id)}
						className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 rounded-2xl">
						<MoveButtons index={i} length={fields.length} onMove={(dir) => move(i, dir)} label={`le champ « ${f.label} »`} />
						<span className="text-xs font-mono text-[#0DBD9F] uppercase">{FIELD_TYPES[f.type] || f.type}</span>
						<span className="flex-1 text-sm font-medium text-gray-800 truncate">{f.label || "(sans libellé)"}</span>
						{f.required && <span className="text-red-500 text-xs">*</span>}
						<span className="text-gray-400 text-xs">{openId === f.id ? "▲" : "▼"}</span>
					</button>
					{openId === f.id && (
						<div className="px-4 pb-4 border-t border-gray-100 pt-4">
							<FieldEditor field={f} onChange={(nf) => update(i, nf)} hasSubmissions={hasSubmissions} />
							<div className="flex gap-3 mt-4 pt-3 border-t border-gray-100">
								<button onClick={() => duplicate(i)} className={btnGhost}>Dupliquer</button>
								<button onClick={() => remove(i)} className={btnGhost + " !text-red-500"}>Supprimer</button>
							</div>
						</div>
					)}
				</div>
			))}

			<div className="flex items-center gap-3 pt-2">
				<select className={inputCls + " !w-auto"} value={addType} onChange={(e) => setAddType(e.target.value)}>
					{FIELD_TYPE_KEYS.map((t) => <option key={t} value={t}>{FIELD_TYPES[t]}</option>)}
				</select>
				<button onClick={add} className={btnSecondary}>+ Ajouter ce champ</button>
			</div>
		</div>
	);
}
