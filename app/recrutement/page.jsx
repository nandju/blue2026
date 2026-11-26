"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

import PageHero, { HeroButton } from "@/components/PageHero";
import SectionHeader from "@/components/SectionHeader";
import { getRecruitments } from "@/lib/store";
import { useContent } from "@/components/SiteContentProvider";
import { fmtDate } from "@/lib/recruitmentModel";

const BADGES = {
	open: { label: "Ouvert", cls: "bg-emerald-100 text-emerald-700" },
	announced: { label: "Bientôt", cls: "bg-amber-100 text-amber-700" },
	closed: { label: "Clôturé", cls: "bg-slate-100 text-slate-600" },
	full: { label: "Complet", cls: "bg-red-100 text-red-600" },
};

export default function RecrutementPage() {
	const c = useContent("recrutement") || {};
	const { hero = {}, list = {}, empty = {} } = c;
	const [items, setItems] = useState(null);
	const [filter, setFilter] = useState("");

	useEffect(() => {
		window.scrollTo(0, 0);
		getRecruitments().then(setItems).catch(() => setItems([]));
	}, []);

	const types = useMemo(() => [...new Set((items || []).map((r) => r.type).filter(Boolean))], [items]);
	const filtered = (items || []).filter((r) => !filter || r.type === filter);

	return (
		<main className="overflow-x-hidden">
			<PageHero image={hero.image} eyebrow={hero.eyebrow} title={hero.title} description={hero.description}>
				{(hero.buttons || []).map((b, i) =>
					b?.href ? (
						<HeroButton key={i} href={b.href} variant={b.variant} external={!b.href.startsWith("/") && !b.href.startsWith("#")}>
							{b.label}
						</HeroButton>
					) : null
				)}
			</PageHero>

			<section id="offres" className="py-20 md:py-28 bg-[#f4f9fd] scroll-mt-20">
				<div className="mx-auto max-w-7xl px-6 md:px-8">
					<SectionHeader eyebrow={list.eyebrow} title={list.title} description={list.description} />

					{types.length > 1 && (
						<div className="mt-10 flex flex-wrap justify-center gap-3">
							<button
								onClick={() => setFilter("")}
								className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${!filter ? "bg-[var(--color-primary)] text-white shadow-md" : "bg-white text-[var(--color-primary)] border border-[var(--color-primary)]/20 hover:border-[var(--color-primary)]/50"}`}>
								{list.filterAll || "Tous"}
							</button>
							{types.map((t) => (
								<button key={t} onClick={() => setFilter(t)}
									className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${filter === t ? "bg-[var(--color-primary)] text-white shadow-md" : "bg-white text-[var(--color-primary)] border border-[var(--color-primary)]/20 hover:border-[var(--color-primary)]/50"}`}>
									{t}
								</button>
							))}
						</div>
					)}

					{items === null ? (
						<div className="mt-16 text-center text-gray-400 text-sm">Chargement…</div>
					) : filtered.length === 0 ? (
						<div className="mt-16 max-w-xl mx-auto text-center">
							<p className="text-5xl mb-5">📣</p>
							<h3 className="text-xl font-bold text-[var(--color-dark)]">{empty.title}</h3>
							{empty.text && <p className="mt-3 text-gray-600">{empty.text}</p>}
							{empty.cta?.href && (
								<Link href={empty.cta.href}
									className="mt-7 inline-block rounded-full border-2 border-[var(--color-primary)] px-8 py-3 text-sm font-semibold text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-colors">
									{empty.cta.label}
								</Link>
							)}
						</div>
					) : (
						<div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
							{filtered.map((r, i) => {
								const badge = BADGES[r.status] || BADGES.closed;
								return (
									<motion.article
										key={r.id}
										className={`group bg-white rounded-3xl overflow-hidden border transition-all duration-300 hover:shadow-2xl hover:-translate-y-1.5 ${r.featured ? "border-[var(--color-secondary)]/40 shadow-lg" : "border-[var(--color-primary)]/10"}`}
										initial={{ opacity: 0, y: 30 }}
										whileInView={{ opacity: 1, y: 0 }}
										viewport={{ once: true, margin: "-60px" }}
										transition={{ delay: i * 0.08, duration: 0.5 }}>
										<Link href={`/recrutement/${r.slug}`} className="block">
											<div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-navy)]">
												{r.coverImage ? (
													<Image src={r.coverImage} alt={r.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width:768px) 100vw, 33vw" />
												) : (
													<div className="absolute inset-0 flex items-center justify-center text-white/30 text-6xl font-black">{r.type?.[0] || "B"}</div>
												)}
												<span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold ${badge.cls}`}>{badge.label}</span>
												{r.featured && <span className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--color-secondary)] text-white">★ À la une</span>}
											</div>
											<div className="p-6">
												<p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-secondary)]">{r.type}</p>
												<h3 className="mt-2 text-lg font-bold text-[var(--color-dark)] group-hover:text-[var(--color-primary)] transition-colors">{r.title}</h3>
												{r.summary && <p className="mt-2 text-sm text-gray-600 leading-relaxed line-clamp-2">{r.summary}</p>}
												<div className="mt-4 flex items-center justify-between text-xs text-gray-500">
													{r.status === "announced" && r.applyFrom ? (
														<span>{list.opensLabel || "Ouverture le"} {fmtDate(r.applyFrom)}</span>
													) : r.applyUntil ? (
														<span>{list.deadlineLabel || "Candidatures jusqu'au"} {fmtDate(r.applyUntil)}</span>
													) : (
														<span />
													)}
													<span className="font-semibold text-[var(--color-primary)]">
														{r.status === "open" ? (list.applyLabel || "Postuler") : (list.detailsLabel || "Voir le détail")} →
													</span>
												</div>
											</div>
										</Link>
									</motion.article>
								);
							})}
						</div>
					)}
				</div>
			</section>
		</main>
	);
}
