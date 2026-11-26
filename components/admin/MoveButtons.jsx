/** Boutons monter/descendre pour réordonner une liste. */
export default function MoveButtons({ index, length, onMove, label = "l'élément" }) {
  const cls =
    "w-7 h-7 rounded-lg border border-[rgba(13,110,187,0.15)] text-[#0D6EBB] text-xs flex items-center justify-center hover:bg-[rgba(13,110,187,0.06)] disabled:opacity-30 disabled:cursor-not-allowed";
  return (
    <div className="flex flex-col gap-1">
      <button type="button" className={cls} disabled={index === 0} onClick={() => onMove(index, index - 1)} aria-label={`Monter ${label}`}>▲</button>
      <button type="button" className={cls} disabled={index === length - 1} onClick={() => onMove(index, index + 1)} aria-label={`Descendre ${label}`}>▼</button>
    </div>
  );
}

/** Déplace un élément d'un tableau (renvoie une copie). */
export function moveItem(list, from, to) {
  if (to < 0 || to >= list.length) return list;
  const copy = [...list];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
}
