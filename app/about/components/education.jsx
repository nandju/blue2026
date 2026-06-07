import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faMedal,
	faGraduationCap,
	faTrophy,
	faAward,
	faChevronDown,
	faChevronUp,
} from "@fortawesome/free-solid-svg-icons";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import Me4 from "@/public/ong_blue/images/illustrations/page-landing/blue_training_4.png";
import Me5 from "@/public/ong_blue/images/illustrations/page-landing/blue_training_5.png";
import Me6 from "@/public/ong_blue/images/illustrations/page-accueil/ite-5.jpg";

function Wrapper({ children }) {
	return (
		<div className="mx-auto container gap-10 p-10 grid grid-cols-1 my-10">
			<motion.div
				className="flex justify-center items-start flex-col mb-5"
				initial={{
					opacity: 0,
					y: 50,
				}}
				whileInView={{
					opacity: 1,
					y: 0,
				}}
				transition={{
					delay: 0.3,
					duration: 0.8,
					type: "spring",
					stiffness: 100,
				}}>
				{children}
			</motion.div>
		</div>
	);
}

export default function Education() {
	const [isExpanded, setIsExpanded] = useState(false);

	const achievementsByYear = {
		2025: [
			{
				icon: faMedal,
				title: "1st place (Gold Medal)",
				subtitle: "Fesmaro IT Business Competition",
				date: "Mar 2025",
				color: "from-yellow-400 to-orange-500",
			},
			{
				icon: faAward,
				title: "Finalist",
				subtitle: "Hackfest Build to Billion 2025",
				date: "Apr 2025",
				color: "from-blue-500 to-purple-600",
			},
			{
				icon: faMedal,
				title: "3rd place (Bronze Medal)",
				subtitle: "Faculty of Engineering Most Outstanding Student",
				date: "Feb 2025",
				color: "from-amber-600 to-yellow-600",
			},
		],
		2024: [
			{
				icon: faTrophy,
				title: "Special Award | Gold Medal | Incubation Opportunity",
				subtitle: "Indonesia Inventor Day 2024 (IID)",
				date: "Aug 2024",
				color: "from-yellow-400 to-orange-500",
			},
			{
				icon: faMedal,
				title: "1st place (Gold Medal)",
				subtitle: "Tech & Trade Expo 2024",
				date: "Jul 2024",
				color: "from-yellow-400 to-orange-500",
			},
			{
				icon: faMedal,
				title: "2nd place (Silver Medal)",
				subtitle: "IdeaFest 2024",
				date: "Jul 2024",
				color: "from-slate-400 to-slate-500",
			},
			{
				icon: faAward,
				title: "Finalist",
				subtitle: "37th National Student Science Week (PIMNAS)",
				date: "Oct 2024",
				color: "from-blue-500 to-purple-600",
			},
			{
				icon: faMedal,
				title: "3rd place (Bronze Medal)",
				subtitle: "Student Digital Innovation Competition (LIDM)",
				date: "Jun 2024",
				color: "from-amber-600 to-yellow-600",
			},
			{
				icon: faMedal,
				title: "3rd place (Bronze Medal)",
				subtitle: "Fesmaro UI/UX Design",
				date: "Jun 2024",
				color: "from-amber-600 to-yellow-600",
			},
		],
		2023: [
			{
				icon: faAward,
				title: "Finalist",
				subtitle: "36th National Student Science Week (PIMNAS)",
				date: "Nov 2023",
				color: "from-blue-500 to-purple-600",
			},
			{
				icon: faMedal,
				title: "3rd place (Bronze Medal)",
				subtitle: "FORKAFEST 3.0 Web Development competition",
				date: "Jan 2023",
				color: "from-amber-600 to-yellow-600",
			},
		],
	};

	// Flatten all achievements into a single array for easier limiting
	const allAchievements = Object.entries(achievementsByYear)
		.sort(([a], [b]) => parseInt(b) - parseInt(a))
		.flatMap(([year, achievements]) =>
			achievements.map((achievement) => ({ ...achievement, year }))
		);

	const visibleAchievements = isExpanded
		? allAchievements
		: allAchievements.slice(0, 6);
	const hasMoreAchievements = allAchievements.length > 6;

	return (
		<Wrapper>
			<section className="grid gap-8 md:gap-12">
				{" "}
				{/* Header */}
				<motion.div
					className="text-center space-y-2"
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}>
					<h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-[#0D6EBB]">
						Nos Partenaires
					</h1>
					<p className="text-muted-foreground max-w-[800px] mx-auto">
						Découvrez nos partenaires et collaborations pour l'environnement.
					</p>
				</motion.div>
				{/* Main Content */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
					{/* Education Section - Left */}
					<motion.div
						className="px-5"
						initial={{ opacity: 0, x: -50 }}
						whileInView={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.8, delay: 0.2 }}>
						<div className="font-medium text-lg mb-4 text-[#0D6EBB]">
							Depuis 2022
						</div>
						<div>
							<h2 className="font-semibold text-xl text-[#0D6EBB]">
								Partenariats & Collaborations
							</h2>
							<h3 className="text-md font-normal mb-3">
								Ensemble pour un avenir durable
							</h3>
							<div className="gap-4 mb-4 flex items-stretch md:h-[300px] xl:h-[400px]">
								<div className="flex-[1] transition-all duration-300 ease-in-out hover:flex-[3] group">
									<Image
										src={Me5}
										width={400}
										height={225}
										alt="University"
										className="rounded-lg w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300 ease-in-out"
									/>
								</div>
								<div className="flex-[1] transition-all duration-300 ease-in-out hover:flex-[3] group">
									<Image
										src={Me4}
										width={400}
										height={225}
										alt="University"
										className="rounded-lg w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300 ease-in-out"
									/>
								</div>
								<div className="flex-[1] transition-all duration-300 ease-in-out hover:flex-[3] group">
									<Image
										src={Me6}
										width={400}
										height={225}
										alt="University"
										className="rounded-lg w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300 ease-in-out"
									/>
								</div>
							</div>
							<div className="flex items-center gap-2">
								<p className="text-gray-600 text-justify title text-lg">
									Depuis notre création, BLUE collabore avec{" "}
									<span className="text-black font-medium">
										des organisations locales et internationales
									</span>{" "}
									pour amplifier notre impact environnemental. Nos partenaires incluent{" "}
									<span className="text-black font-medium">
										des écoles, des entreprises et des institutions gouvernementales
									</span>
									, tous engagés dans la lutte contre la pollution plastique.
									<br />
									<br />
									Nous travaillons avec{" "}
									<span className="text-black font-medium">
										des scientifiques et experts environnementaux
									</span>
									{" "}pour garantir que nos actions sont fondées sur des données scientifiques. Nos partenariats avec{" "}
									<span className="text-black font-medium">
										les communautés locales
									</span>
									{" "}assurent que nos initiatives répondent aux besoins réels du terrain.
									<br />
									<br />
									Ensemble, nous construisons un{" "}
									<span className="text-black font-medium">
										réseau solide d'acteurs du changement
									</span>{" "}
									pour{" "}
									<span className="text-black font-medium">
										protéger nos océans et notre environnement
									</span>
									. Rejoignez-nous dans cette mission pour créer un avenir plus propre et plus durable pour tous.
								</p>
							</div>
							<div className="flex flex-wrap gap-2 mt-4 text-sm">
								<div className="bg-[#0D6EBB] text-white px-3 py-1.5 rounded-2xl">
									+50 Partenaires Actifs
								</div>
							</div>
						</div>
					</motion.div>{" "}
					{/* Achievements Section - Right */}
					<motion.div
						className="flex flex-col justify-start px-5 md:px-0"
						initial={{ opacity: 0, x: 50 }}
						whileInView={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.8, delay: 0.4 }}>
						<h2 className="font-semibold text-xl mt-7 text-[#0D6EBB]">
							Reconnaissances
						</h2>
						<p className="text-md font-normal mb-3 md:mb-6">
							Nos récompenses et reconnaissances pour notre engagement environnemental.
						</p>

						{/* Achievements Container with transparent bottom effect */}
						<div className="relative">
							<div className="space-y-4">
								{/* Show visible achievements */}
								<AnimatePresence>
									{visibleAchievements.map(
										(achievement, index) => (
											<motion.div
												key={`${achievement.year}-${index}`}
												className="group"
												initial={{ opacity: 0, y: 20 }}
												animate={{ opacity: 1, y: 0 }}
												exit={{ opacity: 0, y: -20 }}
												transition={{
													duration: 0.5,
													delay: index * 0.05,
												}}>
												{/* Year indicator for first achievement of each year */}
												{index === 0 ||
												visibleAchievements[index - 1]
													?.year !==
													achievement.year ? (
													<div className="flex items-center gap-3 mb-3 mt-2">
														<div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
															<span className="text-xs font-bold text-gray-600">
																{
																	achievement.year
																}
															</span>
														</div>
														<div className="flex-1 h-px bg-gradient-to-r from-gray-300 to-transparent"></div>
													</div>
												) : null}

												{/* Glassmorphism achievement card with monochrome to color effect */}
												<div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-4 shadow-lg hover:bg-white/30 transition-all duration-300 hover:shadow-xl grayscale hover:grayscale-0">
													<div className="flex items-center gap-4">
														<div
															className={`aspect-square w-10 rounded-full bg-gradient-to-r ${achievement.color} flex items-center justify-center text-primary-foreground transition-all duration-300`}>
															<FontAwesomeIcon
																icon={
																	achievement.icon
																}
																className="text-white h-5 w-5"
															/>
														</div>
														<div>
															<h3 className="font-medium">
																{
																	achievement.title
																}
															</h3>
															<p className="text-sm">
																{
																	achievement.subtitle
																}
															</p>
															<div className="text-xs text-gray-500 mt-1">
																{
																	achievement.date
																}
															</div>
														</div>
													</div>
												</div>
											</motion.div>
										),
									)}
								</AnimatePresence>
							</div>

							{/* Transparent bottom overlay when not expanded */}
							{!isExpanded && hasMoreAchievements && (
								<div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-stale-300 via-stale/70 to-transparent pointer-events-none"></div>
							)}

							{/* Expand/Collapse Button */}
							{hasMoreAchievements && (
								<motion.div
									className="flex justify-center mt-6"
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									transition={{ delay: 0.5 }}>
									<button
										onClick={() =>
											setIsExpanded(!isExpanded)
										}
										className="flex items-center gap-2 px-6 py-3 bg-white/30 backdrop-blur-md border border-white/40 rounded-full hover:bg-white/40 transition-all duration-300 text-sm font-medium shadow-lg hover:shadow-xl">
										<span>
											{isExpanded
												? `Voir Moins`
												: `Voir ${allAchievements.length - 4} de Plus`}
										</span>
										<FontAwesomeIcon
											icon={
												isExpanded
													? faChevronUp
													: faChevronDown
											}
											className="h-3 w-3 transition-transform duration-300"
										/>
									</button>
								</motion.div>
							)}
						</div>
					</motion.div>
				</div>
			</section>
		</Wrapper>
	);
}
