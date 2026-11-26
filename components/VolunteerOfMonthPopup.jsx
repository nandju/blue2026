"use client";
import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { getVolunteer } from "@/lib/store";
import VotmPopup from "@/components/volunteer/VotmPopup";
import VotmBanner from "@/components/volunteer/VotmBanner";

// Contrôleur de la notification « Bénévole du mois ».
// Le serveur calcule l'état effectif (publié, activé, période planifiée) ;
// ici on gère uniquement la fréquence d'affichage et les canaux.

const today = () => new Date().toISOString().slice(0, 10);

function alreadyShown(key, frequency) {
  try {
    if (frequency === "always") return false;
    if (frequency === "day") return localStorage.getItem(key) === today();
    return sessionStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

function markShown(key, frequency) {
  try {
    if (frequency === "always") return;
    if (frequency === "day") localStorage.setItem(key, today());
    else sessionStorage.setItem(key, "1");
  } catch {}
}

export default function VolunteerOfMonthPopup() {
  const [data, setData] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    let timer;
    getVolunteer()
      .then((d) => {
        setData(d);
        const notify = d?.notify;
        if (!d?.volunteer || !notify) return;
        if (alreadyShown(notify.key, notify.frequency)) return;
        if (notify.popup) {
          timer = setTimeout(() => {
            setShowPopup(true);
            markShown(notify.key, notify.frequency);
          }, notify.delayMs ?? 1800);
        } else if (notify.banner) {
          setShowBanner(true);
          markShown(notify.key, notify.frequency);
        }
      })
      .catch(() => {});
    return () => clearTimeout(timer);
  }, []);

  const volunteer = data?.volunteer;
  const notify = data?.notify;
  if (!volunteer) return null;

  const handleClosePopup = () => {
    setShowPopup(false);
    if (notify?.banner) setTimeout(() => setShowBanner(true), 400);
  };

  return (
    <>
      <AnimatePresence>
        {showPopup && (
          <VotmPopup volunteer={volunteer} petals={!!notify?.petals} onClose={handleClosePopup} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showBanner && (
          <VotmBanner
            volunteer={volunteer}
            onViewProfile={() => {
              setShowBanner(false);
              setShowPopup(true);
            }}
            onClose={() => setShowBanner(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
