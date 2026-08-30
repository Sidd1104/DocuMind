"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import UploadModal from "@/components/UploadModal";
import { CATEGORIES } from "@/lib/categories";

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
function formatSize(bytes) {
  if (!bytes) return "—";
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function LibraryClient({ documents }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("updated");
  const [uploadOpen, setUploadOpen] = useState(false);

  const filtered = useMemo(() => {
    let list = documents.filter((d) =>
      d.title.toLowerCase().includes(query.toLowerCase())
    );
    if (categoryFilter !== "all") {
      list = list.filter((d) => d.category === categoryFilter);
    }
    list = [...list].sort((a, b) => {
      if (sortBy === "updated") return new Date(b.updatedAt) - new Date(a.updatedAt);
      if (sortBy === "name") return a.title.localeCompare(b.title);
      return 0;
    });
    return list;
  }, [documents, query, categoryFilter, sortBy]);

  async function togglePin(doc) {
    await fetch(`/api/documents/${doc.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ pinned: !doc.pinned }),
    });
    router.refresh();
  }

  return (
    <div className="max-w-5xl mx-auto px-8 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-navy-950">Documents</h1>
          <p className="text-sm text-ink-500 mt-0.5">Your organized DocuMind document vault.</p>
        </div>
        <button
          onClick={() => setUploadOpen(true)}
          className="rounded-lg bg-navy-900 hover:bg-navy-800 text-white text-sm font-medium px-4 py-2.5 shadow-soft hover:shadow-glow transition-all"
        >
          + Upload document
        </button>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search vault documents…"
          className="flex-1 min-w-[200px] text-sm bg-white border border-ink-200 rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-400"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="text-sm bg-white border border-ink-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-400"
        >
          <option value="all">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.key} value={c.key}>{c.label}</option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="text-sm bg-white border border-ink-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-400"
        >
          <option value="updated">Sort: Recently updated</option>
          <option value="name">Sort: Name</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-10 text-center text-ink-400 text-sm border border-dashed border-ink-200 bg-white rounded-xl2 py-16">
          {documents.length === 0
            ? "No documents in your DocuMind vault yet. Upload your first document to get started."
            : "No documents match your search in this vault."}
        </div>
      ) : (
        <div className="mt-6 bg-white border border-ink-100 rounded-xl2 shadow-soft overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-ink-50 text-ink-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Document</th>
                <th className="text-left px-5 py-3 font-medium">Category</th>
                <th className="text-left px-5 py-3 font-medium">Updated</th>
                <th className="text-left px-5 py-3 font-medium">Size</th>
                <th className="text-left px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d.id} className="border-t border-ink-100 hover:bg-teal-50/30 transition-colors">
                  <td className="px-5 py-3">
                    <Link href={`/documents/${d.id}`} className="font-medium text-navy-950 hover:text-teal-700 transition-colors">
                      {d.pinned && <span className="text-amber-500 mr-1.5 font-bold">★</span>}
                      {d.title}
                    </Link>
                    {d.versionCount > 1 && (
                      <span className="ml-2 text-xs text-teal-800 bg-teal-50 border border-teal-100 rounded-md px-1.5 py-0.5">
                        v{d.versionCount}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-ink-500">
                    {d.categoryLabel}{d.subcategory ? ` · ${d.subcategory === "Other" ? d.customCategory : d.subcategory}` : ""}
                  </td>
                  <td className="px-5 py-3 text-ink-500">{formatDate(d.updatedAt)}</td>
                  <td className="px-5 py-3 text-ink-500">{formatSize(d.fileSize)}</td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => togglePin(d)}
                      className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                        d.pinned
                          ? "text-amber-700 bg-amber-50 hover:bg-amber-100"
                          : "text-ink-400 hover:text-navy-900 hover:bg-ink-100"
                      }`}
                      title={d.pinned ? "Unpin" : "Pin to dashboard"}
                    >
                      {d.pinned ? "Pinned" : "Pin"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {uploadOpen && <UploadModal onClose={() => setUploadOpen(false)} />}
    </div>
  );
}
