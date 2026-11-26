import { BadRequestError, NotFoundError } from "@/lib/data";
import { requireAdmin } from "@/lib/apiAuth";
import { apiHandler } from "@/lib/apiHandler";
import { filesPathOf } from "@/lib/data/local/recruitment";
import { createReadStream } from "node:fs";
import fs from "node:fs/promises";
import { Readable } from "node:stream";

// Sert une pièce jointe de candidature — admin uniquement (les fichiers sont
// stockés dans data/recruitment-files/, jamais dans public/).
export const GET = apiHandler(async (req, ctx) => {
	const unauthorized = await requireAdmin();
	if (unauthorized) return unauthorized;
	const { name } = await ctx.params;
	const abs = filesPathOf(name);
	if (!abs) throw new BadRequestError("Nom de fichier invalide.");

	let stat;
	try {
		stat = await fs.stat(abs);
	} catch {
		throw new NotFoundError("Fichier introuvable.");
	}

	const ext = (name.split(".").pop() || "").toLowerCase();
	const mime =
		{ jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", pdf: "application/pdf", doc: "application/msword", docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" }[ext] ||
		"application/octet-stream";

	return new Response(Readable.toWeb(createReadStream(abs)), {
		headers: {
			"Content-Type": mime,
			"Content-Length": String(stat.size),
			"Content-Disposition": `inline; filename="${encodeURIComponent(name)}"`,
			"Cache-Control": "private, no-store",
		},
	});
});
