import Image from "next/image";
import Card from "./spotify/card";
import { motion } from "framer-motion";
import Me1 from "@/public/ong_blue/images/illustrations/page-landing/action_1.jpg";
import Me2 from "@/public/ong_blue/images/illustrations/page-landing/action_3.jpg";
import Me3 from "@/public/ong_blue/images/illustrations/page-landing/ocean-conservation-initiative-blue.jpg";
import Hr from "@/components/Hr";

function Title() {
	return (
		<div className="mt-10 flex flex-col justify-start items-center w-full pl-10 md:pl-32">
			<div className="flex justify-center items-center flex-col my-5 self-start ">
				<Hr variant="long"></Hr>
				<h1 className="text-3xl font-bold mt-3 text-[#0D6EBB]">Notre Histoire</h1>
			</div>
		</div>
	);
}

export default function About() {
	return (
		<>
			<Title />
			<div className="relative mx-auto container gap-4 px-10 grid grid-cols-1 md:grid-cols-2 mb-10">
				<div className="flex justify-center items-start flex-col mb-5 ">
					<div className="images relative w-full  aspect-square">
						<div className="absolute top-28 left-10 w-[50%]  aspect-square grayscale hover:grayscale-0 transition-all ease duration-300">
							<motion.div
								initial={{ opacity: 0, scale: 0.5, x: 100 }}
								whileInView={{
									opacity: 1,
									scale: 1,
									x: 0,
								}}
								className="relative w-full h-full">
								<Image
									src={Me1}
									alt="Alvalens"
									fill
									sizes="(max-width: 768px) 80vw, 40vw"
									className="object-cover"
									placeholder="blur"
								/>
							</motion.div>
						</div>
						<div className="absolute top-16 right-28 w-[30%]  aspect-square grayscale hover:grayscale-0 transition-all ease duration-300">
							<motion.div
								initial={{
									opacity: 0,
									scale: 0.5,
									x: -100,
								}}
								whileInView={{
									opacity: 1,
									scale: 1,
									x: 0,
								}}
								transition={{ delay: 0.3 }}
								className="relative w-full h-full">
								<Image
									src={Me2}
									alt="Alvalens"
									fill
									sizes="(max-width: 768px) 60vw, 25vw"
									className="object-cover"
									placeholder="blur"
								/>
							</motion.div>
						</div>
						<div className="absolute bottom-16 right-20 w-[40%]  aspect-square grayscale hover:grayscale-0 transition-all ease duration-300">
							<motion.div
								initial={{
									opacity: 0,
									scale: 0.5,
									x: -100,
								}}
								whileInView={{
									opacity: 1,
									scale: 1,
									x: 0,
								}}
								transition={{
									delay: 0.5,
								}}
								className="relative w-full h-full">
								<Image
									src={Me3}
									alt="Alvalens"
									fill
									sizes="(max-width: 768px) 80vw, 35vw"
									className="object-cover"
									placeholder="blur"
								/>
							</motion.div>
						</div>
					</div>
				</div>
				<motion.div
					className="flex justify-center items-start flex-col mb-5 md:px-10"
					initial={{
						opacity: 0,
						x: 200,
					}}
					whileInView={{
						opacity: 1,
						x: 0,
					}}
					transition={{
						delay: 0.5,

						type: "spring",
					}}>
					<h2 className="text-2xl font-bold tracking-wider mb-3 text-[#0D6EBB]">
						BLUE - Ensemble Contre la Pollution Plastique
					</h2>
					<p className="text-gray-600 text-justify title text-lg leading-relaxed">
						BLUE est une{" "}
						<span className="text-black font-medium">
							organisation non gouvernementale{" "}
						</span>
						fondée en janvier 2022 à{" "}
						<span className="text-black font-medium">
							Abidjan, Côte d'Ivoire
						</span>
						. Notre mission est de lutter contre la pollution plastique en formant des{" "}
						<span className="text-black font-medium">
							ambassadeurs environnementaux
						</span>
						{" "}et en mobilisant les communautés pour un avenir durable. Depuis notre création, nous avons organisé des dizaines d'événements de collecte de déchets, sensibilisé des milliers de personnes et planté des centaines d'arbres.
						<br />
						<br />
						Nos actions incluent{" "}
						<span className="text-black font-medium">
							RECYCL'DAY
						</span>
						, notre événement phare de nettoyage des plages et lagunes, ainsi que{" "}
						<span className="text-black font-medium">
							BLUE Academy
						</span>
						, notre plateforme de formation en ligne. Nous croyons fermement que l'éducation environnementale et l'action collective sont les clés pour{" "}
						<span className="text-black font-medium">
							protéger nos océans et construire un avenir durable
						</span>
						. Rejoignez-nous dans notre mission pour un environnement plus propre et plus sain pour les générations futures.
					</p>
					<Card />
				</motion.div>
			</div>
		</>
	);
}
