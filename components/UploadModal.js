"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES } from "@/lib/categories";
import { DocuMindSymbol } from "@/components/DocuMindLogo";

export default function UploadModal({ onClose, documentId }) {
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [step, setStep] = useState("select"); // select -> processing -> done -> error
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const selectedCategory = CATEGORIES.find((c) => c.key === category);
  const isUpdate = Boolean(documentId);

  function onFileChange(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    if (!title) setTitle(f.name.replace(/\.pdf$/i, ""));
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!file) return setError("Please choose a PDF file.");
    if (!isUpdate && !category) return setError("Please select a category.");

    setError("");
    setStep("processing");

    const formData = new FormData();
    formData.append("file", file);
    if (!isUpdate) {
      formData.append("title", title);
      formData.append("category", category);
      formData.append("subcategory", subcategory === "Other" ? "" : subcategory);
      formData.append("customCategory", subcategory === "Other" ? customCategory : "");
    }

    const url = isUpdate ? `/api/documents/${documentId}/versions` : "/api/documents";
    const res = await fetch(url, { method: "POST", body: formData });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Upload failed.");
      setStep("select");
      return;
    }
    setResult(data);
    setStep("done");
    router.refresh();
  }

  return (
    <div className="fixed inset-0 bg-navy-950/60 backdrop-blur-xs flex items-center justify-center px-4 z-50">
      <div className="bg-white rounded-xl2 shadow-soft max-w-md w-full p-6 border border-ink-100">
        {step === "select" && (
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="flex items-center justify-between border-b border-ink-100 pb-3">
              <div className="flex items-center gap-2">
                <DocuMindSymbol className="w-5 h-5" id="upload-modal-symbol" />
                <h2 className="font-semibold text-navy-950">
                  {isUpdate ? "Upload new version" : "Upload to DocuMind"}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-ink-400 hover:text-navy-950 text-sm w-7 h-7 flex items-center justify-center rounded-lg hover:bg-ink-50"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">PDF file</label>
              <input
                type="file"
                accept="application/pdf"
                onChange={onFileChange}
                required
                className="w-full text-sm border border-ink-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>

            {!isUpdate && (
              <>
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-1">Document title</label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full text-sm border border-ink-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
                    placeholder="e.g. Health Insurance Policy"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      setSubcategory("");
                    }}
                    className="w-full text-sm border border-ink-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
                  >
                    <option value="">Select a category…</option>
                    {CATEGORIES.map((c) => (
                      <option key={c.key} value={c.key}>{c.label}</option>
                    ))}
                  </select>
                </div>

                {selectedCategory && (
                  <div>
                    <label className="block text-sm font-medium text-ink-700 mb-1">Subcategory</label>
                    <select
                      value={subcategory}
                      onChange={(e) => setSubcategory(e.target.value)}
                      className="w-full text-sm border border-ink-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
                    >
                      <option value="">Select subcategory…</option>
                      {selectedCategory.subcategories.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                )}

                {subcategory === "Other" && (
                  <div>
                    <label className="block text-sm font-medium text-ink-700 mb-1">Custom category name</label>
                    <input
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      className="w-full text-sm border border-ink-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
                      placeholder="e.g. Family Documents"
                    />
                  </div>
                )}
              </>
            )}

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button className="w-full rounded-lg bg-navy-900 hover:bg-navy-800 text-white text-sm font-medium py-2.5 transition-all shadow-soft">
              {isUpdate ? "Upload Version" : "Upload Document"}
            </button>
          </form>
        )}

        {step === "processing" && (
          <div className="py-10 text-center">
            <div className="mx-auto w-10 h-10 border-2 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
            <p className="mt-4 text-sm font-medium text-navy-950">Extracting text & indexing into DocuMind…</p>
            <p className="text-xs text-ink-400 mt-1">Extracting page-level text chunks for grounded AI retrieval.</p>
          </div>
        )}

        {step === "done" && (
          <div className="py-6 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center text-xl font-bold border border-teal-200">
              ✓
            </div>
            <p className="mt-4 text-sm font-semibold text-navy-950">
              {isUpdate ? "New version indexed." : "Document uploaded & indexed."}
            </p>
            {typeof result?.chunksIndexed === "number" && (
              <p className="text-xs text-ink-500 mt-1">
                {result.chunksIndexed} passages indexed for DocuMind AI.
              </p>
            )}
            <button
              onClick={onClose}
              className="mt-5 w-full rounded-lg bg-navy-900 hover:bg-navy-800 text-white text-sm font-medium py-2.5 transition-colors shadow-soft"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
