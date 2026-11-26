"use client";
import { useState, useEffect, use, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import NotFound from "@/app/not-found";
import Image from "next/image";
import BlurImage from "@/public/image/placeholder/blur.jpg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faCalendarDays, faTags } from "@fortawesome/free-solid-svg-icons";

import { getProjectBySlug, getProjects } from "@/lib/store";
import { PROJECT_CATEGORIES } from "@/lib/content/defaults";

const CATEGORY_LABELS = Object.fromEntries(PROJECT_CATEGORIES.map((c) => [c.value, c.short]));

function ProjectImage({ src, alt, index }) {
	const [loaded, setLoaded] = useState(false);
	const handleLoad = useCallback(() => setLoaded(true), []);

	return (
		<div className="relative mb-6 w-full rounded-3xl overflow-hidden shadow-lg">
			{!loaded && <div className="absolute inset-0 animate-pulse bg-[var(--color-primary)]/10" />}
			<Image
				src={src}
				alt={alt}
				width={1920}
				height={1080}
				className={`h-auto w-full object-cover transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
				placeholder="blur"
				blurDataURL={BlurImage.src}
				loading={index === 0 ? "eager" : "lazy"}
				onLoad={handleLoad}
			/>
		</div>
	);
}

export default function ProjectDetailPage(props) {
	const params = use(props.params);
	const [data, setData] = useState(null);
	const [others, setOthers] = useState([]);

	useEffect(() => {
		setData(null);
		getProjectBySlug(params.slug)
			.then(setData)
			.catch(() => setData("404"));
		getProjects()
			.then((all) => setOthers(all.filter((p) => p.slug !== params.slug).slice(0, 3)))
			.catch(() => setOthers([]));
		window.scrollTo(0, 0);
	}, [params.slug]);

	if (data === "404") return <NotFound />;

	if (!data) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="w-12 h-12 rounded-full border-4 border-[var(--color-primary)] border-t-transparent animate-spin" />
			</div>
		);
	}

	return (
		<main className="overflow-x-hidden">
			{/* Hero */}
			<section className="relative min-h-[55vh] flex items-end overflow-hidden">
				<div className="absolute inset-0">
					{data.thumbnail && (
						<Image
							src={data.thumbnail}
							alt={data.title}
							fill
							priority
							sizes="100vw"
							className="object-cover"
							placeholder="blur"
							blurDataURL={BlurImage.src}
						/>
					)}
					<div className="absolute inset-0 bg-gradient-to-b from-[var(--color-navy)]/60 via-[var(--color-primary)]/30 to-[var(--color-navy)]/90" />
				</div>
				<div className="relative z-10 mx-auto w-full max-w-7xl px-6 md:px-8 pb-14 pt-40">
					<Link
						href="/projects"
						className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm mb-6 transition-colors">
						<FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
						Tous les projets
					</Link>
					<motion.h1
						className="text-white text-4xl md:text-6xl font-bold leading-tight max-w-3xl"
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.7 }}>
						{data.title}
					</motion.h1>
					<motion.div
						className="mt-5 flex flex-wrap items-center gap-4 text-white/80 text-sm"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.3 }}>
						<span className="inline-flex items-center gap-2">
							<FontAwesomeIcon icon={faCalendarDays} className="text-[var(--color-secondary)]" />
							{data.year}
						</span>
						{data.category?.map((c) => (
							<span key={c} className="inline-flex items-center gap-2 bg-white/15 rounded-full px-3 py-1">
								{CATEGORY_LABELS[c] || "Projet"}
							</span>
						))}
					</motion.div>
				</div>
			</section>

			{/* Content */}
			<section className="py-16 md:py-24 bg-white">
				<div className="mx-auto max-w-7xl px-6 md:px-8 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12">
					{/* Description */}
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}>
						<h2 className="text-2xl md:text-3xl font-bold text-[var(--color-dark)] mb-6">
							À propos de ce projet
						</h2>
						<div className="space-y-5">
							{(data.desc || []).map((desc, index) => (
								<p key={index} className="text-gray-600 text-base md:text-lg leading-relaxed text-justify">
									{desc}
								</p>
							))}
						</div>
					</motion.div>

					{/* Sidebar meta */}
					<motion.aside
						className="lg:sticky lg:top-28 self-start bg-[#f4f9fd] rounded-3xl border border-[var(--color-primary)]/10 p-7"
						initial={{ opacity: 0, x: 30 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: 0.2, duration: 0.6 }}>
						<h3 className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--color-secondary)] mb-4">
							Domaines d&apos;action
						</h3>
						<div className="flex flex-wrap gap-2">
							{(data.tech || []).map((t) => (
								<span key={t} className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-[var(--color-primary)]/8 text-[var(--color-primary)]">
									<FontAwesomeIcon icon={faTags} className="text-[10px]" />
									{t}
								</span>
							))}
						</div>
						<div className="mt-8 pt-6 border-t border-[var(--color-primary)]/10">
							<p className="text-sm text-gray-600 leading-relaxed">
								Envie de participer à ce type d&apos;action ?
							</p>
							<Link
								href="/benevolat"
								className="mt-4 inline-block w-full text-center rounded-full bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-white hover:bg-[var(--color-secondary)] transition-colors">
								Devenir bénévole
							</Link>
						</div>
					</motion.aside>
				</div>
			</section>

			{/* Gallery */}
			{data.images?.length > 0 && (
				<section className="pb-16 md:pb-24 bg-white">
					<div className="mx-auto max-w-7xl px-6 md:px-8">
						<h2 className="text-2xl md:text-3xl font-bold text-[var(--color-dark)] mb-8">
							En images
						</h2>
						{data.images.map((image, index) => (
							<ProjectImage key={index} src={image} alt={`${data.title} — image ${index + 1}`} index={index} />
						))}
					</div>
				</section>
			)}

			{/* Other projects */}
			{others.length > 0 && (
				<section className="py-16 md:py-20 bg-[#f4f9fd]">
					<div className="mx-auto max-w-7xl px-6 md:px-8">
						<h2 className="text-2xl md:text-3xl font-bold text-[var(--color-dark)] mb-8">
							Autres actions de BLUE
						</h2>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							{others.map((p) => (
								<Link
									key={p.slug}
									href={`/projects/${p.slug}`}
									className="group rounded-3xl overflow-hidden bg-white border border-[var(--color-primary)]/10 shadow-sm hover:shadow-xl transition-all duration-300">
									<div className="relative aspect-[16/10] overflow-hidden">
										{p.thumbnail && (
											<Image
												src={p.thumbnail}
												alt={p.title}
												fill
												sizes="(max-width: 768px) 100vw, 33vw"
												className="object-cover group-hover:scale-105 transition-transform duration-700"
												placeholder="blur"
												blurDataURL={BlurImage.src}
											/>
										)}
									</div>
									<div className="p-5">
										<h3 className="font-bold text-[var(--color-dark)] group-hover:text-[var(--color-primary)] transition-colors">
											{p.title}
										</h3>
										<p className="mt-1 text-xs text-gray-500">{p.year}</p>
									</div>
								</Link>
							))}
						</div>
					</div>
				</section>
			)}
		</main>
	);
}
