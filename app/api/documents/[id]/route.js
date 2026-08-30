import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

// Fetches a document and throws (404-equivalent) unless it belongs to `user`.
// Every handler below calls this first — ownership is never assumed from the URL.
async function getOwnedDocument(id, userId) {
  const doc = await prisma.document.findUnique({
    where: { id },
    include: { versions: { orderBy: { versionNumber: "desc" } } },
  });
  if (!doc || doc.userId !== userId) return null;
  return doc;
}

export async function GET(req, { params }) {
  const user = await requireUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const doc = await getOwnedDocument(params.id, user.id);
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ document: doc });
}

export async function PATCH(req, { params }) {
  const user = await requireUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const doc = await getOwnedDocument(params.id, user.id);
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const data = {};
  if (typeof body.pinned === "boolean") data.pinned = body.pinned;
  if (typeof body.category === "string") data.category = body.category;
  if (typeof body.subcategory === "string" || body.subcategory === null) data.subcategory = body.subcategory;
  if (typeof body.customCategory === "string" || body.customCategory === null) data.customCategory = body.customCategory;
  if (typeof body.expiryDate === "string" || body.expiryDate === null) {
    data.expiryDate = body.expiryDate ? new Date(body.expiryDate) : null;
  }

  const updated = await prisma.document.update({ where: { id: doc.id }, data });
  return NextResponse.json({ document: updated });
}

export async function DELETE(req, { params }) {
  const user = await requireUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const doc = await getOwnedDocument(params.id, user.id);
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.chunk.deleteMany({ where: { documentId: doc.id } });
  await prisma.documentVersion.deleteMany({ where: { documentId: doc.id } });
  await prisma.document.delete({ where: { id: doc.id } });

  for (const v of doc.versions) {
    await fs.unlink(path.join(UPLOAD_DIR, v.filePath)).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}
