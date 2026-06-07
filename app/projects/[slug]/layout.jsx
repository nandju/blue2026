import jsonData from "@/json/data.json";

export async function generateMetadata({ params }) {
	const { slug } = await params;
	const project = jsonData.Projects.find((item) => item.slug === slug);

	if (!project) {
		return { title: "Non Trouvé | BLUE" };
	}

	return {
		title: `${project.title} | BLUE`,
		description: project.desc[0]?.slice(0, 160),
	};
}

export default function Layout({ children }) {
	return children;
}
