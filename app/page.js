import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import DocuMindLogo from "@/components/DocuMindLogo";

export default async function LandingPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#FFFFFF] via-[#F7F9FC] to-[#EDF2F7]">
      {/* Navigation */}
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-6 py-6 border-b border-ink-100/70">
        <Link href="/" className="transition-opacity hover:opacity-90">
          <DocuMindLogo size="md" withTagline={false} />
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-ink-600 hover:text-navy-900 px-4 py-2 transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="text-sm font-medium text-white bg-navy-900 hover:bg-navy-800 rounded-lg px-4 py-2.5 transition-all shadow-sm"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-6 pt-16 pb-20 text-center">
        <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-teal-700 bg-teal-50 border border-teal-100 rounded-full px-3.5 py-1.5 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
          Intelligent Document Platform
        </div>
        
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-navy-950 tracking-tight leading-[1.15]">
          Your Documents.<br />
          <span className="text-teal-600">Organized. Understood.</span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-ink-500 max-w-2xl mx-auto leading-relaxed">
          Securely store your important documents and ask your personal AI assistant questions about them whenever you need — answered with verified page citations every time.
        </p>

        <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <Link
            href="/signup"
            className="w-full sm:w-auto text-sm font-semibold text-white bg-navy-900 hover:bg-navy-800 rounded-lg px-6 py-3.5 shadow-soft hover:shadow-glow transition-all"
          >
            Create your DocuMind vault
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto text-sm font-medium text-navy-900 bg-white border border-ink-200 hover:bg-ink-50 rounded-lg px-6 py-3.5 transition-colors shadow-sm"
          >
            I already have an account
          </Link>
        </div>

        <div className="mt-8 flex items-center justify-center gap-6 text-xs text-ink-400">
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            End-to-end user isolation
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Grounded AI answers
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Exact page citations
          </span>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="max-w-5xl mx-auto px-6 pb-24 grid sm:grid-cols-3 gap-5">
        {[
          {
            title: "Organized by you",
            desc: "No black-box confusion. You choose your categories on upload, add custom tags, and manage multi-version document histories effortlessly.",
            icon: "📁",
          },
          {
            title: "Answers, not search results",
            desc: "Ask “When does my insurance policy expire?” or “What is my registration number?” and receive direct, concise answers with exact page references.",
            icon: "✦",
          },
          {
            title: "Private & isolated vault",
            desc: "Every document, chunk, and conversation is strictly isolated to your account at the database query level — never shared, never leaked.",
            icon: "🛡️",
          },
        ].map((f) => (
          <div
            key={f.title}
            className="bg-white rounded-xl2 border border-ink-100 shadow-soft p-6 hover:border-teal-200 transition-all hover:shadow-md"
          >
            <span className="text-2xl mb-3 block">{f.icon}</span>
            <h3 className="font-semibold text-navy-950 text-base">{f.title}</h3>
            <p className="mt-2 text-sm text-ink-500 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer className="border-t border-ink-100/80 bg-white/70 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ink-400">
          <div className="flex items-center gap-2">
            <DocuMindLogo size="sm" withTagline={false} />
          </div>
          <p>© {new Date().getFullYear()} DocuMind. Your Documents. Organized. Understood.</p>
        </div>
      </footer>
    </main>
  );
}
