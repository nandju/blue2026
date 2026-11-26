"use client";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faFacebookF,
	faInstagram,
	faLinkedinIn,
	faWhatsapp,
	faTiktok,
	faYoutube,
} from "@fortawesome/free-brands-svg-icons";
import {
	faPhone,
	faEnvelope,
	faLocationDot,
} from "@fortawesome/free-solid-svg-icons";

import { useContent, useSiteSettings } from "@/components/SiteContentProvider";

const SOCIAL_ICONS = {
	facebook: { icon: faFacebookF, label: "Facebook" },
	instagram: { icon: faInstagram, label: "Instagram" },
	linkedin: { icon: faLinkedinIn, label: "LinkedIn" },
	whatsapp: { icon: faWhatsapp, label: "WhatsApp" },
	tiktok: { icon: faTiktok, label: "TikTok" },
	youtube: { icon: faYoutube, label: "YouTube" },
};

export default function Footer() {
	const footer = useContent("shared.footer") || {};
	const { identity, contact, socials } = useSiteSettings();
	const name = identity?.name || "BLUE";
	const phones = (contact?.phones || []).filter(Boolean);
	const socialLinks = Object.entries(SOCIAL_ICONS)
		.map(([key, meta]) => ({ ...meta, href: socials?.[key] }))
		.filter((s) => s.href);

	return (
		<footer className="bg-[var(--color-navy)] text-white">
			<div className="mx-auto max-w-7xl px-6 md:px-8 pt-16 pb-8">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
					{/* Brand */}
					<div>
						<Link href="/" className="flex items-center gap-3">
							<span className="relative w-11 h-11 rounded-full overflow-hidden bg-white flex items-center justify-center">
								{identity?.logo && (
									// eslint-disable-next-line @next/next/no-img-element
									<img src={identity.logo} alt={`Logo ${name}`} className="w-full h-full object-contain p-1" />
								)}
							</span>
							<span className="text-2xl font-extrabold tracking-[0.18em]">{name}</span>
						</Link>
						{footer.description && (
							<p className="mt-5 text-sm leading-relaxed text-white/70">
								{footer.description}
							</p>
						)}
						{socialLinks.length > 0 && (
							<div className="mt-6 flex items-center gap-3 flex-wrap">
								{socialLinks.map((s) => (
									<a
										key={s.label}
										href={s.href}
										target="_blank"
										rel="noopener noreferrer"
										aria-label={s.label}
										className="w-10 h-10 rounded-full bg-white/10 hover:bg-[var(--color-secondary)] flex items-center justify-center transition-colors duration-300">
										<FontAwesomeIcon icon={s.icon} className="text-sm" />
									</a>
								))}
							</div>
						)}
					</div>

					{/* Explorer */}
					<div>
						<h3 className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--color-secondary)] mb-5">
							{footer.exploreTitle || "Explorer"}
						</h3>
						<ul className="space-y-3">
							{(footer.exploreLinks || []).map((l, i) => (
								<li key={`${l.href}-${i}`}>
									<Link href={l.href} className="text-sm text-white/70 hover:text-white transition-colors">
										{l.label}
									</Link>
								</li>
							))}
						</ul>
					</div>

					{/* S'engager */}
					<div>
						<h3 className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--color-secondary)] mb-5">
							{footer.engageTitle || "S'engager"}
						</h3>
						<ul className="space-y-3">
							{(footer.engageLinks || []).map((l, i) => (
								<li key={`${l.href}-${i}`}>
									<Link href={l.href} className="text-sm text-white/70 hover:text-white transition-colors">
										{l.label}
									</Link>
								</li>
							))}
						</ul>
					</div>

					{/* Contact */}
					<div>
						<h3 className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--color-secondary)] mb-5">
							{footer.contactTitle || "Contact"}
						</h3>
						<ul className="space-y-4 text-sm text-white/70">
							{contact?.address && (
								<li className="flex items-start gap-3">
									<FontAwesomeIcon icon={faLocationDot} className="mt-0.5 text-[var(--color-secondary)]" />
									<span>{contact.address}</span>
								</li>
							)}
							{phones.length > 0 && (
								<li className="flex items-start gap-3">
									<FontAwesomeIcon icon={faPhone} className="mt-0.5 text-[var(--color-secondary)]" />
									<span>
										{phones.map((p) => (
											<a key={p} href={`tel:${p.replace(/\s/g, "")}`} className="hover:text-white transition-colors block">{p}</a>
										))}
									</span>
								</li>
							)}
							{contact?.email && (
								<li className="flex items-start gap-3">
									<FontAwesomeIcon icon={faEnvelope} className="mt-0.5 text-[var(--color-secondary)]" />
									<a href={`mailto:${contact.email}`} className="hover:text-white transition-colors break-all">
										{contact.email}
									</a>
								</li>
							)}
						</ul>
					</div>
				</div>

				<div className="mt-12 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-3">
					<p className="text-xs text-white/50">
						&copy; {new Date().getFullYear()} {name} — {footer.rights || "Organisation Non Gouvernementale. Tous droits réservés."}
					</p>
					{footer.tagline && (
						<p className="text-xs text-white/50">{footer.tagline}</p>
					)}
				</div>
			</div>
		</footer>
	);
}
