import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import PropTypes from "prop-types";
import BlurImage from "@/public/image/placeholder/blur.jpg";

export default function ProjectCard({ project, index, activeCategory }) {
	if (!project.category?.includes(Number(activeCategory))) return null;

	return (
		<motion.div
			initial={{ opacity: 0, y: 30 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, margin: "-40px" }}
			transition={{ delay: (index % 3) * 0.08, duration: 0.5 }}>
			<Link
				href={`/projects/${project.slug}`}
				className="group block h-full rounded-3xl overflow-hidden bg-white border border-[var(--color-primary)]/10 shadow-sm hover:shadow-2xl transition-all duration-300">
				<div className="relative aspect-[16/10] overflow-hidden">
					{project.thumbnail && (
						<Image
							src={project.thumbnail}
							alt={project.title}
							fill
							sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
							className="object-cover group-hover:scale-105 transition-transform duration-700"
							placeholder="blur"
							blurDataURL={BlurImage.src}
						/>
					)}
					<div className="absolute inset-0 bg-gradient-to-t from-[var(--color-navy)]/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
					<span className="absolute top-4 left-4 bg-white/90 text-[var(--color-primary)] text-xs font-bold px-3 py-1 rounded-full">
						{project.year}
					</span>
				</div>
				<div className="p-6">
					<h3 className="text-lg font-bold text-[var(--color-dark)] group-hover:text-[var(--color-primary)] transition-colors leading-snug">
						{project.title}
					</h3>
					<p className="mt-2 text-sm text-gray-600 leading-relaxed line-clamp-2">
						{project.desc?.[0]}
					</p>
					<div className="mt-4 flex items-center justify-between">
						<div className="flex flex-wrap gap-1.5">
							{(project.tech || []).slice(0, 2).map((t) => (
								<span key={t} className="text-xs px-2.5 py-1 rounded-full bg-[var(--color-primary)]/8 text-[var(--color-primary)]">
									{t}
								</span>
							))}
						</div>
						<span className="text-[var(--color-secondary)] text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
							Voir →
						</span>
					</div>
				</div>
			</Link>
		</motion.div>
	);
}

ProjectCard.propTypes = {
	project: PropTypes.object.isRequired,
	index: PropTypes.number.isRequired,
	activeCategory: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
		.isRequired,
};
