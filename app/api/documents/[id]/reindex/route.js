import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { extractPages, chunkPageText } from "@/lib/rag";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

export async function POST(req, { params }) {
  const user = await requireUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const doc = await prisma.document.findUnique({
    where: { id: params.id },
    include: { versions: { orderBy: { versionNumber: "desc" } } },
  });
  if (!doc || doc.userId !== user.id) {
    return NextResponse.json({ error: "Document not found." }, { status: 404 });
  }

  const currentVersion = doc.versions.find((v) => v.id === doc.currentVersionId) || doc.versions[0];
  if (!currentVersion) {
    return NextResponse.json({ error: "No document versions available to re-index." }, { status: 404 });
  }

  const safeUploadDir = path.resolve(UPLOAD_DIR);
  const filePath = path.resolve(path.join(safeUploadDir, currentVersion.filePath));
  if (!filePath.startsWith(safeUploadDir)) {
    return NextResponse.json({ error: "Access denied." }, { status: 403 });
  }

  let buffer;
  try {
    buffer = await fs.readFile(filePath);
  } catch {
    return NextResponse.json({ error: "Document file missing on disk." }, { status: 404 });
  }

  console.log(`[Re-index Pipeline] Initiating re-index for "${doc.title}" (version ${currentVersion.versionNumber})...`);

  let pages = [];
  try {
    pages = await extractPages(buffer);
  } catch (err) {
    console.error("[Re-index Pipeline] Extraction error:", err.message);
    pages = [];
  }

  const totalChars = pages.reduce((acc, p) => acc + (p?.length || 0), 0);
  console.log(`[Re-index Pipeline] Stage 1 (Text Extraction): Extracted ${totalChars} characters across ${pages.length} pages.`);

  const chunkRows = [];
  pages.forEach((pageText, pageIdx) => {
    const chunks = chunkPageText(pageText);
    chunks.forEach((text, chunkIdx) => {
      chunkRows.push({
        userId: user.id,
        documentId: doc.id,
        documentVersionId: currentVersion.id,
        pageNumber: pageIdx + 1,
        chunkIndex: chunkIdx,
        text,
      });
    });
  });

  console.log(`[Re-index Pipeline] Stage 2 (Chunking): Generated ${chunkRows.length} chunks.`);

  if (chunkRows.length === 0) {
    console.error(`[Re-index Pipeline] Re-indexing failed for "${doc.title}": 0 passages generated.`);
    return NextResponse.json(
      {
        error: "Re-indexing produced 0 passages. The document may be empty, unscannable, or password-protected.",
        chunksIndexed: 0,
        pageCount: pages.length,
      },
      { status: 422 }
    );
  }

  // Remove existing chunks for this document and version to prevent duplication
  await prisma.chunk.deleteMany({
    where: { documentId: doc.id, documentVersionId: currentVersion.id },
  });

  // Persist newly generated chunks
  await prisma.chunk.createMany({ data: chunkRows });

  // Update version page count if changed
  await prisma.documentVersion.update({
    where: { id: currentVersion.id },
    data: { pageCount: pages.length },
  });

  await prisma.document.update({
    where: { id: doc.id },
    data: { updatedAt: new Date() },
  });

  console.log(`[Re-index Pipeline] Stage 3 (Indexing Success): Persisted ${chunkRows.length} passages scoped to userId ${user.id}.`);

  const pageLabel = `${pages.length} page${pages.length === 1 ? "" : "s"}`;
  const passageLabel = `${chunkRows.length} passage${chunkRows.length === 1 ? "" : "s"}`;

  return NextResponse.json({
    ok: true,
    pageCount: pages.length,
    chunksIndexed: chunkRows.length,
    message: `Re-indexed: ${pageLabel}, ${passageLabel} indexed`,
  });
}
