import { getCourseServer } from "@/lib/db/courses.server";

export async function generateMetadata({ params }) {
  const { courseId } = await params;
  const course = await getCourseServer(courseId);
  if (!course) {
    return {
      title: "Formation introuvable | Blue Academy",
      description: "Cette formation n'existe pas ou a été supprimée.",
    };
  }
  return {
    title: `${course.title} | Blue Academy - BLUE`,
    description: course.description,
    keywords: [course.category, course.level, "formation", "environnement", "BLUE", "Côte d'Ivoire", "pollution plastique", "recyclage"],
    openGraph: {
      title: `${course.title} | Blue Academy`,
      description: course.description,
      url: `https://www.bluemakers.net/academy/${course.id}`,
      siteName: "BLUE",
      type: "website",
    },
  };
}

export default function CourseLayout({ children }) {
  return <>{children}</>;
}
