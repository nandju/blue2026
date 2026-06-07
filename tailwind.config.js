/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		"./pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			colors: {
				blue: {
					primary: '#0D6EBB',
					secondary: '#0DBD9F',
				},
				'blue-primary': '#0D6EBB',
				'blue-secondary': '#FFFFFF',
				'blue-tertiary': '#0DBD9F',
			},
			fontFamily: {
				outfit: ['Outfit', 'sans-serif'],
			},
		},
	},
	plugins: [],
	// Add this to reduce CSS file size in production
	future: {
		removeDeprecatedGapUtilities: true,
		purgeLayersByDefault: true,
	},
};
