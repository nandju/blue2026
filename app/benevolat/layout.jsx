export const metadata = {
	title: "Devenir Bénévole | BLUE - ONG Environnementale",
	description:
		"Rejoignez les bénévoles de BLUE : groupes WhatsApp par zone (Abidjan Nord, Abidjan Sud, intérieur du pays), participation aux nettoyages et actions environnementales en Côte d'Ivoire.",
	keywords: ["bénévole", "volontariat", "BLUE", "ONG", "Abidjan", "Côte d'Ivoire", "environnement", "nettoyage plage", "WhatsApp"],
	openGraph: {
		title: "Devenir Bénévole | BLUE",
		description: "Rejoignez les bénévoles de BLUE et participez aux actions environnementales en Côte d'Ivoire.",
		url: "https://www.bluemakers.net/benevolat",
		siteName: "BLUE",
		type: "website",
	},
};

export default function BenevolatLayout({ children }) {
	return <>{children}</>;
}
