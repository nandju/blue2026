"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

import Bg from "@/public/ong_blue/images/illustrations/page-landing/blue_training_2.png";

const PERKS = [
	"Formations 100% en ligne et gratuites",
	"Vidéos, supports PDF et quiz chronométrés",
	"Certificat délivré dès 80% de réussite",
];

export default function AcademySection() {
	return (
		<section id="academy" className="relative py-24 md:py-36 overflow-hidden scroll-mt-20">
			{/* Background */}
			<div className="absolute inset-0">
				<Image src={Bg} alt="" fill sizes="100vw" className="object-cover" placeholder="blur" />
				<div className="absolute inset-0 bg-[#062E52]/70" />
			</div>

			<div className="relative z-10 mx-auto max-w-7xl px-6 md:px-8">
				<div className="max-w-2xl">
					<motion.h2
						className="text-white text-4xl md:text-6xl font-bold leading-tight"
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.7 }}>
						Blue Academy
					</motion.h2>
				</div>

				<div className="mt-10 flex justify-end">
					<motion.div
						className="w-full max-w-lg bg-[#0DBD9F] rounded-3xl p-8 md:p-10 shadow-2xl"
						initial={{ opacity: 0, y: 40 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, margin: "-80px" }}
						transition={{ duration: 0.7 }}>
						<p className="text-white text-lg md:text-xl font-medium leading-relaxed">
							Formez-vous et devenez un ambassadeur certifié de
							l&apos;environnement.
						</p>
						<ul className="mt-5 space-y-2.5">
							{PERKS.map((p) => (
								<li key={p} className="flex items-start gap-3 text-white/95 text-sm">
									<span className="mt-1 w-4 h-4 rounded-full bg-white/25 flex items-center justify-center text-[10px]">✓</span>
									{p}
								</li>
							))}
						</ul>
						<Link
							href="/academy"
							className="mt-7 inline-block rounded-full bg-white text-[#0D6EBB] px-7 py-3 text-sm font-bold shadow-lg hover:bg-[#073A63] hover:text-white transition-colors duration-300">
							Accéder aux formations →
						</Link>
					</motion.div>
				</div>
			</div>
		</section>
	);
}
