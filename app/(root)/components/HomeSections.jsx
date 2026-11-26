"use client";
import { useContent } from "@/components/SiteContentProvider";
import HeroSection from "./HeroSection";
import MissionSection from "./MissionSection";
import GallerySection from "./GallerySection";
import AxesSection from "./AxesSection";
import QuoteSection from "./QuoteSection";
import ProjectsSection from "./ProjectsSection";
import VolunteerSection from "./VolunteerSection";
import AcademySection from "./AcademySection";
import CommunitySection from "./CommunitySection";
import PartnersCtaSection from "./PartnersCtaSection";
import CtaSection from "./CtaSection";

const COMPONENTS = {
	hero: HeroSection,
	mission: MissionSection,
	gallery: GallerySection,
	axes: AxesSection,
	quote: QuoteSection,
	projects: ProjectsSection,
	volunteer: VolunteerSection,
	academy: AcademySection,
	community: CommunitySection,
	partnersCta: PartnersCtaSection,
	cta: CtaSection,
};

export default function HomeSections() {
	const layout = useContent("home.layout") || { order: [], hidden: [] };
	const hidden = new Set(layout.hidden || []);
	return (layout.order || [])
		.filter((id) => !hidden.has(id) && COMPONENTS[id])
		.map((id) => {
			const Section = COMPONENTS[id];
			return <Section key={id} />;
		});
}
