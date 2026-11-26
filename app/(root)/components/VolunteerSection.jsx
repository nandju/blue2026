"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

import { getVolunteer } from "@/lib/store";
import { useContent } from "@/components/SiteContentProvider";
import SectionHeader from "@/components/SectionHeader";

const isExternal = (src) => /^https?:\/\//.test(src || "");

export default function VolunteerSection() {
	const c = useContent("home.volunteer");
	const [volunteer, setVolunteer] = useState(null);
	const [loaded, setLoaded] = useState(false);

	useEffect(() => {
		getVolunteer()
			.then((d) => setVolunteer(d?.volunteer || null))
			.catch(() => setVolunteer(null))
			.finally(() => setLoaded(true));
	}, []);

	if (!c) return null;

	return (
		<section className="py-20 md:py-28 bg-[#f4f9fd]">
			<div className="mx-auto max-w-7xl px-6 md:px-8">
				<SectionHeader
					eyebrow={c.eyebrow}
					title={c.title}
					description={c.description}
				/>
				<div className="mt-14">
					{!loaded ? (
						<div className="mx-auto max-w-3xl bg-white rounded-3xl border border-[var(--color-primary)]/10 p-10 animate-pulse">
							<div className="flex flex-col md:flex-row gap-8 items-center">
								<div className="w-36 h-36 rounded-full bg-[var(--color-primary)]/10" />
								<div className="flex-1 space-y-3 w-full">
									<div className="h-6 bg-[var(--color-primary)]/10 rounded w-1/2" />
									<div className="h-4 bg-[var(--color-primary)]/10 rounded w-1/3" />
									<div className="h-20 bg-[var(--color-primary)]/10 rounded" />
								</div>
							</div>
						</div>
					) : volunteer?.published ? (
						<motion.div
							className="mx-auto max-w-4xl bg-white rounded-3xl border border-[var(--color-primary)]/10 shadow-xl overflow-hidden"
							initial={{ opacity: 0, y: 30 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.6 }}>
							<div className="grid md:grid-cols-[300px_1fr]">
								{/* Portrait */}
								<div className="relative bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center p-10">
									<div className="relative w-36 h-36 rounded-full border-4 border-white/60 shadow-xl overflow-hidden bg-white/20 flex items-center justify-center">
										{volunteer.photo ? (
											<Image
												src={volunteer.photo}
												alt={`${volunteer.firstName} ${volunteer.lastName}`}
												fill
												sizes="144px"
												unoptimized={isExternal(volunteer.photo)}
												className="object-cover"
											/>
										) : (
											<span className="text-white text-4xl font-extrabold">
												{(volunteer.firstName?.[0] || "") + (volunteer.lastName?.[0] || "")}
											</span>
										)}
									</div>
								</div>
								{/* Details */}
								<div className="p-8 md:p-10">
									<span className="inline-block text-xs font-bold uppercase tracking-[0.25em] text-[var(--color-secondary)]">
										{c.badge}
									</span>
									<h3 className="mt-2 text-2xl md:text-3xl font-bold text-[var(--color-dark)]">
										{volunteer.firstName} {volunteer.lastName}
									</h3>
									{volunteer.location && (
										<p className="mt-1 text-sm text-gray-500">📍 {volunteer.location}</p>
									)}
									{volunteer.actions && (
										<div className="mt-5">
											<h4 className="text-sm font-semibold text-[var(--color-primary)]">{c.actionsLabel}</h4>
											<p className="text-sm text-gray-600 leading-relaxed mt-1">{volunteer.actions}</p>
										</div>
									)}
									{volunteer.contribution && (
										<div className="mt-4">
											<h4 className="text-sm font-semibold text-[var(--color-secondary)]">{c.contributionLabel}</h4>
											<p className="text-sm text-gray-600 leading-relaxed mt-1">{volunteer.contribution}</p>
										</div>
									)}
								</div>
							</div>
						</motion.div>
					) : (
						<div className="mx-auto max-w-2xl text-center bg-white rounded-3xl border border-[var(--color-primary)]/10 p-10">
							<p className="text-4xl mb-4">🌟</p>
							<p className="text-gray-600">{c.emptyText}</p>
							{c.emptyCta?.href && (
								<Link
									href={c.emptyCta.href}
									className="mt-6 inline-block rounded-full bg-[var(--color-primary)] px-7 py-3 text-sm font-semibold text-white hover:bg-[var(--color-secondary)] transition-colors">
									{c.emptyCta.label}
								</Link>
							)}
						</div>
					)}
				</div>
			</div>
		</section>
	);
}
