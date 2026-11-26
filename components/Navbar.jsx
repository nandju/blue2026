"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useContent, useSiteSettings } from "@/components/SiteContentProvider";

const overlayVariants = {
	open: {
		clipPath: "circle(2000px at calc(100% - 40px) 40px)",
		transition: { type: "tween", duration: 0.5, ease: [0.22, 1, 0.36, 1] },
	},
	closed: {
		clipPath: "circle(0px at calc(100% - 40px) 40px)",
		transition: {
			delay: 0.25,
			type: "tween",
			duration: 0.3,
			ease: [0.4, 0, 1, 1],
		},
	},
};

const itemVariants = {
	open: (custom) => ({
		opacity: 1,
		x: 0,
		transition: { delay: custom, type: "tween", duration: 0.3, ease: [0.22, 1, 0.36, 1] },
	}),
	closed: {
		opacity: 0,
		x: -60,
		transition: { type: "tween", duration: 0.2 },
	},
};

export default function Navbar() {
	const pathname = usePathname();
	const [isOpen, setIsOpen] = useState(false);
	const [scrolled, setScrolled] = useState(false);
	const nav = useContent("shared.navbar") || {};
	const identity = useSiteSettings().identity || {};
	const links = nav.links || [];

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 40);
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	useEffect(() => {
		setIsOpen(false);
	}, [pathname]);

	useEffect(() => {
		document.body.style.overflow = isOpen ? "hidden" : "";
		return () => { document.body.style.overflow = ""; };
	}, [isOpen]);

	const isActive = (href) =>
		href === "/" ? pathname === "/" : pathname.startsWith(href);

	const solid = scrolled || isOpen;

	return (
		<>
			<header
				className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
					isOpen
						? "bg-transparent"
						: solid
							? "bg-white/95 backdrop-blur-md shadow-[0_4px_24px_rgba(6,58,99,0.10)]"
							: "bg-gradient-to-b from-black/40 to-transparent"
				}`}>
				<div className="mx-auto max-w-7xl px-5 md:px-8 h-16 md:h-20 flex items-center justify-between">
					<Link href="/" className="flex items-center gap-3 shrink-0" aria-label={`${identity.name || "BLUE"} — Accueil`}>
						<span className="relative w-9 h-9 md:w-10 md:h-10 rounded-full overflow-hidden bg-white/90 flex items-center justify-center shadow">
							{identity.logo && (
								// eslint-disable-next-line @next/next/no-img-element
								<img src={identity.logo} alt={`Logo ${identity.name || "BLUE"}`} className="w-full h-full object-contain p-0.5" />
							)}
						</span>
						<span
							className={`text-xl md:text-2xl font-extrabold tracking-[0.18em] transition-colors duration-500 ${
								solid && !isOpen ? "text-[var(--color-primary)]" : "text-white"
							}`}>
							{identity.name || "BLUE"}
						</span>
					</Link>

					{/* Desktop nav */}
					<nav className="hidden lg:flex items-center gap-7">
						{links.map((link) => (
							<Link
								key={link.href}
								href={link.href}
								className={`relative text-sm font-medium tracking-wide transition-colors duration-300 group ${
									solid ? "text-[var(--color-primary)] hover:text-[var(--color-secondary)]" : "text-white/90 hover:text-white"
								} ${isActive(link.href) ? (solid ? "text-[var(--color-primary)]" : "text-white") : ""}`}>
								{link.label}
								<span
									className={`absolute -bottom-1.5 left-0 h-[2px] rounded-full bg-[var(--color-secondary)] transition-all duration-300 ${
										isActive(link.href) ? "w-full" : "w-0 group-hover:w-full"
									}`}
								/>
							</Link>
						))}
						{nav.cta?.href && (
							<Link
								href={nav.cta.href}
								className={`ml-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 shadow-md ${
									solid
										? "bg-[var(--color-primary)] text-white hover:bg-[var(--color-secondary)]"
										: "bg-white text-[var(--color-primary)] hover:bg-[var(--color-secondary)] hover:text-white"
								}`}>
								{nav.cta.label}
							</Link>
						)}
					</nav>

					{/* Mobile burger */}
					<button
						aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
						aria-expanded={isOpen}
						className="lg:hidden flex flex-col justify-center items-center space-y-1.5 p-2"
						onClick={() => setIsOpen((o) => !o)}>
						<span
							className={`w-8 h-[3px] rounded-full transition-all duration-300 ${
								isOpen ? "rotate-45 translate-y-[4.5px] bg-white" : solid ? "bg-[var(--color-primary)]" : "bg-white"
							}`}
						/>
						<span
							className={`w-8 h-[3px] rounded-full transition-all duration-300 ${
								isOpen ? "-rotate-45 -translate-y-[4.5px] bg-white" : solid ? "bg-[var(--color-primary)]" : "bg-white"
							}`}
						/>
					</button>
				</div>
			</header>

			{/* Mobile overlay menu */}
			<motion.div
				className="fixed inset-0 z-[45] lg:hidden"
				variants={overlayVariants}
				animate={isOpen ? "open" : "closed"}
				initial={false}
				aria-hidden={!isOpen}>
				<div className="w-full h-full bg-gradient-to-br from-[var(--color-dark)] via-[var(--color-primary)] to-[var(--color-primary-dark)] flex flex-col items-center justify-center">
					<nav className="flex flex-col items-center gap-5">
						{links.map((link, i) => (
							<motion.div
								key={link.href}
								variants={itemVariants}
								animate={isOpen ? "open" : "closed"}
								custom={0.1 + i * 0.06}>
								<Link
									href={link.href}
									onClick={() => setIsOpen(false)}
									className={`text-2xl font-bold transition-colors ${
										isActive(link.href) ? "text-[var(--color-secondary)]" : "text-white hover:text-[var(--color-secondary)]"
									}`}>
									{link.label}
								</Link>
							</motion.div>
						))}
						{nav.cta?.href && (
							<motion.div
								variants={itemVariants}
								animate={isOpen ? "open" : "closed"}
								custom={0.1 + links.length * 0.06}>
								<Link
									href={nav.cta.href}
									onClick={() => setIsOpen(false)}
									className="mt-3 inline-block bg-[var(--color-secondary)] text-white rounded-full px-8 py-3 font-semibold shadow-lg">
									{nav.cta.label}
								</Link>
							</motion.div>
						)}
					</nav>
				</div>
			</motion.div>
		</>
	);
}
