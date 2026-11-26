import { getProjectBySlug } from "@/lib/content/siteData.server";

export async function generateMetadata({ params }) {
	const { slug } = await params;
	const project = await getProjectBySlug(slug);

	if (!project || project.show === false) {
		return { title: "Non Trouvé | BLUE" };
	}

	return {
		title: `${project.title} | BLUE`,
		description: project.desc?.[0]?.slice(0, 160),
	};
}

export default function Layout({ children }) {
	return children;
}
