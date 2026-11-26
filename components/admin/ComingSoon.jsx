"use client";
import { motion } from "framer-motion";

export default function ComingSoon({ icon = "🚧", title, description }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-[rgba(13,110,187,0.12)] flex flex-col items-center justify-center text-center py-20 px-6">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0D6EBB] to-[#0DBD9F] flex items-center justify-center text-3xl mb-5">
        {icon}
      </div>
      <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#0DBD9F]">Bientôt disponible</span>
      <h2 className="mt-2 text-xl font-bold text-gray-900">{title}</h2>
      {description && <p className="mt-2 text-sm text-gray-500 max-w-md">{description}</p>}
    </motion.div>
  );
}
