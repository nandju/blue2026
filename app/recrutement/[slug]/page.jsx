"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";

import DynamicForm from "@/components/recruitment/DynamicForm";
import { getRecruitment } from "@/lib/store";
import { useContent } from "@/components/SiteContentProvider";
import { fmtDateTime, closedMessage } from "@/lib/recruitmentModel";

const BADGES = {
	open: { label: "Ouvert", cls: "bg-emerald-100 text-emerald-700" },
	announced: { label: "Bientôt", cls: "bg-amber-100 text-amber-700" },
	closed: { label: "Clôturé", cls: "bg-slate-100 text-slate-600" },
	full: { label: "Complet", cls: "bg-red-100 text-red-600" },
};

const BUTTON_ICONS = { whatsapp: "💬", form: "📋", document: "📄", link: "🔗" };

/** Texte long simple : paragraphes, listes « - » et **gras**. */
function RichText({ text = "" }) {
	const blocks = text.split(/\n{2,}/).filter(Boolean);
	return (
		<div className="space-y-4 text-gray-700 leading-relaxed">
			{blocks.map((b, i) => {
				const lines = b.split("\n");
				const isList = lines.every((l) => l.trim().startsWith("- "));
				if (isList) {
					return (
						<ul key={i} className="list-disc pl-5 space-y-1">
							{lines.map((l, j) => <li key={j}>{inline(l.trim().slice(2))}</li>)}
						</ul>
					);
				}
				return <p key={i} className="whitespace-pre-line">{lines.map((l, j) => <span key={j}>{inline(l)}{j < lines.length - 1 && <br />}</span>)}</p>;
			})}
		</div>
	);
}
function inline(s) {
	return s.split(/(\*\*[^*]+\*\*)/g).map((p, k) =>
		/^\*\*[^*]+\*\*$/.test(p) ? <strong key={k} className="font-semibold text-[var(--color-dark)]">{p.slice(2, -2)}</strong> : p
	);
}

export default function RecrutementDetailPage() {
	const { slug } = useParams();
	const c = useContent("recrutement") || {};
	const { detail = {} } = c;
	const [form, setForm] = useState(null);
	const [error, setError] = useState("");

	useEffect(() => {
		window.scrollTo(0, 0);
		if (!slug) return;
		getRecruitment(slug).then(setForm).catch((e) => setError(e.message || "Ce recrutement n'est plus disponible."));
	}, [slug]);

	if (error) {
		return (
			<main className="min-h-[60vh] flex items-center justify-center bg-[#f4f9fd]">
				<div className="text-center px-6">
					<p className="text-5xl mb-5">📣</p>
					<h1 className="text-2xl font-bold text-[var(--color-dark)]">{error}</h1>
					<Link href="/recrutement" className="mt-6 inline-block rounded-full bg-[var(--color-primary)] text-white px-8 py-3 text-sm font-semibold hover:bg-[var(--color-secondary)] transition-colors">
						{detail.backLabel || "← Tous les recrutements"}
					</Link>
				</div>
			</main>
		);
	}
	if (!form) {
		return <main className="min-h-[60vh] flex items-center justify-center bg-[#f4f9fd]"><p className="text-gray-400 text-sm">Chargement…</p></main>;
	}

	const badge = BADGES[form.status] || BADGES.closed;
	const open = form.status === "open";
	const infoRows = [
		form.location && { label: "Lieu", value: form.location },
		form.applyFrom && form.status === "announced" && { label: "Ouverture des candidatures", value: fmtDateTime(form.applyFrom) },
		form.applyUntil && { label: "Clôture des candidatures", value: fmtDateTime(form.applyUntil) },
		form.maxSubmissions != null && { label: "Places", value: `${form.maxSubmissions} candidature(s) max` },
	].filter(Boolean);

	return (
		<main className="bg-[#f4f9fd] min-h-screen">
			{/* En-tête */}
			<section className="relative bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-navy)] text-white overflow-hidden">
				{form.coverImage && (
					<div className="absolute inset-0">
						<Image src={form.coverImage} alt="" fill className="object-cover opacity-25" priority sizes="100vw" />
					</div>
				)}
				<div className="relative mx-auto max-w-7xl px-6 md:px-8 py-16 md:py-24">
					<Link href="/recrutement" className="text-white/70 text-sm hover:text-white transition-colors">
						{detail.backLabel || "← Tous les recrutements"}
					</Link>
					<div className="mt-6 flex flex-wrap items-center gap-3">
						<span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/15 text-white">{form.type}</span>
						<span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.cls}`}>{badge.label}</span>
						{form.featured && <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[var(--color-secondary)] text-white">★ À la une</span>}
					</div>
					<motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-4 text-3xl md:text-5xl font-extrabold max-w-3xl">
						{form.title}
					</motion.h1>
					{form.summary && <p className="mt-4 text-white/85 text-lg max-w-2xl">{form.summary}</p>}
				</div>
			</section>

			<div className="mx-auto max-w-7xl px-6 md:px-8 py-14 md:py-20 grid grid-cols-1 lg:grid-cols-3 gap-10">
				{/* Description + infos */}
				<div className="lg:col-span-2 space-y-10">
					{form.description && (
						<motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
							className="bg-white rounded-3xl border border-[var(--color-primary)]/10 p-7 md:p-9">
							<RichText text={form.description} />
						</motion.section>
					)}

					{infoRows.length > 0 && (
						<motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
							className="bg-white rounded-3xl border border-[var(--color-primary)]/10 p-7 md:p-9">
							<h2 className="text-lg font-bold text-[var(--color-dark)] mb-5">{detail.infoTitle || "Informations pratiques"}</h2>
							<dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								{infoRows.map((r) => (
									<div key={r.label} className="bg-[#f4f9fd] rounded-2xl p-4">
										<dt className="text-xs font-semibold uppercase tracking-wider text-[var(--color-primary)]">{r.label}</dt>
										<dd className="mt-1 text-sm font-medium text-[var(--color-dark)]">{r.value}</dd>
									</div>
								))}
							</dl>
						</motion.section>
					)}
				</div>

				{/* Formulaire / statut + boutons */}
				<div className="space-y-6">
					{open ? (
						<motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
							className="bg-white rounded-3xl border border-[var(--color-primary)]/10 p-7">
							<h2 className="text-lg font-bold text-[var(--color-dark)] mb-6">{detail.formTitle || "Candidature"}</h2>
							<DynamicForm form={form} submitLabel={detail.submitLabel || "Envoyer ma candidature"} />
						</motion.section>
					) : (
						<motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
							className="bg-white rounded-3xl border border-[var(--color-primary)]/10 p-7 text-center">
							<p className="text-4xl mb-4">{form.status === "announced" ? "🗓️" : "🔒"}</p>
							<p className="text-[var(--color-dark)] font-semibold">{closedMessage(form, form.status)}</p>
						</motion.section>
					)}

					{(form.buttons || []).length > 0 && (
						<div className="space-y-3">
							{form.buttons.map((b) => (
								<a key={b.id} href={b.href}
									className={`flex items-center justify-center gap-2 w-full rounded-2xl px-6 py-3.5 text-sm font-semibold transition-all ${
										b.style === "secondary"
											? "bg-white border-2 border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white"
											: "bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white hover:shadow-lg hover:-translate-y-0.5"
									}`}>
									<span>{BUTTON_ICONS[b.icon] || "🔗"}</span> {b.label} ↗
								</a>
							))}
						</div>
					)}
				</div>
			</div>
		</main>
	);
}
