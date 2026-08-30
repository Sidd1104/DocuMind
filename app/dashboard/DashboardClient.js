"use client";

import { useState } from "react";
import Link from "next/link";
import UploadModal from "@/components/UploadModal";

function timeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function formatDate(d) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function DashboardClient({ userName, pinned, recent, upcomingExpiry, totalDocuments }) {
  const [uploadOpen, setUploadOpen] = useState(false);

  return (
    <div className="max-w-5xl mx-auto px-8 py-10">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-navy-950">
            {timeGreeting()}, {userName.split(" ")[0]}.
          </h1>
          <p className="text-ink-500 mt-1">
            Your personal DocuMind vault — {totalDocuments} document{totalDocuments === 1 ? "" : "s"} stored.
          </p>
        </div>
        <button
          onClick={() => setUploadOpen(true)}
          className="rounded-lg bg-navy-900 hover:bg-navy-800 text-white text-sm font-medium px-4 py-2.5 shadow-soft hover:shadow-glow transition-all"
        >
          + Upload document
        </button>
      </div>

      <Link
        href="/assistant"
        className="mt-8 flex items-center justify-between bg-gradient-to-r from-navy-950 via-navy-900 to-navy-900 rounded-xl2 px-6 py-5 text-white hover:from-navy-900 hover:to-navy-800 transition-all shadow-soft group border border-navy-800"
      >
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-400 bg-teal-950/60 border border-teal-500/30 rounded-full px-2.5 py-0.5">
              DocuMind AI
            </span>
            <span className="text-sm text-ink-300">Grounded Intelligence</span>
          </div>
          <p className="text-lg font-medium mt-1 text-white group-hover:text-teal-200 transition-colors">
            “When does my insurance policy expire?”
          </p>
        </div>
        <span className="text-sm font-medium bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded-lg px-4 py-2 group-hover:bg-teal-500 group-hover:text-navy-950 transition-all">
          Ask DocuMind →
        </span>
      </Link>

      {upcomingExpiry.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-semibold text-ink-700 mb-3">Upcoming expiry & renewals</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {upcomingExpiry.map((d) => (
              <div key={d.id} className="bg-white border border-amber-200 bg-amber-50/40 rounded-xl2 p-4 shadow-sm">
                <p className="text-sm font-medium text-navy-950 truncate">{d.title}</p>
                <p className="text-xs text-amber-700 mt-1">Expires {formatDate(d.expiryDate)}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-8">
        <h2 className="text-sm font-semibold text-ink-700 mb-3">Pinned documents</h2>
        {pinned.length === 0 ? (
          <EmptyRow text="Nothing pinned yet — pin important documents from your vault for quick access here." />
        ) : (
          <CardGrid docs={pinned} />
        )}
      </section>

      <section className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-ink-700">Recently updated</h2>
          <Link href="/documents" className="text-sm text-teal-700 hover:text-teal-800 font-medium hover:underline">
            View all documents →
          </Link>
        </div>
        {recent.length === 0 ? (
          <EmptyRow text="No documents in your vault yet. Upload your first document to get started." />
        ) : (
          <CardGrid docs={recent} />
        )}
      </section>

      {uploadOpen && <UploadModal onClose={() => setUploadOpen(false)} />}
    </div>
  );
}

function CardGrid({ docs }) {
  return (
    <div className="grid sm:grid-cols-3 gap-4">
      {docs.map((d) => (
        <Link
          key={d.id}
          href={`/documents/${d.id}`}
          className="bg-white border border-ink-100 rounded-xl2 p-4 shadow-soft hover:border-teal-300 hover:shadow-md transition-all"
        >
          <p className="text-sm font-medium text-navy-950 truncate">{d.title}</p>
          <p className="text-xs text-ink-500 mt-1">{d.category}</p>
          <p className="text-xs text-ink-400 mt-2">{d.pageCount} page{d.pageCount === 1 ? "" : "s"}</p>
        </Link>
      ))}
    </div>
  );
}

function EmptyRow({ text }) {
  return (
    <div className="bg-white border border-dashed border-ink-200 rounded-xl2 p-6 text-sm text-ink-400 text-center">
      {text}
    </div>
  );
}
