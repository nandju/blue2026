"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";

import Img404 from "@/public/ong_blue/images/illustrations/page-introuvable/404-erreur.png";

export default function NotFound() {
	return (
		<div className="min-h-screen flex flex-col items-center justify-center px-6 py-24 bg-[#f4f9fd] text-center">
			<div className="relative w-64 h-64 md:w-80 md:h-80">
				<Image
					src={Img404}
					alt="Page introuvable"
					fill
					sizes="320px"
					className="object-contain"
					priority
				/>
			</div>
			<h1 className="mt-6 text-3xl md:text-5xl font-bold text-[var(--color-dark)]">
				Page introuvable
			</h1>
			<p className="mt-4 text-gray-600 max-w-md">
				La page que vous recherchez n&apos;existe pas ou a été déplacée.
				Revenons ensemble sur le droit chemin.
			</p>
			<div className="mt-8 flex flex-wrap justify-center gap-4">
				<Link
					href="/"
					className="rounded-full bg-[var(--color-primary)] px-8 py-3 text-sm font-semibold text-white shadow-lg hover:bg-[var(--color-secondary)] transition-colors">
					Retour à l&apos;accueil
				</Link>
				<button
					onClick={() => window.history.back()}
					className="rounded-full border-2 border-[var(--color-primary)] px-8 py-3 text-sm font-semibold text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-colors">
					Page précédente
				</button>
			</div>
		</div>
	);
}
