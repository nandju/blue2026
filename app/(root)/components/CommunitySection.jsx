"use client";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";

import SectionHeader from "@/components/SectionHeader";

const ZONES = [
	{
		name: "Abidjan Nord",
		areas: "Cocody · Yopougon · Abobo · Attécoubé · Anyama · Plateau · Bingerville",
		link: "https://chat.whatsapp.com/CTyNHv6t1VJ22htKymlt4w",
	},
	{
		name: "Abidjan Sud",
		areas: "Marcory · Treichville · Koumassi · Port-Bouët",
		link: "https://chat.whatsapp.com/Cl0LSqe35hBFjuLPPV13nm",
	},
	{
		name: "Intérieur du pays",
		areas: "Toutes les autres villes et localités de Côte d'Ivoire",
		link: "https://chat.whatsapp.com/DEAAJI4DLZB33aFQr0VJzf",
	},
];

export default function CommunitySection() {
	return (
		<section className="py-20 md:py-28 bg-white">
			<div className="mx-auto max-w-7xl px-6 md:px-8">
				<SectionHeader
					eyebrow="Communauté"
					title="Rejoignez les BLUE Makers de votre zone"
					description="Nos bénévoles s'organisent par zone géographique via des groupes WhatsApp officiels. Choisissez le vôtre et participez aux actions près de chez vous."
				/>
				<div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
					{ZONES.map((z, i) => (
						<motion.a
							key={z.name}
							href={z.link}
							target="_blank"
							rel="noopener noreferrer"
							className="group rounded-3xl border border-[#0D6EBB]/10 bg-[#f4f9fd] p-8 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
							initial={{ opacity: 0, y: 30 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, margin: "-60px" }}
							transition={{ delay: i * 0.1, duration: 0.5 }}>
							<span className="inline-flex w-12 h-12 rounded-2xl bg-[#25D366]/15 text-[#25D366] items-center justify-center text-2xl">
								<FontAwesomeIcon icon={faWhatsapp} />
							</span>
							<h3 className="mt-5 text-xl font-bold text-[#073A63] group-hover:text-[#0D6EBB] transition-colors">
								{z.name}
							</h3>
							<p className="mt-2 text-sm text-gray-600 leading-relaxed">{z.areas}</p>
							<span className="mt-5 inline-block text-sm font-semibold text-[#0D6EBB] group-hover:text-[#0DBD9F] transition-colors">
								Rejoindre le groupe →
							</span>
						</motion.a>
					))}
				</div>
			</div>
		</section>
	);
}
