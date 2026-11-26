"use client";
import { useMemo, useState } from "react";
import { submitApplication } from "@/lib/store";
import { isValidCiPhone, DISPLAY_ONLY_TYPES, FILE_KINDS, fmtDateTime } from "@/lib/recruitmentModel";

const inputCls =
	"w-full px-4 py-2.5 border border-[rgb(var(--color-primary-rgb)/0.2)] rounded-xl text-sm outline-none focus:border-[var(--color-primary)] bg-white transition-colors";
const labelCls = "block text-gray-700 text-sm font-medium mb-1.5";

function fileAccept(field) {
	const exts = (field.fileKinds || []).flatMap((k) => (FILE_KINDS[k]?.exts || []).map((e) => `.${e}`));
	return exts.join(",");
}
function fileHelp(field) {
	const kinds = (field.fileKinds || []).map((k) => FILE_KINDS[k]?.label).filter(Boolean).join(", ");
	return `${kinds || "Fichier"} — ${field.maxSizeMb || 5} Mo max.`;
}

function validateClient(field, value, file) {
	const label = field.label || "Ce champ";
	if (DISPLAY_ONLY_TYPES.has(field.type)) return null;
	const empty = value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0);
	if (field.type === "file") {
		if (field.required && !file) return `${label} est obligatoire`;
		if (file && file.size > (field.maxSizeMb || 5) * 1024 * 1024) {
			return `${label} : ${field.maxSizeMb || 5} Mo maximum`;
		}
		return null;
	}
	if (field.required && empty) return `${label} est obligatoire`;
	if (empty) return null;
	if (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Adresse email invalide";
	if (field.type === "phone" && !isValidCiPhone(value)) return "Numéro ivoirien attendu (+225 puis 10 chiffres)";
	if (field.type === "number") {
		const n = Number(value);
		if (Number.isNaN(n)) return "Nombre invalide";
		if (field.min != null && n < field.min) return `Minimum ${field.min}`;
		if (field.max != null && n > field.max) return `Maximum ${field.max}`;
	}
	if (["select", "radio"].includes(field.type) && !(field.options || []).includes(value)) return "Choix invalide";
	return null;
}

/**
 * Formulaire dynamique — rendu depuis `form.fields`.
 * mode="public" : envoi réel + piège invisible. mode="preview" : tout désactivé.
 */
export default function DynamicForm({ form, mode = "public", submitLabel = "Envoyer ma candidature", onDone }) {
	const fields = useMemo(() => [...(form?.fields || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)), [form]);
	const [values, setValues] = useState({});
	const [files, setFiles] = useState({});
	const [errors, setErrors] = useState({});
	const [honeypot, setHoneypot] = useState("");
	const [sending, setSending] = useState(false);
	const [globalError, setGlobalError] = useState("");
	const [done, setDone] = useState(null);

	const setVal = (id, v) => setValues((p) => ({ ...p, [id]: v }));
	const setFile = (id, f) => setFiles((p) => ({ ...p, [id]: f }));

	const toggleCheckbox = (id, opt) => {
		const cur = Array.isArray(values[id]) ? values[id] : [];
		setVal(id, cur.includes(opt) ? cur.filter((o) => o !== opt) : [...cur, opt]);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (mode !== "public" || sending) return;
		setGlobalError("");
		const errs = {};
		for (const f of fields) {
			const err = validateClient(f, values[f.id], files[f.id]);
			if (err) errs[f.id] = err;
		}
		setErrors(errs);
		if (Object.keys(errs).length) {
			setGlobalError("Certains champs sont incomplets ou invalides — vérifiez le formulaire.");
			return;
		}
		setSending(true);
		try {
			const fd = new FormData();
			fd.set("answers", JSON.stringify(values));
			fd.set("website", honeypot); // piège invisible anti-spam
			for (const [fid, file] of Object.entries(files)) if (file) fd.set(`file_${fid}`, file);
			const res = await submitApplication(form.slug, fd);
			setDone(res);
			onDone?.(res);
		} catch (err) {
			setGlobalError(err.message || "Erreur lors de l'envoi. Réessayez.");
		} finally {
			setSending(false);
		}
	};

	const Err = ({ id }) => (errors[id] ? <p className="mt-1 text-xs text-red-500">{errors[id]}</p> : null);

	if (done) {
		return (
			<div className="text-center py-8">
				<div className="w-16 h-16 mx-auto rounded-full bg-[var(--color-secondary)]/15 text-[var(--color-secondary)] flex items-center justify-center text-3xl">✓</div>
				<p className="mt-5 text-[var(--color-dark)] font-semibold whitespace-pre-line">{done.message}</p>
				{(done.afterSubmitButtons || []).length > 0 && (
					<div className="mt-6 flex flex-wrap justify-center gap-3">
						{done.afterSubmitButtons.map((b) => (
							<a key={b.id} href={b.href}
								className={`inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold transition-all ${
									b.style === "secondary"
										? "border-2 border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white"
										: "bg-[var(--color-primary)] text-white hover:bg-[var(--color-secondary)]"
								}`}>
								{b.label} ↗
							</a>
						))}
					</div>
				)}
			</div>
		);
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-5" noValidate>
			{/* Champ piège — invisible pour les humains */}
			<div aria-hidden="true" className="absolute -left-[9999px] -top-[9999px] opacity-0 h-0 w-0 overflow-hidden" tabIndex={-1}>
				<label>Site web<input type="text" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} tabIndex={-1} autoComplete="off" /></label>
			</div>

			{fields.map((f) => {
				if (f.type === "heading") {
					return <h3 key={f.id} className="pt-4 text-lg font-bold text-[var(--color-dark)] border-b border-[rgb(var(--color-primary-rgb)/0.1)] pb-2">{f.label}</h3>;
				}
				if (f.type === "paragraph") {
					return <p key={f.id} className="text-sm text-gray-600 leading-relaxed">{f.help || f.label}</p>;
				}
				const v = values[f.id];
				return (
					<div key={f.id}>
						<label className={labelCls}>
							{f.label} {f.required && <span className="text-red-500">*</span>}
						</label>
						{f.type === "textarea" ? (
							<textarea className={inputCls + " min-h-[110px]"} value={v || ""} placeholder={f.placeholder || ""}
								disabled={mode !== "public"} onChange={(e) => setVal(f.id, e.target.value)} />
						) : f.type === "select" ? (
							<select className={inputCls} value={v || ""} disabled={mode !== "public"} onChange={(e) => setVal(f.id, e.target.value)}>
								<option value="">{f.placeholder || "— Choisissez —"}</option>
								{(f.options || []).map((o) => <option key={o} value={o}>{o}</option>)}
							</select>
						) : f.type === "radio" ? (
							<div className="flex flex-wrap gap-3">
								{(f.options || []).map((o) => (
									<label key={o} className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm cursor-pointer transition-colors ${v === o ? "border-[var(--color-primary)] bg-[rgb(var(--color-primary-rgb)/0.06)] text-[var(--color-primary)] font-medium" : "border-gray-200 text-gray-700 hover:border-[var(--color-primary)]/50"}`}>
										<input type="radio" className="sr-only" checked={v === o} disabled={mode !== "public"} onChange={() => setVal(f.id, o)} />
										{o}
									</label>
								))}
							</div>
						) : f.type === "checkboxes" ? (
							<div className="flex flex-wrap gap-3">
								{(f.options || []).map((o) => {
									const on = (Array.isArray(v) ? v : []).includes(o);
									return (
										<label key={o} className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm cursor-pointer transition-colors ${on ? "border-[var(--color-primary)] bg-[rgb(var(--color-primary-rgb)/0.06)] text-[var(--color-primary)] font-medium" : "border-gray-200 text-gray-700 hover:border-[var(--color-primary)]/50"}`}>
											<input type="checkbox" className="sr-only" checked={on} disabled={mode !== "public"} onChange={() => toggleCheckbox(f.id, o)} />
											{o}
										</label>
									);
								})}
							</div>
						) : f.type === "yesno" ? (
							<div className="flex gap-3">
								{[["oui", true], ["non", false]].map(([lbl, val]) => (
									<label key={lbl} className={`flex-1 text-center px-4 py-2.5 rounded-xl border text-sm cursor-pointer transition-colors ${v === val ? "border-[var(--color-primary)] bg-[rgb(var(--color-primary-rgb)/0.06)] text-[var(--color-primary)] font-medium" : "border-gray-200 text-gray-700 hover:border-[var(--color-primary)]/50"}`}>
										<input type="radio" className="sr-only" checked={v === val} disabled={mode !== "public"} onChange={() => setVal(f.id, val)} />
										{lbl === "oui" ? "Oui" : "Non"}
									</label>
								))}
							</div>
						) : f.type === "file" ? (
							<div>
								<label className={`flex items-center justify-center gap-2 border-2 border-dashed rounded-xl px-4 py-5 text-sm cursor-pointer transition-colors ${files[f.id] ? "border-[var(--color-secondary)] bg-[var(--color-secondary)]/5 text-[var(--color-secondary)]" : "border-[rgb(var(--color-primary-rgb)/0.2)] text-gray-500 hover:border-[var(--color-primary)]/50"}`}>
									<input type="file" className="sr-only" accept={fileAccept(f)} disabled={mode !== "public"}
										onChange={(e) => setFile(f.id, e.target.files?.[0] || null)} />
									{files[f.id] ? `📎 ${files[f.id].name}` : "📎 Choisir un fichier"}
								</label>
								<p className="mt-1 text-xs text-gray-400">{fileHelp(f)}</p>
							</div>
						) : (
							<input
								type={f.type === "phone" ? "tel" : f.type}
								className={inputCls} value={v ?? ""} placeholder={f.placeholder || ""}
								disabled={mode !== "public"} onChange={(e) => setVal(f.id, e.target.value)} />
						)}
						{f.help && f.type !== "file" && f.type !== "paragraph" && <p className="mt-1 text-xs text-gray-400">{f.help}</p>}
						<Err id={f.id} />
					</div>
				);
			})}

			{globalError && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">{globalError}</p>}

			{mode === "public" && (
				<button type="submit" disabled={sending}
					className="w-full rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white px-8 py-3.5 text-sm font-semibold hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
					{sending ? "Envoi en cours…" : submitLabel}
				</button>
			)}
			{mode === "preview" && (
				<button type="button" disabled
					className="w-full rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white px-8 py-3.5 text-sm font-semibold opacity-60 cursor-not-allowed">
					{submitLabel} (aperçu)
				</button>
			)}
		</form>
	);
}
