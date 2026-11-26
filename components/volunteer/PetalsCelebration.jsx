"use client";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

// Pétales de célébration : 25-35 pétales SVG qui tombent en tournoyant pendant
// 5-6 s puis disparaissent en fondu. Uniquement transform/opacity,
// pointer-events: none, aucune animation si prefers-reduced-motion.

const COLORS = ["var(--color-primary)", "var(--color-secondary)", "#ffffff"];
const rnd = (min, max) => min + Math.random() * (max - min);

function Petal({ p }) {
  return (
    <motion.svg
      width={p.size}
      height={p.size}
      viewBox="0 0 24 24"
      className="absolute top-0"
      style={{ left: `${p.left}%`, willChange: "transform, opacity" }}
      initial={{ x: 0, y: "-12vh", rotate: p.rot0, opacity: 0 }}
      animate={{
        x: [0, p.sway, -p.sway, p.sway * 0.6, 0],
        y: "112vh",
        rotate: [p.rot0, p.rot0 + p.spin * 0.4, p.rot0 + p.spin * 0.8, p.rot0 + p.spin],
        opacity: [0, 1, 1, 1, 0],
      }}
      transition={{
        duration: p.duration,
        delay: p.delay,
        ease: "linear",
        times: [0, 0.3, 0.55, 0.8, 1],
      }}>
      <path
        d="M12 2 C17 7 19 12 12 22 C5 12 7 7 12 2 Z"
        fill={p.color}
        opacity={p.opacity}
      />
    </motion.svg>
  );
}

export default function PetalsCelebration({ count = 30 }) {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setAllowed(!reduced);
  }, []);

  const petals = useMemo(() => {
    const mobile = typeof window !== "undefined" && window.innerWidth < 640;
    const n = mobile ? Math.min(count, 16) : count;
    return Array.from({ length: n }, (_, i) => ({
      id: i,
      left: rnd(2, 96),
      size: rnd(12, 26),
      duration: rnd(5, 6),
      delay: rnd(0, 0.9),
      sway: rnd(20, 90),
      spin: rnd(160, 540) * (Math.random() < 0.5 ? -1 : 1),
      rot0: rnd(0, 360),
      color: COLORS[i % COLORS.length],
      opacity: rnd(0.75, 1),
    }));
  }, [count]);

  if (!allowed) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[210] overflow-hidden">
      {petals.map((p) => (
        <Petal key={p.id} p={p} />
      ))}
    </div>
  );
}
