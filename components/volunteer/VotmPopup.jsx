"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import PetalsCelebration from "@/components/volunteer/PetalsCelebration";
import { votmTexts } from "@/lib/volunteerModel";

const isExternal = (src) => /^https?:\/\//.test(src || "");

export function VolunteerAvatar({ volunteer, size = 96 }) {
  const initials = (volunteer.firstName?.[0] || "") + (volunteer.lastName?.[0] || "");
  return (
    <div
      className="rounded-full border-4 border-white shadow-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center overflow-hidden relative shrink-0"
      style={{ width: size, height: size }}>
      {volunteer.photo ? (
        <Image
          src={volunteer.photo}
          alt={`${volunteer.firstName} ${volunteer.lastName}`}
          fill
          sizes={`${size}px`}
          unoptimized={isExternal(volunteer.photo)}
          className="object-cover"
        />
      ) : (
        <span className="text-white font-bold" style={{ fontSize: size * 0.32 }}>
          {initials}
        </span>
      )}
    </div>
  );
}

// Popup « Bénévole du mois » — présentation pure : aucune logique de
// fréquence ni de planification ici (gérée par le contrôleur).
export default function VotmPopup({ volunteer, petals = false, onClose }) {
  const texts = votmTexts(volunteer);
  return (
    <>
      {petals && <PetalsCelebration />}
      <motion.div
        className="fixed inset-0 z-[200] flex items-center justify-center px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}>
        <motion.div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
        <motion.div
          className="relative z-10 bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
          initial={{ scale: 0.85, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 40 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}>
          <div className="bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] px-8 pt-8 pb-16 text-center relative">
            <button
              onClick={onClose}
              aria-label="Fermer"
              className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors text-xl">
              ✕
            </button>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 text-white text-xs font-medium mb-4">
              <span>🌟</span>
              <span>{texts.badge}</span>
            </motion.div>
            <h2 className="text-white text-2xl font-bold">
              {volunteer.firstName} {volunteer.lastName}
            </h2>
            {volunteer.location && <p className="text-white/80 text-sm mt-1">📍 {volunteer.location}</p>}
          </div>

          <div className="flex justify-center -mt-12 mb-4 relative z-10">
            <VolunteerAvatar volunteer={volunteer} size={96} />
          </div>

          <div className="px-8 pb-8 space-y-4">
            {volunteer.actions && (
              <div className="bg-[rgb(var(--color-primary-rgb)/0.06)] rounded-2xl p-4">
                <h4 className="text-[var(--color-primary)] font-semibold text-sm mb-1">Actions réalisées</h4>
                <p className="text-gray-600 text-sm leading-relaxed">{volunteer.actions}</p>
              </div>
            )}
            {volunteer.contribution && (
              <div className="bg-[rgb(var(--color-secondary-rgb)/0.08)] rounded-2xl p-4">
                <h4 className="text-[var(--color-secondary)] font-semibold text-sm mb-1">Contribution environnementale</h4>
                <p className="text-gray-600 text-sm leading-relaxed">{volunteer.contribution}</p>
              </div>
            )}
            <button
              onClick={onClose}
              className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-secondary)] text-white rounded-2xl py-3 font-semibold transition-colors duration-300">
              {texts.popupButton}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}
