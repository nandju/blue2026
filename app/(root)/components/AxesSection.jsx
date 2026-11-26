"use client";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useContent } from "@/components/SiteContentProvider";
import { contentIcon } from "@/lib/content/icons";
import SectionHeader from "@/components/SectionHeader";

export default function AxesSection() {
	const c = useContent("home.axes");
	if (!c) return null;

	return (
		<section className="py-20 md:py-28 bg-[#f4f9fd]">
			<div className="mx-auto max-w-7xl px-6 md:px-8">
				<SectionHeader
					eyebrow={c.eyebrow}
					title={c.title}
					description={c.description}
				/>
				<div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
					{(c.items || []).map((item, i) => (
						<motion.div
							key={`${item.title}-${i}`}
							className="bg-white rounded-2xl border border-[var(--color-primary)]/10 p-7 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
							initial={{ opacity: 0, y: 30 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, margin: "-60px" }}
							transition={{ delay: (i % 3) * 0.1, duration: 0.5 }}>
							<span className="inline-flex w-12 h-12 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] items-center justify-center text-xl group-hover:bg-[var(--color-primary)] group-hover:text-white transition-colors duration-300">
								<FontAwesomeIcon icon={contentIcon(item.icon)} />
							</span>
							<h3 className="mt-5 text-lg font-bold text-[var(--color-dark)]">{item.title}</h3>
							<p className="mt-2 text-sm text-gray-600 leading-relaxed">{item.text}</p>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
}
