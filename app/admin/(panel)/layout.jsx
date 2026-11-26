"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { adminLogout, getAdminSession } from "@/lib/store";
import { shortName } from "@/components/admin/ui";
import { AdminSessionContext as SessionContext, ADMIN_NAV_ITEMS as NAV_ITEMS } from "@/components/admin/AdminSessionContext";

export default function AdminPanelLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    getAdminSession()
      .then(setSession)
      .catch(() => router.replace("/admin"));
  }, [router]);

  // Session expirée pendant l'utilisation (8 h) : retour à la connexion.
  useEffect(() => {
    if (!session?.expiresAt) return;
    const ms = new Date(session.expiresAt).getTime() - Date.now();
    const t = setTimeout(() => router.replace("/admin"), Math.max(ms, 0));
    return () => clearTimeout(t);
  }, [session, router]);

  useEffect(() => setSidebarOpen(false), [pathname]);

  const current = NAV_ITEMS.find((n) => pathname?.startsWith(n.href));
  const handleLogout = async () => {
    await adminLogout().catch(() => {});
    router.replace("/admin");
  };

  return (
    <SessionContext.Provider value={session}>
      <div className="min-h-screen bg-[#f7faff] flex">
        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-[rgba(13,110,187,0.1)] flex flex-col transition-transform md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="p-5 border-b border-[rgba(13,110,187,0.08)]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#0D6EBB] flex items-center justify-center text-white font-bold text-sm">B</div>
              <div>
                <p className="font-bold text-gray-900 text-sm">BLUE Admin</p>
                <p className="text-gray-400 text-xs">Espace d&apos;administration</p>
              </div>
            </div>
          </div>
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto" aria-label="Navigation de l'administration">
            {NAV_ITEMS.map((item) => {
              const active = pathname?.startsWith(item.href);
              return (
                <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${active ? "bg-[rgba(13,110,187,0.1)] text-[#0D6EBB]" : "text-gray-600 hover:bg-gray-50"}`}>
                  <span aria-hidden="true">{item.icon}</span> {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="p-3 border-t border-[rgba(13,110,187,0.08)]">
            <button onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-50 transition-colors">
              <span aria-hidden="true">🚪</span> Déconnexion
            </button>
          </div>
        </aside>

        {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/30 md:hidden" onClick={() => setSidebarOpen(false)} />}

        <div className="flex-1 md:ml-64 flex flex-col min-h-screen min-w-0">
          {/* Barre du haut */}
          <header className="bg-white border-b border-[rgba(13,110,187,0.1)] px-4 md:px-6 py-3 flex items-center justify-between gap-3 sticky top-0 z-30">
            <div className="flex items-center gap-3 min-w-0">
              <button className="md:hidden text-[#0D6EBB] text-xl" onClick={() => setSidebarOpen(true)} aria-label="Ouvrir le menu">☰</button>
              <h1 className="text-gray-900 font-bold truncate">{current?.label || "Administration"}</h1>
            </div>
            <div className="flex items-center gap-3 md:gap-4 shrink-0">
              {session && (
                <p className="hidden sm:flex items-center gap-2 text-xs text-gray-500 bg-[#f7faff] border border-[rgba(13,110,187,0.1)] rounded-full px-3 py-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#0DBD9F]" aria-hidden="true" />
                  Connecté : <span className="font-semibold text-gray-800">{shortName(session.name)}</span> — {session.department}
                </p>
              )}
              <Link href="/" className="text-sm text-[#0D6EBB] hover:text-[#0DBD9F] transition-colors whitespace-nowrap">← Site</Link>
            </div>
          </header>

          <main className="flex-1 p-4 md:p-6">
            {session ? children : (
              <div className="flex items-center justify-center py-24">
                <div className="w-10 h-10 rounded-full border-4 border-[#0D6EBB] border-t-transparent animate-spin" />
              </div>
            )}
          </main>
        </div>
      </div>
    </SessionContext.Provider>
  );
}
