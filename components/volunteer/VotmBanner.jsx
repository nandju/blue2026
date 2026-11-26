"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import { votmTexts } from "@/lib/volunteerModel";

const isExternal = (src) => /^https?:\/\//.test(src || "");

// Bannière fixe en haut de page — présentation pure.
export default function VotmBanner({ volunteer, onViewProfile, onClose }) {
  const texts = votmTexts(volunteer);
  const initials = (volunteer.firstName?.[0] || "") + (volunteer.lastName?.[0] || "");
  return (
    <motion.div
      initial={{ y: -48, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -48, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed top-0 left-0 right-0 z-[60] bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] h-12 flex items-center justify-between px-4 md:px-8 shadow-md">
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="relative w-7 h-7 rounded-full overflow-hidden border border-white/50 bg-white/20 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
          {volunteer.photo ? (
            <Image
              src={volunteer.photo}
              alt=""
              fill
              sizes="28px"
              unoptimized={isExternal(volunteer.photo)}
              className="object-cover"
            />
          ) : (
            initials
          )}
        </span>
        <p className="text-white text-xs md:text-sm font-medium truncate">
          🌟 {texts.bannerText}
        </p>
      </div>
      <div className="flex items-center gap-3 ml-4 shrink-0">
        {onViewProfile && (
          <button
            onClick={onViewProfile}
            className="text-white bg-white/20 hover:bg-white/30 rounded-full px-3 py-1 text-xs font-semibold transition-colors whitespace-nowrap">
            {texts.bannerButton}
          </button>
        )}
        <button
          onClick={onClose}
          aria-label="Fermer"
          className="text-white/70 hover:text-white text-sm transition-colors">
          ✕
        </button>
      </div>
    </motion.div>
  );
}
