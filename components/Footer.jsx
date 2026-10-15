import Link from "next/link";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faFacebookF,
	faInstagram,
	faLinkedinIn,
	faWhatsapp,
} from "@fortawesome/free-brands-svg-icons";
import {
	faPhone,
	faEnvelope,
	faLocationDot,
} from "@fortawesome/free-solid-svg-icons";

import Logo from "@/public/ong_blue/images/logo.png";

const SOCIALS = [
	{ href: "https://www.facebook.com/bluemakers", icon: faFacebookF, label: "Facebook" },
	{ href: "https://www.instagram.com/bluemakers", icon: faInstagram, label: "Instagram" },
	{ href: "https://www.linkedin.com/company/bluemakers", icon: faLinkedinIn, label: "LinkedIn" },
	{ href: "https://chat.whatsapp.com/CTyNHv6t1VJ22htKymlt4w", icon: faWhatsapp, label: "WhatsApp" },
];

const EXPLORE = [
	{ href: "/", label: "Accueil" },
	{ href: "/about", label: "À propos de BLUE" },
	{ href: "/projects", label: "Nos actions" },
	{ href: "/projects/archive", label: "Archives" },
];

const PROGRAMS = [
	{ href: "/academy", label: "Blue Academy" },
	{ href: "/benevolat", label: "Devenir bénévole" },
	{ href: "/partenaires", label: "Nos partenaires" },
	{ href: "/contact", label: "Nous contacter" },
];

export default function Footer() {
	return (
		<footer className="bg-[#062E52] text-white">
			<div className="mx-auto max-w-7xl px-6 md:px-8 pt-16 pb-8">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
					{/* Brand */}
					<div>
						<Link href="/" className="flex items-center gap-3">
							<span className="relative w-11 h-11 rounded-full overflow-hidden bg-white flex items-center justify-center">
								<Image src={Logo} alt="Logo BLUE" fill sizes="44px" className="object-contain p-1" />
							</span>
							<span className="text-2xl font-extrabold tracking-[0.18em]">BLUE</span>
						</Link>
						<p className="mt-5 text-sm leading-relaxed text-white/70">
							ONG ivoirienne fondée en janvier 2022 à Abidjan. Nous luttons contre
							la pollution plastique, protégeons les océans et formons des
							ambassadeurs de l&apos;environnement.
						</p>
						<div className="mt-6 flex items-center gap-3">
							{SOCIALS.map((s) => (
								<a
									key={s.label}
									href={s.href}
									target="_blank"
									rel="noopener noreferrer"
									aria-label={s.label}
									className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#0DBD9F] flex items-center justify-center transition-colors duration-300">
									<FontAwesomeIcon icon={s.icon} className="text-sm" />
								</a>
							))}
						</div>
					</div>

					{/* Explorer */}
					<div>
						<h3 className="text-sm font-bold uppercase tracking-[0.2em] text-[#0DBD9F] mb-5">
							Explorer
						</h3>
						<ul className="space-y-3">
							{EXPLORE.map((l) => (
								<li key={l.href}>
									<Link href={l.href} className="text-sm text-white/70 hover:text-white transition-colors">
										{l.label}
									</Link>
								</li>
							))}
						</ul>
					</div>

					{/* Programmes */}
					<div>
						<h3 className="text-sm font-bold uppercase tracking-[0.2em] text-[#0DBD9F] mb-5">
							S&apos;engager
						</h3>
						<ul className="space-y-3">
							{PROGRAMS.map((l) => (
								<li key={l.href}>
									<Link href={l.href} className="text-sm text-white/70 hover:text-white transition-colors">
										{l.label}
									</Link>
								</li>
							))}
						</ul>
					</div>

					{/* Contact */}
					<div>
						<h3 className="text-sm font-bold uppercase tracking-[0.2em] text-[#0DBD9F] mb-5">
							Contact
						</h3>
						<ul className="space-y-4 text-sm text-white/70">
							<li className="flex items-start gap-3">
								<FontAwesomeIcon icon={faLocationDot} className="mt-0.5 text-[#0DBD9F]" />
								<span>Abidjan, Côte d&apos;Ivoire</span>
							</li>
							<li className="flex items-start gap-3">
								<FontAwesomeIcon icon={faPhone} className="mt-0.5 text-[#0DBD9F]" />
								<span>
									<a href="tel:+2250778060961" className="hover:text-white transition-colors block">+225 07 78 06 09 61</a>
									<a href="tel:+2250709611341" className="hover:text-white transition-colors block">+225 07 09 61 13 41</a>
								</span>
							</li>
							<li className="flex items-start gap-3">
								<FontAwesomeIcon icon={faEnvelope} className="mt-0.5 text-[#0DBD9F]" />
								<a href="mailto:blue@bluemakers.net" className="hover:text-white transition-colors break-all">
									blue@bluemakers.net
								</a>
							</li>
						</ul>
					</div>
				</div>

				<div className="mt-12 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-3">
					<p className="text-xs text-white/50">
						&copy; {new Date().getFullYear()} BLUE — Organisation Non Gouvernementale. Tous droits réservés.
					</p>
					<p className="text-xs text-white/50">
						Ensemble contre la pollution plastique 🌊
					</p>
				</div>
			</div>
		</footer>
	);
}
