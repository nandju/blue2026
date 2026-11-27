"use client";
import { motion } from "framer-motion";

const STEPS = [
	{ id: "access", label: "Accès" },
	{ id: "modules", label: "Modules" },
	{ id: "quiz", label: "Quiz" },
	{ id: "certificate", label: "Certificat" },
];

const stageToStep = { register: 0, content: 1, quiz: 2, certificate: 3 };

// Fil d'étapes permanent du parcours apprenant : Accès → Modules → Quiz →
// Certificat, avec l'étape en cours mise en évidence.
export default function StepThread({ stage }) {
	const current = stageToStep[stage] ?? 0;
	return (
		<div className="w-full max-w-2xl mx-auto px-4">
			<div className="flex items-center">
				{STEPS.map((s, i) => (
					<div key={s.id} className="flex items-center flex-1 last:flex-none">
						<div className="flex flex-col items-center">
							<motion.div
								animate={{
									scale: i === current ? 1.15 : 1,
									backgroundColor: i <= current ? "var(--color-primary)" : "#e5e7eb",
								}}
								className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
									i <= current ? "text-white" : "text-gray-400"
								}`}>
								{i < current ? "✓" : i + 1}
							</motion.div>
							<span className={`mt-1 text-[11px] font-medium whitespace-nowrap ${i === current ? "text-[var(--color-primary)]" : i < current ? "text-gray-500" : "text-gray-300"}`}>
								{s.label}
							</span>
						</div>
						{i < STEPS.length - 1 && (
							<div className={`flex-1 h-0.5 mx-1 mb-5 rounded ${i < current ? "bg-[var(--color-primary)]" : "bg-gray-200"}`} />
						)}
					</div>
				))}
			</div>
		</div>
	);
}
