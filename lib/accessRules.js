// Règle d'accès à une formation — fonction UNIQUE, utilisée côté serveur
// (routes API) et côté navigateur (affichage du paywall).
//
//   canAccess(learner, course)
//     - membre actif → accès à toutes les formations (gratuit)
//     - formation gratuite (price_fcfa === 0) → accès à tout le monde
//     - paiement validé pour cette formation (courseAccess) → accès
//     - sinon → refus

import { missingMessage, missingForActive } from "./memberModel";

/** learner : membre connecté ({ status, access: [courseId…] }) ou null. */
export function canAccess(learner, course) {
	if (!course) return { allowed: false, reason: "notfound" };
	const price = Number(course.price_fcfa) || 0;
	if (price <= 0) return { allowed: true, reason: "free" };
	if (learner?.kind !== "external" && learner?.status === "active") {
		return { allowed: true, reason: "activeMember" };
	}
	if (learner && (learner.access || []).includes(course.id)) {
		return { allowed: true, reason: "paid" };
	}
	return { allowed: false, reason: "paywall" };
}

/** Ce qui bloque un apprenant connecté qui ne peut pas accéder à une formation. */
export function paywallInfo(learner, course) {
	if (!learner) {
		return {
			connected: false,
			price: Number(course?.price_fcfa) || 0,
			missing: null,
			kind: null,
		};
	}
	return {
		connected: true,
		price: Number(course?.price_fcfa) || 0,
		kind: learner.kind || "member",
		missing: learner.kind === "external" ? null : missingForActive(learner),
		missingMessage: learner.kind === "external" ? null : missingMessage(learner),
		status: learner.status,
	};
}
