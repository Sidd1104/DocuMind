"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import DocuMindLogo from "@/components/DocuMindLogo";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: "▢" },
  { href: "/documents", label: "Documents", icon: "▤" },
  { href: "/assistant", label: "DocuMind AI", icon: "✦" },
  { href: "/settings", label: "Settings", icon: "⚙" },
];

export default function AppShell({ user, children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile drawer whenever the pathname changes
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Close drawer on Escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") setMobileOpen(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  const NavContent = () => (
    <>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active
                  ? "bg-teal-50/80 text-teal-900 font-semibold shadow-xs"
                  : "text-ink-600 hover:bg-ink-50 hover:text-navy-950"
              }`}
            >
              <span className={`w-4 text-center ${active ? "text-teal-600" : "text-ink-400"}`}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-3 pb-4 pt-3 border-t border-ink-100">
        <div className="px-3 py-2 text-sm bg-ink-50/70 rounded-lg mb-2">
          <p className="font-medium text-navy-950 truncate">{user?.name || "User"}</p>
          <p className="text-ink-400 text-xs truncate">{user?.email || ""}</p>
        </div>
        <button
          onClick={logout}
          className="w-full text-left px-3 py-2 text-sm text-ink-500 hover:bg-ink-100/70 hover:text-navy-950 rounded-lg transition-colors cursor-pointer"
        >
          Sign out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-ink-50">
      {/* Mobile Top Navigation Header */}
      <header className="md:hidden bg-white border-b border-ink-100 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <Link href="/dashboard" className="hover:opacity-90 transition-opacity">
          <DocuMindLogo size="sm" withTagline={false} />
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open navigation menu"}
          aria-expanded={mobileOpen}
          className="p-2 rounded-lg text-ink-600 hover:bg-ink-50 hover:text-navy-950 transition-colors cursor-pointer"
        >
          {mobileOpen ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </header>

      {/* Mobile Slide-over Drawer Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="md:hidden fixed inset-0 bg-navy-950/40 backdrop-blur-xs z-40 transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Mobile Slide-over Drawer */}
      <div
        className={`md:hidden fixed top-0 left-0 bottom-0 w-64 bg-white z-50 shadow-xl flex flex-col transition-transform duration-200 ease-in-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
      >
        <div className="px-5 py-4 border-b border-ink-100/50 flex items-center justify-between">
          <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
            <DocuMindLogo size="sm" withTagline={false} />
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
            className="text-ink-400 hover:text-navy-950 p-1 rounded-lg"
          >
            ✕
          </button>
        </div>
        <NavContent />
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-60 shrink-0 border-r border-ink-100 bg-white flex-col sticky top-0 h-screen">
        <div className="px-5 py-5 border-b border-ink-100/50">
          <Link href="/dashboard" className="hover:opacity-90 transition-opacity block">
            <DocuMindLogo size="sm" withTagline={false} />
          </Link>
        </div>
        <NavContent />
      </aside>

      {/* Main Page Area */}
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
