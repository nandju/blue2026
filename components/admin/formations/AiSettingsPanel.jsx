"use client";
import { useState, useEffect, useCallback } from "react";
import { getAdminSettings, saveSiteSetting } from "@/lib/store";
import LastModified from "@/components/admin/LastModified";
import { inputCls, labelCls, btnPrimary } from "@/components/admin/ui";

const PROVIDER_INFO = {
	google: {
		label: "Google Gemini",
		help: "Le PDF est envoyé directement au modèle (lecture native des PDF). Clé : GOOGLE_GENERATIVE_AI_API_KEY.",
	},
	groq: {
		label: "Groq",
		help: "Le texte du PDF est extrait puis envoyé au modèle (documents longs résumés automatiquement). Clé : GROQ_API_KEY.",
	},
};

// Réglages IA : fournisseur principal et modèle par fournisseur pour la
// génération de formations. Si le principal échoue ou sa clé manque, la
// génération bascule automatiquement sur un autre fournisseur configuré.
export default function AiSettingsPanel() {
	const [entry, setEntry] = useState(undefined);
	const [form, setForm] = useState(null);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");
	const [saved, setSaved] = useState(false);

	const load = useCallback(() => {
		getAdminSettings()
			.then(({ settings }) => {
				setEntry(settings.ai);
				setForm(settings.ai?.value || null);
			})
			.catch((e) => setError(e.message));
	}, []);
	useEffect(() => { load(); }, [load]);

	const providerKeys = Object.keys({ ...(form?.models || {}), google: "", groq: "" });

	const save = async () => {
		setSaving(true);
		setError("");
		try {
			const res = await saveSiteSetting("ai", form);
			setEntry(res);
			setForm(res.value);
			setSaved(true);
			setTimeout(() => setSaved(false), 2500);
		} catch (e) {
			setError(e.message);
		} finally {
			setSaving(false);
		}
	};

	if (!form) {
		return error
			? <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">{error}</p>
			: <div className="h-64 bg-white rounded-xl animate-pulse" />;
	}

	return (
		<div className="max-w-2xl">
			<div className="flex items-center justify-between mb-6">
				<h2 className="text-xl font-bold text-gray-900">Réglages IA (génération de formations)</h2>
				<LastModified at={entry?.updatedAt} by={entry?.updatedBy} />
			</div>

			<div className="space-y-5">
				<div className="bg-white rounded-xl border border-[rgba(13,110,187,0.12)] p-5">
					<label className={labelCls}>Fournisseur principal</label>
					<div className="space-y-2">
						{providerKeys.map((key) => (
							<label key={key} className={`flex items-start gap-3 rounded-xl border-2 px-4 py-3 cursor-pointer transition-colors ${form.provider === key ? "border-[#0D6EBB] bg-[rgba(13,110,187,0.04)]" : "border-gray-200 hover:border-[rgba(13,110,187,0.3)]"}`}>
								<input type="radio" name="ai-provider" checked={form.provider === key}
									onChange={() => setForm((f) => ({ ...f, provider: key }))} className="mt-1 w-4 h-4 accent-[#0D6EBB]" />
								<span>
									<span className="block text-sm font-semibold text-gray-800">{PROVIDER_INFO[key]?.label || key}</span>
									<span className="block text-xs text-gray-500 mt-0.5">{PROVIDER_INFO[key]?.help || "Fournisseur personnalisé."}</span>
								</span>
							</label>
						))}
					</div>
					<p className="text-[11px] text-gray-400 mt-3">
						Si le fournisseur principal échoue ou si sa clé API manque, la génération bascule automatiquement sur l&apos;autre fournisseur configuré.
					</p>
				</div>

				<div className="bg-white rounded-xl border border-[rgba(13,110,187,0.12)] p-5 space-y-4">
					<p className="font-semibold text-gray-900">Modèle par fournisseur</p>
					{providerKeys.map((key) => (
						<div key={key}>
							<label className={labelCls}>{PROVIDER_INFO[key]?.label || key}</label>
							<input value={form.models?.[key] || ""}
								onChange={(e) => setForm((f) => ({ ...f, models: { ...f.models, [key]: e.target.value } }))}
								placeholder={key === "google" ? "gemini-2.5-flash" : "llama-3.3-70b-versatile"}
								className={inputCls} />
						</div>
					))}
					<p className="text-[11px] text-gray-400">Laissez vide pour utiliser le modèle par défaut du fournisseur.</p>
				</div>

				{error && <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2" role="alert">{error}</p>}
				<div className="flex items-center gap-3">
					<button onClick={save} disabled={saving} className={btnPrimary}>
						{saving ? "Enregistrement…" : saved ? "✓ Enregistré" : "Enregistrer"}
					</button>
				</div>
			</div>
		</div>
	);
}
