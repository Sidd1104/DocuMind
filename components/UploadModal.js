"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES } from "@/lib/categories";
import { DocuMindSymbol } from "@/components/DocuMindLogo";

export default function UploadModal({ onClose, documentId }) {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [step, setStep] = useState("select"); // select -> processing -> done -> error
  const [processingStage, setProcessingStage] = useState(1); // 1: uploaded, 2: reading text, 3: indexing
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const selectedCategory = CATEGORIES.find((c) => c.key === category);
  const isUpdate = Boolean(documentId);

  function handleFileSelection(selectedFile) {
    if (!selectedFile) return;
    if (selectedFile.type !== "application/pdf" && !selectedFile.name.toLowerCase().endsWith(".pdf")) {
      setError("Please select a valid PDF document.");
      return;
    }
    const MAX_SIZE = 15 * 1024 * 1024;
    if (selectedFile.size > MAX_SIZE) {
      setError("File is too large (maximum allowed size is 15MB).");
      return;
    }

    setError("");
    setFile(selectedFile);

    // Auto-fill title from filename by stripping extension and cleaning separators
    const autoTitle = selectedFile.name
      .replace(/\.[^/.]+$/, "")
      .replace(/[-_]+/g, " ")
      .trim();
    if (!title || title.trim() === "") {
      setTitle(autoTitle);
    }
  }

  function onDragOver(e) {
    e.preventDefault();
    setIsDragging(true);
  }

  function onDragLeave(e) {
    e.preventDefault();
    setIsDragging(false);
  }

  function onDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    handleFileSelection(droppedFile);
  }

  // Inline Validation states
  const isFileValid = Boolean(file);
  const isTitleValid = isUpdate || title.trim().length > 0;
  const isCategoryValid = isUpdate || category !== "";
  const isCustomValid = isUpdate || subcategory !== "Other" || customCategory.trim().length > 0;
  const isFormReady = isFileValid && isTitleValid && isCategoryValid && isCustomValid;

  async function onSubmit(e) {
    e.preventDefault();
    if (!isFormReady) {
      if (!isFileValid) setError("Please select or drop a PDF file.");
      else if (!isTitleValid) setError("Please enter a document title.");
      else if (!isCategoryValid) setError("Please select a category chip.");
      else if (!isCustomValid) setError("Please specify a custom category name.");
      return;
    }

    setError("");
    setStep("processing");
    setProcessingStage(1); // 1: Uploaded

    // Animate stage progress for friendly transparency
    const stage2Timer = setTimeout(() => setProcessingStage(2), 700); // 2: Reading text
    const stage3Timer = setTimeout(() => setProcessingStage(3), 1600); // 3: Indexing

    const formData = new FormData();
    formData.append("file", file);
    if (!isUpdate) {
      formData.append("title", title.trim());
      formData.append("category", category);
      formData.append("subcategory", subcategory === "Other" ? "" : subcategory);
      formData.append("customCategory", subcategory === "Other" ? customCategory.trim() : "");
      if (expiryDate) formData.append("expiryDate", expiryDate);
    }

    try {
      const url = isUpdate ? `/api/documents/${documentId}/versions` : "/api/documents";
      const res = await fetch(url, { method: "POST", body: formData });
      clearTimeout(stage2Timer);
      clearTimeout(stage3Timer);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Upload failed. Please check the document format.");
        setStep("select");
        return;
      }

      setResult(data);
      setStep("done");
      router.refresh();
    } catch {
      clearTimeout(stage2Timer);
      clearTimeout(stage3Timer);
      setError("Network or server connection failed. Please try again.");
      setStep("select");
    }
  }

  return (
    <div className="fixed inset-0 bg-navy-950/60 backdrop-blur-xs flex items-center justify-center px-4 z-50 overflow-y-auto py-8">
      <div className="bg-white rounded-xl2 shadow-soft max-w-lg w-full p-6 border border-ink-100 my-auto">
        {step === "select" && (
          <form onSubmit={onSubmit} className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-ink-100 pb-3">
              <div className="flex items-center gap-2">
                <DocuMindSymbol className="w-5 h-5" id="upload-modal-symbol" />
                <h2 className="font-semibold text-navy-950 text-base">
                  {isUpdate ? "Upload new document version" : "Upload to DocuMind Vault"}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-ink-400 hover:text-navy-950 text-sm w-7 h-7 flex items-center justify-center rounded-lg hover:bg-ink-50 transition-colors"
                aria-label="Close upload modal"
              >
                ✕
              </button>
            </div>

            {/* Drag & Drop Zone */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500 mb-2">
                Document File (PDF)
              </label>
              <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                  isDragging
                    ? "border-teal-500 bg-teal-50/70 scale-[1.01]"
                    : file
                    ? "border-teal-400 bg-teal-50/30"
                    : "border-ink-200 bg-ink-50/50 hover:bg-ink-50 hover:border-ink-300"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => handleFileSelection(e.target.files?.[0])}
                  className="hidden"
                />
                {file ? (
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-2xl text-teal-600">📄</span>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-navy-950 truncate max-w-xs">{file.name}</p>
                      <p className="text-xs text-ink-400">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB · Click or drop to replace
                      </p>
                    </div>
                    <span className="text-xs bg-teal-100 text-teal-800 font-semibold px-2 py-0.5 rounded-full ml-auto">
                      Ready
                    </span>
                  </div>
                ) : (
                  <div className="space-y-1.5 py-2">
                    <div className="mx-auto w-10 h-10 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center text-lg">
                      ↑
                    </div>
                    <p className="text-sm font-medium text-navy-950">
                      Drag & drop your PDF here, or <span className="text-teal-700 underline font-semibold">browse</span>
                    </p>
                    <p className="text-xs text-ink-400">Supported format: PDF up to 15MB</p>
                  </div>
                )}
              </div>
            </div>

            {!isUpdate && (
              <>
                {/* Document Title with inline validation */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500">
                      Document Title
                    </label>
                    {title.trim() && (
                      <span className="text-[11px] text-teal-700 font-medium">✓ Auto-filled</span>
                    )}
                  </div>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full text-sm border border-ink-200 rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-400"
                    placeholder="e.g. Health Insurance Policy 2026"
                    maxLength={150}
                  />
                </div>

                {/* Category Selection as Clickable Chips */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500">
                      Category
                    </label>
                    <span className="text-xs text-ink-400">
                      {category ? selectedCategory?.label : "Choose one"}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto p-1 border border-ink-100 rounded-xl bg-ink-50/40">
                    {CATEGORIES.map((c) => {
                      const active = category === c.key;
                      return (
                        <button
                          key={c.key}
                          type="button"
                          onClick={() => {
                            setCategory(c.key);
                            setSubcategory("");
                            setCustomCategory("");
                          }}
                          className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                            active
                              ? "bg-navy-900 text-white shadow-xs font-semibold"
                              : "bg-white border border-ink-200 text-ink-700 hover:border-teal-400 hover:text-navy-950"
                          }`}
                        >
                          {c.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Subcategory Dropdown */}
                {selectedCategory && (
                  <div className="space-y-3 pt-1">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500 mb-1.5">
                        Subcategory <span className="text-ink-400 font-normal">(optional)</span>
                      </label>
                      <select
                        value={subcategory}
                        onChange={(e) => setSubcategory(e.target.value)}
                        className="w-full text-sm border border-ink-200 rounded-lg px-3.5 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                      >
                        <option value="">Select subcategory…</option>
                        {selectedCategory.subcategories.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    {subcategory === "Other" && (
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500 mb-1.5">
                          Custom Category Name
                        </label>
                        <input
                          value={customCategory}
                          onChange={(e) => setCustomCategory(e.target.value)}
                          required
                          className="w-full text-sm border border-ink-200 rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-400"
                          placeholder="e.g. Tax Invoices, Family Certificates"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Expiry Date Picker with friendly quick-clear */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500">
                      Expiry / Renewal Date <span className="text-ink-400 font-normal lowercase">(optional)</span>
                    </label>
                    {expiryDate && (
                      <button
                        type="button"
                        onClick={() => setExpiryDate("")}
                        className="text-[11px] text-ink-400 hover:text-red-600 underline"
                      >
                        Clear date
                      </button>
                    )}
                  </div>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full text-sm border border-ink-200 rounded-lg px-3.5 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                  />
                </div>
              </>
            )}

            {error && (
              <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
                {error}
              </p>
            )}

            <button
              disabled={!isFormReady}
              className="w-full rounded-lg bg-navy-900 hover:bg-navy-800 disabled:opacity-50 text-white text-sm font-semibold py-3 transition-all shadow-soft cursor-pointer"
            >
              {isUpdate ? "Upload & Index Version" : "Upload & Index Document"}
            </button>
          </form>
        )}

        {/* 3-Step Progress Stage */}
        {step === "processing" && (
          <div className="py-8 text-center space-y-6">
            <div className="mx-auto w-12 h-12 border-3 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
            <div>
              <h3 className="text-base font-semibold text-navy-950">Indexing your document…</h3>
              <p className="text-xs text-ink-500 mt-1">
                Extracting coordinates and segmenting passages for DocuMind AI.
              </p>
            </div>

            {/* 3 Step Visual Pipeline */}
            <div className="space-y-3 max-w-xs mx-auto text-left text-xs">
              <div className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                processingStage >= 1 ? "bg-teal-50 text-teal-900 font-medium" : "text-ink-400"
              }`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                  processingStage > 1 ? "bg-teal-600 text-white" : "bg-teal-200 text-teal-900"
                }`}>
                  {processingStage > 1 ? "✓" : "1"}
                </span>
                <span>File uploaded to secure vault</span>
              </div>

              <div className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                processingStage >= 2 ? "bg-teal-50 text-teal-900 font-medium" : "text-ink-400"
              }`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                  processingStage > 2 ? "bg-teal-600 text-white" : processingStage === 2 ? "bg-teal-500 text-white animate-pulse" : "bg-ink-200 text-ink-600"
                }`}>
                  {processingStage > 2 ? "✓" : "2"}
                </span>
                <span>Reading text & running OCR</span>
              </div>

              <div className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                processingStage >= 3 ? "bg-teal-50 text-teal-900 font-medium" : "text-ink-400"
              }`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                  processingStage === 3 ? "bg-teal-500 text-white animate-pulse" : "bg-ink-200 text-ink-600"
                }`}>
                  3
                </span>
                <span>Generating grounded passages</span>
              </div>
            </div>
          </div>
        )}

        {/* Completion Result Screen */}
        {step === "done" && (
          <div className="py-6 text-center space-y-4">
            <div className="mx-auto w-14 h-14 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center text-2xl font-bold border border-emerald-200 shadow-soft">
              ✓
            </div>
            <div>
              <h3 className="text-base font-semibold text-navy-950">
                {isUpdate ? "New version indexed!" : "Document uploaded & indexed!"}
              </h3>
              <p className="text-sm text-teal-800 font-medium bg-teal-50 border border-teal-200 rounded-lg p-2.5 mt-2 inline-block">
                {result?.message || (
                  `${result?.pageCount || 1} ${(result?.pageCount === 1) ? "page" : "pages"}, ${result?.chunksIndexed || 0} ${(result?.chunksIndexed === 1) ? "passage" : "passages"} indexed`
                )}
              </p>
            </div>
            <button
              onClick={onClose}
              className="mt-4 w-full rounded-lg bg-navy-900 hover:bg-navy-800 text-white text-sm font-semibold py-3 transition-colors shadow-soft cursor-pointer"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
