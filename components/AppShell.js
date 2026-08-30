"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import DocuMindLogo from "@/components/DocuMindLogo";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: "▢" },
  { href: "/documents", label: "Documents", icon: "▤" },
  { href: "/assistant", label: "DocuMind AI", icon: "✦" },
];

export default function AppShell({ user, children }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex bg-ink-50">
      <aside className="w-60 shrink-0 border-r border-ink-100 bg-white flex flex-col">
        <div className="px-5 py-5 border-b border-ink-100/50">
          <Link href="/dashboard" className="hover:opacity-90 transition-opacity block">
            <DocuMindLogo size="sm" withTagline={false} />
          </Link>
        </div>
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
            <p className="font-medium text-navy-950 truncate">{user.name}</p>
            <p className="text-ink-400 text-xs truncate">{user.email}</p>
          </div>
          <button
            onClick={logout}
            className="w-full text-left px-3 py-2 text-sm text-ink-500 hover:bg-ink-100/70 hover:text-navy-950 rounded-lg transition-colors"
          >
            Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
