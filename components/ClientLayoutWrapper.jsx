"use client";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import MrBlueChat from "@/components/MrBlueChat";
import VolunteerOfMonthPopup from "@/components/VolunteerOfMonthPopup";

export default function ClientLayoutWrapper({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  return (
    <>
      {!isAdmin && <VolunteerOfMonthPopup />}
      {!isAdmin && <Navbar />}
      {children}
      {!isAdmin && <MrBlueChat />}
    </>
  );
}
