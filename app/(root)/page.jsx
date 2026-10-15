import HeroSection from "./components/HeroSection";
import MissionSection from "./components/MissionSection";
import GallerySection from "./components/GallerySection";
import AxesSection from "./components/AxesSection";
import QuoteSection from "./components/QuoteSection";
import ProjectsSection from "./components/ProjectsSection";
import VolunteerSection from "./components/VolunteerSection";
import AcademySection from "./components/AcademySection";
import CommunitySection from "./components/CommunitySection";
import PartnersCtaSection from "./components/PartnersCtaSection";
import CtaSection from "./components/CtaSection";

export default function HomePage() {
	return (
		<main className="overflow-x-hidden">
			<HeroSection />
			<MissionSection />
			<GallerySection />
			<AxesSection />
			<QuoteSection />
			<ProjectsSection />
			<VolunteerSection />
			<AcademySection />
			<CommunitySection />
			<PartnersCtaSection />
			<CtaSection />
		</main>
	);
}
