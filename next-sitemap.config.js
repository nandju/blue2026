const projects = require("./json/data.json");
const { getCoursesForSitemap } = require("./lib/sitemapCourses.cjs");

/** @type {import('next-sitemap').IConfig} */
module.exports = {
	siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://www.bluemakers.net",
	generateRobotsTxt: true,
	generateIndexSitemap: false,
	exclude: ["/404", "/500"],
	additionalPaths: async () => {
		const now = new Date().toISOString();
		const staticPages = [
			{ path: "/", priority: 1.0, changefreq: "daily" },
			{ path: "/about", priority: 0.9, changefreq: "weekly" },
			{ path: "/projects", priority: 0.9, changefreq: "weekly" },
			{ path: "/projects/archive", priority: 0.7, changefreq: "monthly" },
			{ path: "/academy", priority: 0.9, changefreq: "weekly" },
		];
		const projectPages = projects.Projects.map((project) => ({
			path: `/projects/${project.slug}`,
			priority: project.show ? 0.8 : 0.5,
			changefreq: project.show ? "weekly" : "monthly",
		}));

		const courses = await getCoursesForSitemap();
		const coursePages = courses.map((course) => ({
			path: `/academy/${course.id}`,
			priority: 0.8,
			changefreq: "weekly",
		}));

		return [...staticPages, ...projectPages, ...coursePages].map((page) => ({
			loc: page.path,
			changefreq: page.changefreq,
			priority: page.priority,
			lastmod: now,
		}));
	},
	robotsTxtOptions: {
		policies: [
			{
				userAgent: "*",
				allow: "/",
				disallow: [],
			},
		],
		additionalSitemaps: [],
	},
	transform: async (config, path) => {
		let priority = 0.7;
		let changefreq = "weekly";

		if (path === "/") {
			priority = 1.0;
			changefreq = "daily";
		} else if (path === "/about" || path === "/projects" || path === "/academy") {
			priority = 0.9;
			changefreq = "weekly";
		} else if (path === "/projects/archive") {
			priority = 0.7;
			changefreq = "monthly";
		} else if (path.startsWith("/projects/")) {
			priority = 0.8;
			changefreq = "weekly";
		} else if (path.startsWith("/academy/")) {
			priority = 0.8;
			changefreq = "weekly";
		}

		return {
			loc: path,
			changefreq,
			priority,
			lastmod: new Date().toISOString(),
			alternateRefs: config.alternateRefs ?? [],
		};
	},
};
