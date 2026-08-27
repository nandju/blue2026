import Footer from "@/components/Footer";

export const metadata = {
  title: "À Propos de BLUE | Notre Histoire et Mission",
  description: "Découvrez BLUE, une ONG ivoirienne fondée en 2022 pour lutter contre la pollution plastique et former des ambassadeurs environnementaux en Côte d'Ivoire.",
  keywords: ["BLUE", "ONG Côte d'Ivoire", "histoire BLUE", "mission environnement", "pollution plastique", "Abidjan", "bénévolat"],
  openGraph: {
    title: "À Propos de BLUE | Notre Histoire et Mission",
    description: "Découvrez BLUE, une ONG ivoirienne fondée en 2022 pour lutter contre la pollution plastique.",
    url: "https://www.bluemakers.net/about",
    siteName: "BLUE",
    type: "website",
  },
};

export default function AboutLayout({ children }) {
  return (
    <>
      {children}
      <Footer />
    </>
  );
}
