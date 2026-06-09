"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getVolunteer } from "@/lib/store";

const SESSION_SHOWN_KEY = "blue_volunteer_popup_shown";

export default function VolunteerOfMonthPopup() {
  const [showPopup, setShowPopup] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [volunteer, setVolunteer] = useState(null);

  useEffect(() => {
    const v = getVolunteer();
    setVolunteer(v);
    if (!v || !v.active) return;
    const shown = sessionStorage.getItem(SESSION_SHOWN_KEY);
    if (!shown) {
      const t = setTimeout(() => setShowPopup(true), 1800);
      return () => clearTimeout(t);
    }
  }, []);

  const handleClose = () => {
    setShowPopup(false);
    sessionStorage.setItem(SESSION_SHOWN_KEY, "1");
    setTimeout(() => setShowBanner(true), 400);
  };

  const handleViewProfile = () => {
    setShowBanner(false);
    setShowPopup(true);
  };

  if (!volunteer) return null;

  return (
    <>
      {/* Volunteer of the Month Popup */}
      <AnimatePresence>
        {showPopup && (
          <motion.div
            className="fixed inset-0 z-[200] flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}>
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={handleClose}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            {/* Card */}
            <motion.div
              className="relative z-10 bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
              initial={{ scale: 0.85, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 40 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}>
              {/* Header gradient */}
              <div className="bg-gradient-to-br from-[#0D6EBB] to-[#0DBD9F] px-8 pt-8 pb-16 text-center relative">
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors text-xl">
                  ✕
                </button>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 text-white text-xs font-medium mb-4">
                  <span>🌟</span>
                  <span>BÉNÉVOLE DU MOIS</span>
                </motion.div>
                <h2 className="text-white text-2xl font-bold">
                  {volunteer.firstName} {volunteer.lastName}
                </h2>
                <p className="text-white/80 text-sm mt-1">📍 {volunteer.location}</p>
              </div>

              {/* Avatar */}
              <div className="flex justify-center -mt-12 mb-4 relative z-10">
                <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg bg-gradient-to-br from-[#0D6EBB] to-[#0DBD9F] flex items-center justify-center">
                  {volunteer.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={volunteer.photo} alt={volunteer.firstName} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-white text-3xl font-bold">
                      {(volunteer.firstName?.[0] || "") + (volunteer.lastName?.[0] || "")}
                    </span>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="px-8 pb-8 space-y-4">
                <div className="bg-[rgba(13,110,187,0.06)] rounded-2xl p-4">
                  <h4 className="text-[#0D6EBB] font-semibold text-sm mb-1">Actions réalisées</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">{volunteer.actions}</p>
                </div>
                <div className="bg-[rgba(13,189,159,0.08)] rounded-2xl p-4">
                  <h4 className="text-[#0DBD9F] font-semibold text-sm mb-1">Contribution environnementale</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">{volunteer.contribution}</p>
                </div>
                <button
                  onClick={handleClose}
                  className="w-full bg-[#0D6EBB] hover:bg-[#0DBD9F] text-white rounded-2xl py-3 font-semibold transition-colors duration-300">
                  Continuer sur BLUE
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sticky Banner */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ y: -48, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -48, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 left-0 right-0 z-[60] bg-gradient-to-r from-[#0D6EBB] to-[#0DBD9F] h-12 flex items-center justify-between px-4 md:px-8 shadow-md">
            <p className="text-white text-xs md:text-sm font-medium truncate">
              🌟 Découvrez notre Bénévole du Mois : <strong>{volunteer.firstName} {volunteer.lastName}</strong>
            </p>
            <div className="flex items-center gap-3 ml-4 shrink-0">
              <button
                onClick={handleViewProfile}
                className="text-white bg-white/20 hover:bg-white/30 rounded-full px-3 py-1 text-xs font-semibold transition-colors whitespace-nowrap">
                Voir le profil
              </button>
              <button
                onClick={() => setShowBanner(false)}
                className="text-white/70 hover:text-white text-sm transition-colors">
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
