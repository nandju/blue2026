"use client";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { generateCourseFromPdf } from "@/lib/store";
import { UPLOAD_LIMITS, formatBytes } from "@/lib/uploadLimits";
import { inputCls, labelCls, btnPrimary, btnSecondary } from "@/components/admin/ui";

const STEPS = ["Téléversement", "Lecture du document", "Génération", "Terminé"];

// « Créer depuis un PDF » : envoi du document + options, puis la formation
// est créée en brouillon par /api/admin/courses/generate.
export default function GenerateFromPdf({ onDone, onClose }) {
	const [file, setFile] = useState(null);
	const [options, setOptions] = useState({ modules: "auto", questions: 10, level: "Débutant", audience: "", lang: "français" });
	const [step, setStep] = useState(0); // index dans STEPS
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState("");
	const inputRef = useRef(null);
	const timers = useRef([]);

	useEffect(() => () => timers.current.forEach(clearTimeout), []);

	const pick = (f) => {
		setError("");
		if (!f) return;
		if (f.type !== "application/pdf" && !/\.pdf$/i.test(f.name)) {
			setError("Seuls les fichiers PDF sont acceptés.");
			return;
		}
		if (f.size > UPLOAD_LIMITS.pdf.maxBytes) {
			setError(`Le fichier dépasse la taille maximale de ${formatBytes(UPLOAD_LIMITS.pdf.maxBytes)}.`);
			return;
		}
		setFile(f);
	};

	const submit = async () => {
		if (!file || busy) return;
		setBusy(true);
		setError("");
		setStep(0);
		// Étapes indicatives pendant l'appel unique (le serveur fait tout).
		timers.current = [1200, 4000].map((ms, i) => setTimeout(() => setStep(i + 1), ms));
		try {
			const res = await generateCourseFromPdf(file, options);
			setStep(3);
			setTimeout(() => onDone(res), 600);
		} catch (e) {
			setError(e.message || "La génération a échoué.");
			setStep(0);
		} finally {
			timers.current.forEach(clearTimeout);
			setBusy(false);
		}
	};

	return (
		<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
			className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4">
			<motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
				className="bg-white rounded-2xl shadow-2xl w-full max-w-xl p-6" role="dialog" aria-modal="true">
				<div className="flex items-center justify-between mb-4">
					<h3 className="text-lg font-bold text-gray-900">Créer une formation depuis un PDF</h3>
					<button onClick={onClose} disabled={busy} className="text-gray-400 hover:text-gray-600 text-xl" aria-label="Fermer">✕</button>
				</div>

				{!busy ? (
					<div className="space-y-4">
						<button type="button" onClick={() => inputRef.current?.click()}
							className="w-full border-2 border-dashed border-[rgba(13,110,187,0.3)] rounded-2xl p-6 text-center hover:bg-[rgba(13,110,187,0.03)] transition-colors">
							<span className="text-3xl">📄</span>
							{file ? (
								<p className="mt-2 text-sm font-semibold text-gray-800">{file.name} <span className="text-gray-400 font-normal">({formatBytes(file.size)})</span></p>
							) : (
								<p className="mt-2 text-sm text-gray-500">Cliquez pour choisir un PDF (≤ {formatBytes(UPLOAD_LIMITS.pdf.maxBytes)})</p>
							)}
						</button>
						<input ref={inputRef} type="file" hidden accept="application/pdf,.pdf" onChange={(e) => pick(e.target.files?.[0])} />

						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className={labelCls}>Nombre de modules</label>
								<select value={options.modules} onChange={(e) => setOptions((o) => ({ ...o, modules: e.target.value === "auto" ? "auto" : Number(e.target.value) }))} className={inputCls}>
									<option value="auto">Automatique</option>
									{[3, 4, 5, 6, 7, 8, 9, 10].map((n) => <option key={n} value={n}>{n} modules</option>)}
								</select>
							</div>
							<div>
								<label className={labelCls}>Questions du quiz</label>
								<select value={options.questions} onChange={(e) => setOptions((o) => ({ ...o, questions: Number(e.target.value) }))} className={inputCls}>
									{Array.from({ length: 16 }, (_, i) => i + 5).map((n) => <option key={n} value={n}>{n} questions</option>)}
								</select>
							</div>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className={labelCls}>Niveau visé</label>
								<select value={options.level} onChange={(e) => setOptions((o) => ({ ...o, level: e.target.value }))} className={inputCls}>
									<option>Débutant</option><option>Intermédiaire</option><option>Avancé</option>
								</select>
							</div>
							<div>
								<label className={labelCls}>Langue</label>
								<input value={options.lang} onChange={(e) => setOptions((o) => ({ ...o, lang: e.target.value }))} className={inputCls} />
							</div>
						</div>
						<div>
							<label className={labelCls}>Public visé (optionnel)</label>
							<input value={options.audience} onChange={(e) => setOptions((o) => ({ ...o, audience: e.target.value }))}
								placeholder="Ex : étudiants, agriculteurs, membres BLUE…" className={inputCls} />
						</div>

						{error && <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2" role="alert">{error}</p>}
						<div className="flex gap-3">
							<motion.button onClick={submit} disabled={!file} whileHover={{ scale: 1.02 }} className={`flex-1 ${btnPrimary}`}>
								✨ Générer la formation (brouillon)
							</motion.button>
							<button onClick={onClose} className={btnSecondary}>Annuler</button>
						</div>
					</div>
				) : (
					<div className="py-6">
						<div className="space-y-3 max-w-xs mx-auto">
							{STEPS.map((s, i) => (
								<div key={s} className={`flex items-center gap-3 text-sm ${i < step ? "text-[#0a8f78]" : i === step ? "text-[#0D6EBB] font-semibold" : "text-gray-300"}`}>
									<span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs border-2 ${i < step ? "border-[#0a8f78] bg-[rgba(13,189,159,0.1)]" : i === step ? "border-[#0D6EBB]" : "border-gray-200"}`}>
										{i < step ? "✓" : i + 1}
									</span>
									{s}
									{i === step && <span className="ml-auto w-4 h-4 rounded-full border-2 border-[#0D6EBB] border-t-transparent animate-spin" />}
								</div>
							))}
						</div>
						<p className="text-center text-xs text-gray-400 mt-6">La génération peut prendre jusqu&apos;à une minute.</p>
						{error && <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2 mt-4" role="alert">{error}</p>}
					</div>
				)}
			</motion.div>
		</motion.div>
	);
}
