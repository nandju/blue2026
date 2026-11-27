import "server-only";
import { createCollection, nowIso, sameId } from "./collection";

// Progression d'un apprenant connecté dans une formation : la liste des
// modules lus est enregistrée sur le compte (et non plus seulement dans le
// navigateur). Une entrée par couple (learner_id, course_id).

const progressCol = createCollection("learner-progress", { idType: "uuid" });

const forPair = (list, learnerId, courseId) =>
	list.find((p) => sameId(p.learner_id, learnerId) && sameId(p.course_id, courseId)) || null;

export const progress = {
	async getForLearner(courseId, learnerId) {
		return forPair(await progressCol.all(), learnerId, courseId);
	},
	/** Toutes les progressions d'un apprenant (mon espace). */
	async listForLearner(learnerId) {
		return (await progressCol.all()).filter((p) => sameId(p.learner_id, learnerId));
	},
	/** Marque un module comme lu (ensemble, sans doublon). */
	async markRead(courseId, learnerId, moduleIndex) {
		return progressCol.mutate((list) => {
			let rec = forPair(list, learnerId, courseId);
			if (!rec) {
				rec = {
					id: crypto.randomUUID(),
					learner_id: learnerId,
					course_id: courseId,
					modules_read: [],
					created_at: nowIso(),
				};
				list.push(rec);
			}
			const idx = Number(moduleIndex);
			if (Number.isInteger(idx) && idx >= 0 && !rec.modules_read.includes(idx)) {
				rec.modules_read.push(idx);
				rec.modules_read.sort((a, b) => a - b);
			}
			rec.updated_at = nowIso();
			return rec;
		});
	},
	/** Réinitialise la progression (ex. après refonte des modules). */
	async reset(courseId, learnerId) {
		return progressCol.mutate((list) => {
			const rec = forPair(list, learnerId, courseId);
			if (!rec) return null;
			rec.modules_read = [];
			rec.updated_at = nowIso();
			return rec;
		});
	},
	/** Nettoyage en cascade à la suppression d'une formation. */
	async removeForCourse(courseId) {
		return progressCol.mutate((list) => {
			for (let i = list.length - 1; i >= 0; i--) if (sameId(list[i].course_id, courseId)) list.splice(i, 1);
		});
	},
};
