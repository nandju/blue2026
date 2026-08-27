import Footer from "@/components/Footer";

export const metadata = {
  title: "Nos Projets | BLUE - Actions Contre la Pollution Plastique",
  description: "Découvrez les projets environnementaux de BLUE : RECYCL'DAY, collectes de déchets, sensibilisation et formations pour un avenir durable en Côte d'Ivoire.",
  keywords: ["BLUE", "projets environnement", "RECYCL'DAY", "collecte plastique", "sensibilisation", "Abidjan", "Côte d'Ivoire", "bénévolat", "nettoyage plage"],
  openGraph: {
    title: "Nos Projets | BLUE - Actions Contre la Pollution Plastique",
    description: "Découvrez les projets environnementaux de BLUE : RECYCL'DAY, collectes de déchets, sensibilisation et formations.",
    url: "https://www.bluemakers.net/projects",
    siteName: "BLUE",
    type: "website",
  },
};

export default function ProjectsLayout({ children }) {
  return (
    <>
      {children}
      <Footer />
    </>
  );
}