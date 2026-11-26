import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { projects } from "@/lib/data";
import { requireAdmin, getOperator } from "@/lib/apiAuth";
import { apiHandler, parseJson } from "@/lib/apiHandler";
import { projectCreateSchema, projectsOrderSchema } from "@/lib/validation";
import { BadRequestError, ConflictError } from "@/lib/data/errors";
import { getAllProjects } from "@/lib/content/siteData.server";
import { logAdminAction } from "@/lib/adminLog.server";
import { ACTIONS, MODULES } from "@/lib/adminLogConstants";

// GET → tous les projets (y compris masqués), triés par position.
export const GET = apiHandler(async () => {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  return NextResponse.json(await getAllProjects());
});

// POST → création d'un projet (slug unique obligatoire).
export const POST = apiHandler(async (req) => {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const data = await parseJson(req, projectCreateSchema);
  if (await projects.get(data.slug)) {
    throw new ConflictError(`Le slug « ${data.slug} » est déjà utilisé par un autre projet.`);
  }
  const all = await projects.list();
  const position = all.reduce((max, p) => Math.max(max, Number(p.position) || 0), 0) + 1;
  const record = await projects.create({ id: data.slug, ...data, position }, await getOperator());

  await logAdminAction({
    action: ACTIONS.CREATE,
    module: MODULES.CONTENT,
    target: `Projet « ${record.title} »`,
    changes: [{ field: "Projet", from: null, to: `${record.title} (/${record.slug})` }],
  });
  revalidateTag("site-content");
  return NextResponse.json(record, { status: 201 });
});

// PUT { order: [id, …] } → réordonnancement (positions 1..n).
export const PUT = apiHandler(async (req) => {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { order } = await parseJson(req, projectsOrderSchema);
  const all = await projects.list();
  const known = new Set(all.map((p) => String(p.id)));
  if (order.some((id) => !known.has(id))) {
    throw new BadRequestError("Projet inconnu dans l'ordre fourni.");
  }
  const operator = await getOperator();
  for (let i = 0; i < order.length; i++) {
    const p = all.find((x) => String(x.id) === order[i]);
    if (p && p.position !== i + 1) await projects.update(p.id, { position: i + 1 }, operator);
  }
  // Les projets absents de la liste passent à la fin, en conservant leur ordre.
  const rest = all.filter((p) => !order.includes(String(p.id)));
  for (let i = 0; i < rest.length; i++) {
    await projects.update(rest[i].id, { position: order.length + i + 1 }, operator);
  }

  await logAdminAction({
    action: ACTIONS.UPDATE,
    module: MODULES.CONTENT,
    target: "Ordre des projets",
    changes: [{ field: "Ordre", from: null, to: `${order.length} projet(s)` }],
  });
  revalidateTag("site-content");
  return NextResponse.json(await getAllProjects());
});
