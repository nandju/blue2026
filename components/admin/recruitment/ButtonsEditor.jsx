"use client";
import MoveButtons from "@/components/admin/MoveButtons";
import { BUTTON_ICONS, BUTTON_STYLES, BUTTON_VISIBILITIES, DEFAULT_BUTTON } from "@/lib/recruitmentModel";
import { inputCls, labelCls, btnSecondary, btnGhost } from "@/components/admin/ui";

/** Boutons-liens : l'URL n'est jamais exposée côté site (redirection /go/). */
export default function ButtonsEditor({ buttons = [], onChange, slug }) {
	const move = (index, dir) => {
		const next = [...buttons];
		const j = index + dir;
		if (j < 0 || j >= next.length) return;
		[next[index], next[j]] = [next[j], next[index]];
		onChange(next);
	};
	const update = (index, patch) => {
		const next = [...buttons];
		next[index] = { ...next[index], ...patch };
		onChange(next);
	};
	const remove = (index) => {
		if (!window.confirm(`Supprimer le bouton « ${buttons[index].label} » ?`)) return;
		onChange(buttons.filter((_, i) => i !== index));
	};

	return (
		<div className="space-y-4">
			<p className="text-xs text-gray-500 bg-gray-50 rounded-xl px-4 py-2.5">
				L&rsquo;URL réelle n&rsquo;apparaît jamais côté navigateur : chaque bouton pointe vers
				<code className="mx-1 px-1.5 py-0.5 bg-white rounded border border-gray-200">/go/{slug || "slug"}/…</code>
				qui redirige côté serveur (302, sans référent). Les clics sont comptés.
			</p>

			{buttons.map((b, i) => (
				<div key={b.id} className="border border-gray-200 rounded-2xl p-4 space-y-3">
					<div className="flex items-center gap-3">
						<MoveButtons index={i} length={buttons.length} onMove={(dir) => move(i, dir)} label={`le bouton « ${b.label} »`} />
						<span className="text-xs text-gray-400">{(b.clicks || 0) > 0 ? `${b.clicks} clic(s)` : ""}</span>
						<button onClick={() => remove(i)} className={btnGhost + " !text-red-500 ml-auto"}>Supprimer</button>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
						<div>
							<label className={labelCls}>Libellé *</label>
							<input className={inputCls} value={b.label} onChange={(e) => update(i, { label: e.target.value })}
								placeholder="Rejoindre le groupe des nouveaux" />
						</div>
						<div>
							<label className={labelCls}>URL de destination * <span className="text-gray-400 font-normal">(jamais affichée)</span></label>
							<input className={inputCls} value={b.url} onChange={(e) => update(i, { url: e.target.value })}
								placeholder="https://…" />
						</div>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
						<div>
							<label className={labelCls}>Icône</label>
							<select className={inputCls} value={b.icon} onChange={(e) => update(i, { icon: e.target.value })}>
								{Object.entries(BUTTON_ICONS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
							</select>
						</div>
						<div>
							<label className={labelCls}>Style</label>
							<select className={inputCls} value={b.style} onChange={(e) => update(i, { style: e.target.value })}>
								{Object.entries(BUTTON_STYLES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
							</select>
						</div>
						<div>
							<label className={labelCls}>Visibilité</label>
							<select className={inputCls} value={b.visibility} onChange={(e) => update(i, { visibility: e.target.value })}>
								{Object.entries(BUTTON_VISIBILITIES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
							</select>
						</div>
					</div>
					{b.visibility === "afterSubmit" && (
						<p className="text-[11px] text-amber-600">Affiché uniquement sur l&rsquo;écran de confirmation après l&rsquo;envoi — le lien exige le jeton remis à la soumission (valable 7 jours).</p>
					)}
				</div>
			))}

			<button onClick={() => onChange([...buttons, DEFAULT_BUTTON()])} className={btnSecondary}>+ Ajouter un bouton</button>
		</div>
	);
}
