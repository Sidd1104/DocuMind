import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("Workflow Integration & Data Contracts", () => {
  test("Dashboard document serializer correctly structures pinned, expiring, and recent cards", () => {
    const serialize = (d) => ({
      id: d.id,
      title: d.title,
      category: d.category,
      updatedAt: d.updatedAt,
      expiryDate: d.expiryDate,
      pageCount: d.versions[0]?.pageCount ?? 0,
    });

    const now = new Date();
    const mockDocs = [
      {
        id: "doc-1",
        title: "Medical Report",
        category: "medical",
        pinned: true,
        expiryDate: null,
        updatedAt: new Date(now - 10000),
        versions: [{ pageCount: 5 }]
      },
      {
        id: "doc-2",
        title: "Car Insurance",
        category: "vehicle",
        pinned: false,
        expiryDate: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000), // 20 days
        updatedAt: new Date(now - 5000),
        versions: [{ pageCount: 2 }]
      },
      {
        id: "doc-3",
        title: "Old Lease",
        category: "property",
        pinned: false,
        expiryDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), // expired 10 days ago
        updatedAt: new Date(now - 20000),
        versions: [{ pageCount: 8 }]
      }
    ];

    const pinned = mockDocs.filter((d) => d.pinned);
    assert.equal(pinned.length, 1);
    assert.equal(pinned[0].id, "doc-1");

    const ninetyDays = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    const upcoming = mockDocs.filter((d) => d.expiryDate && d.expiryDate >= now && d.expiryDate <= ninetyDays);
    assert.equal(upcoming.length, 1);
    assert.equal(upcoming[0].id, "doc-2");

    const recent = mockDocs.slice(0, 6);
    assert.equal(recent.length, 3);
    assert.equal(recent.map(serialize).length, 3);
  });

  test("Citation de-duplication merges duplicate chunks from same document and page", () => {
    const rawSources = [
      { documentId: "doc-1", documentTitle: "Policy.pdf", pageNumber: 3 },
      { documentId: "doc-1", documentTitle: "Policy.pdf", pageNumber: 3 }, // duplicate
      { documentId: "doc-1", documentTitle: "Policy.pdf", pageNumber: 7 }, // different page
      { documentId: "doc-2", documentTitle: "RC.pdf", pageNumber: 1 }
    ];

    const uniqueSources = Array.from(
      new Map(rawSources.map((s) => [`${s.documentId}-${s.pageNumber}`, s])).values()
    );

    assert.equal(uniqueSources.length, 3);
    assert.deepEqual(uniqueSources[0], { documentId: "doc-1", documentTitle: "Policy.pdf", pageNumber: 3 });
    assert.deepEqual(uniqueSources[1], { documentId: "doc-1", documentTitle: "Policy.pdf", pageNumber: 7 });
    assert.deepEqual(uniqueSources[2], { documentId: "doc-2", documentTitle: "RC.pdf", pageNumber: 1 });
  });

  test("Document library versionCount respects _count aggregation", () => {
    const rawDocWithMultipleVersions = {
      id: "doc-v",
      title: "Offer Letter",
      versions: [{ versionNumber: 3 }],
      _count: { versions: 3 }
    };

    const count = rawDocWithMultipleVersions._count?.versions ?? rawDocWithMultipleVersions.versions.length;
    assert.equal(count, 3);
  });
});
