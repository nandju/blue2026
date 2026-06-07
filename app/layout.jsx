import "./globals.css";
import { Outfit } from "next/font/google";
import Navbar from "@/components/Navbar";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
config.autoAddCss = false;
import { Analytics } from "@vercel/analytics/react";
import Chat from "@/components/Chat";
import ClientTopProgressBar from "@/components/ClientTopProgressBar";

const outfit = Outfit({
	subsets: ["latin"],
	weight: ["300", "400", "500", "600", "700", "800"],
	display: "swap",
	variable: "--font-outfit",
});

export const metadata = {
	metadataBase: new URL("https://www.bluemakers.net"),
	title: "BLUE | Ensemble Contre la Pollution Plastique",

	description:
		"BLUE est une ONG ivoirienne dédiée à la lutte contre la pollution plastique. Nous mobilisons citoyens, entreprises et communautés pour protéger l'environnement et construire un avenir durable.",

	author: "BLUE - Organisation Non Gouvernementale",
	siteUrl: "https://www.bluemakers.net",
	applicationName: "BLUE",

	keywords: [
		"BLUE",
		"BLUE Makers",
		"ONG Côte d'Ivoire",
		"pollution plastique",
		"environnement",
		"recyclage",
		"développement durable",
		"Abidjan",
		"protection océans",
		"reforestation",
	],

	openGraph: {
		type: "website",
		url: "https://www.bluemakers.net",
		title: "BLUE | Ensemble Contre la Pollution Plastique",
		siteName: "BLUE",
		description: "ONG ivoirienne dédiée à la lutte contre la pollution plastique et la protection de l'environnement.",
		images: [
			{
				url: "/og-image-rev.png",
				alt: "BLUE - Organisation Non Gouvernementale",
				width: 1200,
				height: 630,
			},
		],
	},
};

const jsonLd = {
	"@context": "https://schema.org",
	"@type": "Organization",
	name: "BLUE",
	url: "https://www.bluemakers.net",
	description: "Organisation non gouvernementale dédiée à la lutte contre la pollution plastique en Côte d'Ivoire",
	foundingDate: "2022-01",
	address: {
		"@type": "PostalAddress",
		addressLocality: "Abidjan",
		addressCountry: "CI",
	},
	contactPoint: {
		"@type": "ContactPoint",
		telephone: "+225-0778060961",
		email: "blue@bluemakers.net",
		contactType: "Customer Service",
	},
	sameAs: [
		"https://www.facebook.com/bluemakers",
		"https://www.linkedin.com/company/bluemakers",
		"https://www.instagram.com/bluemakers",
	],
};

export default function RootLayout({ children }) {
	return (
		<html lang="fr" className={`${outfit.variable}`}>
			<body>
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
				/>
				<ClientTopProgressBar />
				<Navbar />
				{children}
				<Chat />
				<Analytics />
			</body>
		</html>
	);
}
