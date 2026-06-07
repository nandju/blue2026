import Footer from "@/components/Footer";

export const metadata = {
  title: "Nos Projets | BLUE",
  description:
    "Découvrez nos initiatives environnementales : RECYCL'DAY, Journée Mondiale des Océans, reforestation, BLUE Academy et recyclage créatif pour un avenir durable.",
};
export default function Layout({ children }) {
  return (
    <>
      {children}
      <Footer />
    </>
  );
}