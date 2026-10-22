import test from "node:test";
import assert from "node:assert/strict";
import { CATEGORIES, categoryLabel } from "../lib/categories.js";

test("Document Metadata, Renaming & Library Search Filtering", async (t) => {
  const documents = [
    {
      id: "doc_1",
      title: "HDFC Life Policy Certificate",
      category: "insurance",
      subcategory: "Life Insurance",
      customCategory: null,
      expiryDate: new Date("2026-12-31"),
      updatedAt: new Date("2026-05-01"),
    },
    {
      id: "doc_2",
      title: "Apartment Rental Agreement",
      category: "property_legal",
      subcategory: "Rental / Lease Agreement",
      customCategory: null,
      expiryDate: new Date("2026-11-15"),
      updatedAt: new Date("2026-06-01"),
    },
    {
      id: "doc_3",
      title: "Dell XPS Purchase Receipt",
      category: "other",
      subcategory: "Other",
      customCategory: "Tech Equipment",
      expiryDate: null,
      updatedAt: new Date("2026-07-01"),
    },
  ];

  await t.test("title renaming sanitizes and enforces length limits", () => {
    function sanitizeTitle(raw) {
      if (!raw || typeof raw !== "string" || !raw.trim()) return null;
      return raw.trim().slice(0, 150);
    }

    assert.equal(sanitizeTitle("  Passport Renewal 2026  "), "Passport Renewal 2026");
    assert.equal(sanitizeTitle(""), null);
    assert.equal(sanitizeTitle("   "), null);
    assert.equal(sanitizeTitle(null), null);
    assert.equal(sanitizeTitle("a".repeat(200)).length, 150);
  });

  await t.test("multi-field vault search matches title, category, subcategory, and custom tags", () => {
    function filterVault(docs, query) {
      const q = query.trim().toLowerCase();
      if (!q) return docs;
      return docs.filter((d) => {
        const catLabel = categoryLabel(d.category);
        const titleMatch = d.title.toLowerCase().includes(q);
        const catMatch = catLabel?.toLowerCase().includes(q);
        const subMatch = d.subcategory?.toLowerCase().includes(q);
        const customMatch = d.customCategory?.toLowerCase().includes(q);
        return titleMatch || catMatch || subMatch || customMatch;
      });
    }

    // Match by title
    assert.equal(filterVault(documents, "HDFC").length, 1);
    // Match by category
    assert.equal(filterVault(documents, "Insurance").length, 1);
    // Match by subcategory
    assert.equal(filterVault(documents, "Rental").length, 1);
    // Match by customCategory
    assert.equal(filterVault(documents, "Tech Equipment").length, 1);
    // Empty search returns all
    assert.equal(filterVault(documents, "").length, 3);
  });

  await t.test("expiry radar correctly categorizes expired vs expiring soon vs valid", () => {
    const referenceNow = new Date("2026-11-01T00:00:00Z");

    function categorizeExpiry(expiryDate, now = referenceNow) {
      if (!expiryDate) return "none";
      const exp = new Date(expiryDate);
      const diffMs = exp.getTime() - now.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays < 0) return "expired";
      if (diffDays <= 30) return "due_soon";
      return "valid";
    }

    // doc_2 expires 2026-11-15 -> 14 days away -> due_soon
    assert.equal(categorizeExpiry(documents[1].expiryDate), "due_soon");
    // doc_1 expires 2026-12-31 -> 60 days away -> valid
    assert.equal(categorizeExpiry(documents[0].expiryDate), "valid");
    // expired document test
    assert.equal(categorizeExpiry(new Date("2026-10-01")), "expired");
    // document without expiry
    assert.equal(categorizeExpiry(documents[2].expiryDate), "none");
  });
});
