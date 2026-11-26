import { recruitment } from "@/lib/data";
import { isVisible } from "@/lib/recruitmentModel";

export async function generateMetadata({ params }) {
	const { slug } = await params;
	const form = await recruitment.getBySlug(slug).catch(() => null);
	if (!form || !isVisible(form.status)) {
		return { title: "Recrutement indisponible | BLUE" };
	}
	return {
		title: `${form.title} | Recrutement BLUE`,
		description: form.summary || form.description?.slice(0, 160) || `Postulez : ${form.title}`,
	};
}

export default function Layout({ children }) {
	return children;
}
