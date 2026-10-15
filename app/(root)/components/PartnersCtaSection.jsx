"use client";
import { motion } from "framer-motion";
import Link from "next/link";

export default function PartnersCtaSection() {
	return (
		<section className="py-16 md:py-20 bg-[#f4f9fd] border-t border-[#0D6EBB]/10">
			<div className="mx-auto max-w-7xl px-6 md:px-8">
				<motion.div
					className="flex flex-col md:flex-row items-center justify-between gap-8"
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6 }}>
					<div className="max-w-xl text-center md:text-left">
						<span className="text-[#0DBD9F] text-xs font-bold uppercase tracking-[0.3em]">
							Collaborations
						</span>
						<h2 className="mt-3 text-2xl md:text-4xl font-bold text-[#073A63]">
							Institutions, entreprises, associations : construisons ensemble.
						</h2>
						<p className="mt-4 text-gray-600 text-sm md:text-base leading-relaxed">
							BLUE collabore avec des partenaires institutionnels, techniques et
							privés pour amplifier son impact. Votre organisation souhaite
							soutenir nos actions ?
						</p>
					</div>
					<Link
						href="/partenaires"
						className="shrink-0 rounded-full bg-[#0D6EBB] px-8 py-3.5 text-sm font-semibold text-white shadow-lg hover:bg-[#0DBD9F] transition-colors duration-300">
						Devenir partenaire →
					</Link>
				</motion.div>
			</div>
		</section>
	);
}
