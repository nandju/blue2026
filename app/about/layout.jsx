import Footer from "@/components/Footer";

export const metadata = {
  title: "À Propos | BLUE",
  description:
    "BLUE est une ONG ivoirienne fondée en janvier 2022 à Abidjan, dédiée à la lutte contre la pollution plastique. Nous formons des ambassadeurs environnementaux et mobilisons les communautés pour un avenir durable.",
};
export default function Layout({ children }) {
  return (
    <>
      {children}
      <Footer />
    </>
  );
}
