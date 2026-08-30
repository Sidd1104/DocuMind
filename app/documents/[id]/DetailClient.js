"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import UploadModal from "@/components/UploadModal";
import { CATEGORIES, categoryLabel } from "@/lib/categories";

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
function formatSize(bytes) {
  if (!bytes) return "—";
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DetailClient({ doc }) {
  const router = useRouter();
  const [updateOpen, setUpdateOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(false);
  const [category, setCategory] = useState(doc.category);
  const [expiryDate, setExpiryDate] = useState(doc.expiryDate ? doc.expiryDate.slice(0, 10) : "");

  async function saveCategory() {
    await fetch(`/api/documents/${doc.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ category }),
    });
    setEditingCategory(false);
    router.refresh();
  }

  async function saveExpiry() {
    await fetch(`/api/documents/${doc.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ expiryDate: expiryDate || null }),
    });
    router.refresh();
  }

  async function togglePin() {
    await fetch(`/api/documents/${doc.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ pinned: !doc.pinned }),
    });
    router.refresh();
  }

  async function deleteDoc() {
    if (!confirm("Delete this document and all its versions from your DocuMind vault? This cannot be undone.")) return;
    await fetch(`/api/documents/${doc.id}`, { method: "DELETE" });
    router.push("/documents");
  }

  return (
    <div className="max-w-3xl mx-auto px-8 py-10">
      <Link href="/documents" className="text-sm text-ink-500 hover:text-navy-900 transition-colors flex items-center gap-1.5">
        <span>←</span> Back to documents
      </Link>

      <div className="mt-3 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-navy-950">{doc.title}</h1>
          <p className="text-ink-500 text-sm mt-1">
            {categoryLabel(doc.category)}{doc.subcategory ? ` · ${doc.subcategory === "Other" ? doc.customCategory : doc.subcategory}` : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={togglePin}
            className={`text-sm border rounded-lg px-3.5 py-2 transition-colors ${
              doc.pinned
                ? "border-amber-300 bg-amber-50 text-amber-800"
                : "border-ink-200 bg-white text-ink-700 hover:bg-ink-50"
            }`}
          >
            {doc.pinned ? "★ Pinned" : "☆ Pin"}
          </button>
          <a
            href={`/api/documents/${doc.id}/file`}
            target="_blank"
            rel="noreferrer"
            className="text-sm border border-ink-200 bg-white text-navy-950 rounded-lg px-3.5 py-2 hover:bg-ink-50 transition-colors shadow-xs"
          >
            Open PDF
          </a>
        </div>
      </div>

      <div className="mt-8 bg-white border border-ink-100 rounded-xl2 shadow-soft p-6 space-y-5">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-ink-700">Category</span>
          {editingCategory ? (
            <div className="flex items-center gap-2">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="text-sm border border-ink-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-400"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.key} value={c.key}>{c.label}</option>
                ))}
              </select>
              <button onClick={saveCategory} className="text-sm text-teal-700 font-semibold hover:underline">Save</button>
            </div>
          ) : (
            <button onClick={() => setEditingCategory(true)} className="text-sm text-teal-700 font-medium hover:underline">
              {categoryLabel(doc.category)} — edit
            </button>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-ink-700">Expiry date</span>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="text-sm border border-ink-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
            <button onClick={saveExpiry} className="text-sm text-teal-700 font-semibold hover:underline">Save</button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-ink-700">Current file</span>
          <span className="text-sm text-ink-500">
            {doc.versions[0]?.originalName} · {formatSize(doc.versions[0]?.fileSize)} · {doc.versions[0]?.pageCount} pages
          </span>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ink-700">Version history</h2>
        <button
          onClick={() => setUpdateOpen(true)}
          className="text-sm border border-ink-200 bg-white text-navy-950 rounded-lg px-3.5 py-2 hover:bg-ink-50 transition-colors shadow-xs"
        >
          Upload new version
        </button>
      </div>
      <div className="mt-3 bg-white border border-ink-100 rounded-xl2 shadow-soft divide-y divide-ink-100 overflow-hidden">
        {doc.versions.map((v, i) => (
          <div key={v.id} className="flex items-center justify-between px-5 py-3.5 text-sm">
            <div>
              <span className="font-medium text-navy-950">Version {v.versionNumber}</span>
              {i === 0 && <span className="ml-2 text-xs text-teal-800 bg-teal-50 border border-teal-200 rounded-full px-2 py-0.5 font-medium">Current</span>}
              <span className="ml-2 text-ink-400">{v.originalName}</span>
            </div>
            <span className="text-ink-400">{formatDate(v.uploadedAt)}</span>
          </div>
        ))}
      </div>

      <div className="mt-10 border-t border-ink-100 pt-6">
        <button onClick={deleteDoc} className="text-sm text-red-600 hover:text-red-700 hover:underline">
          Delete document from vault
        </button>
      </div>

      {updateOpen && <UploadModal documentId={doc.id} onClose={() => setUpdateOpen(false)} />}
    </div>
  );
}
