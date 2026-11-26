"use client";
import { motion } from "framer-motion";

export default function SectionHeader({
	eyebrow,
	title,
	description,
	align = "center",
	dark = false,
	className = "",
}) {
	const alignCls = align === "center" ? "items-center text-center" : "items-start text-left";
	return (
		<motion.div
			className={`flex flex-col ${alignCls} ${className}`}
			initial={{ opacity: 0, y: 30 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, margin: "-60px" }}
			transition={{ duration: 0.6, ease: "easeOut" }}>
			{eyebrow && (
				<span className="text-[var(--color-secondary)] text-xs md:text-sm font-bold uppercase tracking-[0.3em] mb-3">
					{eyebrow}
				</span>
			)}
			<h2
				className={`text-3xl md:text-5xl font-bold leading-tight ${
					dark ? "text-white" : "text-[var(--color-dark)]"
				}`}>
				{title}
			</h2>
			<span className="mt-4 h-1 w-16 rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]" />
			{description && (
				<p className={`mt-5 max-w-2xl text-base md:text-lg leading-relaxed ${dark ? "text-white/75" : "text-gray-600"}`}>
					{description}
				</p>
			)}
		</motion.div>
	);
}
