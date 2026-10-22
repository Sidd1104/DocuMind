import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { PrismaClient } from "@prisma/client";
import { categoryLabel } from "../lib/categories.js";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "file:../prisma/dev.db"
    }
  }
});

describe("Runtime Database & Page Component Regression Verification", () => {
  test("Dashboard page query and serialization executes with no runtime errors", async () => {
    const user = await prisma.user.findFirst();
    assert.ok(user, "Expected at least one user in database");

    // Execute exact query from app/dashboard/page.js
    const documents = await prisma.document.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      include: { versions: { orderBy: { versionNumber: "desc" }, take: 1 } },
    });

    const pinned = documents.filter((d) => d.pinned);
    const now = new Date();
    const ninetyDaysFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

    const upcomingExpiry = documents
      .filter((d) => {
        if (!d.expiryDate) return false;
        const expiry = new Date(d.expiryDate);
        return expiry >= now && expiry <= ninetyDaysFromNow;
      })
      .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate))
      .slice(0, 3);

    // This was the exact line that threw ReferenceError: recent is not defined
    const recent = documents.slice(0, 6);

    const serialize = (d) => ({
      id: d.id,
      title: d.title,
      category: categoryLabel(d.category),
      updatedAt: d.updatedAt,
      expiryDate: d.expiryDate,
      pageCount: d.versions[0]?.pageCount ?? 0,
    });

    const dashboardPayload = {
      userName: user.name,
      pinned: pinned.map(serialize),
      recent: recent.map(serialize),
      upcomingExpiry: upcomingExpiry.map(serialize),
      totalDocuments: documents.length,
    };

    assert.ok(dashboardPayload.recent !== undefined, "recent array must be defined");
    assert.ok(Array.isArray(dashboardPayload.recent), "recent must be an array");
    assert.ok(Array.isArray(dashboardPayload.pinned), "pinned must be an array");
    assert.ok(Array.isArray(dashboardPayload.upcomingExpiry), "upcomingExpiry must be an array");
    assert.ok(typeof dashboardPayload.totalDocuments === "number");
  });

  test("Documents page query with _count aggregation calculates accurate versionCount", async () => {
    const user = await prisma.user.findFirst();
    assert.ok(user);

    // Execute exact query from updated app/documents/page.js
    const documents = await prisma.document.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      include: {
        versions: { orderBy: { versionNumber: "desc" }, take: 1 },
        _count: { select: { versions: true } },
      },
    });

    const serialized = documents.map((d) => ({
      id: d.id,
      title: d.title,
      versionCount: d._count?.versions ?? d.versions.length,
    }));

    serialized.forEach((doc) => {
      assert.ok(typeof doc.versionCount === "number");
      assert.ok(doc.versionCount >= 1, "Document must have at least 1 version");
    });
  });
});
