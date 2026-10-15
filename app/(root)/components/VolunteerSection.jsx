"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

import { getVolunteer } from "@/lib/store";
import SectionHeader from "@/components/SectionHeader";

export default function VolunteerSection() {
	const [volunteer, setVolunteer] = useState(null);
	const [loaded, setLoaded] = useState(false);

	useEffect(() => {
		getVolunteer()
			.then((v) => setVolunteer(v))
			.catch(() => setVolunteer(null))
			.finally(() => setLoaded(true));
	}, []);

	return (
		<section className="py-20 md:py-28 bg-[#f4f9fd]">
			<div className="mx-auto max-w-7xl px-6 md:px-8">
				<SectionHeader
					eyebrow="Reconnaissance"
					title="Bénévole du mois"
					description="Chaque mois, BLUE met à l'honneur un membre de sa communauté pour son engagement remarquable sur le terrain."
				/>
				<div className="mt-14">
					{!loaded ? (
						<div className="mx-auto max-w-3xl bg-white rounded-3xl border border-[#0D6EBB]/10 p-10 animate-pulse">
							<div className="flex flex-col md:flex-row gap-8 items-center">
								<div className="w-36 h-36 rounded-full bg-[#0D6EBB]/10" />
								<div className="flex-1 space-y-3 w-full">
									<div className="h-6 bg-[#0D6EBB]/10 rounded w-1/2" />
									<div className="h-4 bg-[#0D6EBB]/10 rounded w-1/3" />
									<div className="h-20 bg-[#0D6EBB]/10 rounded" />
								</div>
							</div>
						</div>
					) : volunteer && volunteer.active ? (
						<motion.div
							className="mx-auto max-w-4xl bg-white rounded-3xl border border-[#0D6EBB]/10 shadow-xl overflow-hidden"
							initial={{ opacity: 0, y: 30 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.6 }}>
							<div className="grid md:grid-cols-[300px_1fr]">
								{/* Portrait */}
								<div className="relative bg-gradient-to-br from-[#0D6EBB] to-[#0DBD9F] flex items-center justify-center p-10">
									<div className="w-36 h-36 rounded-full border-4 border-white/60 shadow-xl overflow-hidden bg-white/20 flex items-center justify-center">
										{volunteer.photo ? (
											// eslint-disable-next-line @next/next/no-img-element
											<img src={volunteer.photo} alt={`${volunteer.firstName} ${volunteer.lastName}`} className="w-full h-full object-cover" />
										) : (
											<span className="text-white text-4xl font-extrabold">
												{(volunteer.firstName?.[0] || "") + (volunteer.lastName?.[0] || "")}
											</span>
										)}
									</div>
								</div>
								{/* Details */}
								<div className="p-8 md:p-10">
									<span className="inline-block text-xs font-bold uppercase tracking-[0.25em] text-[#0DBD9F]">
										🌟 Bénévole du mois
									</span>
									<h3 className="mt-2 text-2xl md:text-3xl font-bold text-[#073A63]">
										{volunteer.firstName} {volunteer.lastName}
									</h3>
									{volunteer.location && (
										<p className="mt-1 text-sm text-gray-500">📍 {volunteer.location}</p>
									)}
									{volunteer.actions && (
										<div className="mt-5">
											<h4 className="text-sm font-semibold text-[#0D6EBB]">Actions réalisées</h4>
											<p className="text-sm text-gray-600 leading-relaxed mt-1">{volunteer.actions}</p>
										</div>
									)}
									{volunteer.contribution && (
										<div className="mt-4">
											<h4 className="text-sm font-semibold text-[#0DBD9F]">Contribution</h4>
											<p className="text-sm text-gray-600 leading-relaxed mt-1">{volunteer.contribution}</p>
										</div>
									)}
								</div>
							</div>
						</motion.div>
					) : (
						<div className="mx-auto max-w-2xl text-center bg-white rounded-3xl border border-[#0D6EBB]/10 p-10">
							<p className="text-4xl mb-4">🌟</p>
							<p className="text-gray-600">
								Le prochain bénévole du mois sera bientôt annoncé. Rejoignez nos
								actions pour peut-être être mis à l&apos;honneur !
							</p>
							<Link
								href="/benevolat"
								className="mt-6 inline-block rounded-full bg-[#0D6EBB] px-7 py-3 text-sm font-semibold text-white hover:bg-[#0DBD9F] transition-colors">
								Devenir bénévole
							</Link>
						</div>
					)}
				</div>
			</div>
		</section>
	);
}
