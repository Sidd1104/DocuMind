import { NextResponse } from "next/server";
import { v4 as uuid } from "uuid";
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
    include: { versions: true },
  });
  if (!doc || doc.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!file || typeof file === "string" || file.type !== "application/pdf") {
    return NextResponse.json({ error: "A PDF file is required." }, { status: 400 });
  }
  const MAX_SIZE = 15 * 1024 * 1024; // 15MB
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File is too large (max 15MB)." }, { status: 400 });
  }

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  const storedName = `${uuid()}.pdf`;
  const filePath = path.join(UPLOAD_DIR, storedName);
  await fs.writeFile(filePath, buffer);

  let pages = [];
  try {
    pages = await extractPages(buffer);
  } catch (err) {
    console.error("[Version Pipeline] Text extraction error:", err.message);
    pages = [];
  }

  const totalChars = pages.reduce((acc, p) => acc + (p?.length || 0), 0);
  console.log(`[Version Pipeline] Stage 1 (Text Extraction): Extracted ${totalChars} characters across ${pages.length} pages.`);

  const chunkRows = [];
  pages.forEach((pageText, pageIdx) => {
    chunkPageText(pageText).forEach((text, chunkIdx) => {
      chunkRows.push({
        userId: user.id,
        documentId: doc.id,
        documentVersionId: null, // assigned after version creation
        pageNumber: pageIdx + 1,
        chunkIndex: chunkIdx,
        text,
      });
    });
  });

  console.log(`[Version Pipeline] Stage 2 (Chunking): Generated ${chunkRows.length} chunks.`);

  if (chunkRows.length === 0) {
    console.error(`[Version Pipeline] Ingestion failed for version: 0 passages extracted after OCR fallback.`);
    await fs.unlink(filePath).catch(() => {});
    return NextResponse.json(
      {
        error: "No readable passages could be extracted from this PDF (0 passages indexed). Please verify the document is not password-protected, blank, or unscannable.",
        chunksIndexed: 0,
        pageCount: pages.length,
      },
      { status: 422 }
    );
  }

  try {
    const nextVersionNumber = Math.max(...doc.versions.map((v) => v.versionNumber), 0) + 1;
    const version = await prisma.documentVersion.create({
      data: {
        documentId: doc.id,
        versionNumber: nextVersionNumber,
        filePath: storedName,
        originalName: file.name,
        fileSize: file.size,
        pageCount: pages.length,
      },
    });

    await prisma.document.update({
      where: { id: doc.id },
      data: { currentVersionId: version.id, updatedAt: new Date() },
    });

    chunkRows.forEach((row) => {
      row.documentVersionId = version.id;
    });

    await prisma.chunk.createMany({ data: chunkRows });

    console.log(`[Version Pipeline] Stage 3 (Indexing Success): Persisted ${chunkRows.length} passages for version ${nextVersionNumber}.`);

    const pageLabel = `${pages.length} page${pages.length === 1 ? "" : "s"}`;
    const passageLabel = `${chunkRows.length} passage${chunkRows.length === 1 ? "" : "s"}`;

    return NextResponse.json({
      ok: true,
      versionNumber: nextVersionNumber,
      pageCount: pages.length,
      chunksIndexed: chunkRows.length,
      message: `Version ${nextVersionNumber}: ${pageLabel}, ${passageLabel} indexed`,
    });
  } catch (dbErr) {
    console.error("[Version Ingestion Error]", dbErr.message);
    await fs.unlink(filePath).catch(() => {});
    return NextResponse.json({ error: "Failed to persist updated version." }, { status: 500 });
  }
}
