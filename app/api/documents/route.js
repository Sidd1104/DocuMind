import { NextResponse } from "next/server";
import { v4 as uuid } from "uuid";
import path from "path";
import fs from "fs/promises";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { extractPages, chunkPageText } from "@/lib/rag";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

export async function GET() {
  const user = await requireUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  // Every query is scoped to this user's id — never a global document table scan.
  const documents = await prisma.document.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    include: { versions: { orderBy: { versionNumber: "desc" }, take: 1 } },
  });

  return NextResponse.json({ documents });
}

export async function POST(req) {
  const user = await requireUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file");
  const title = form.get("title") || (file && file.name) || "Untitled document";
  const category = form.get("category");
  const subcategory = form.get("subcategory") || null;
  const customCategory = form.get("customCategory") || null;
  const expiryRaw = form.get("expiryDate");
  let expiryDate = null;
  if (expiryRaw && typeof expiryRaw === "string" && expiryRaw.trim()) {
    const parsed = new Date(expiryRaw.trim());
    if (isNaN(parsed.getTime())) {
      return NextResponse.json({ error: "Invalid expiry date format." }, { status: 400 });
    }
    expiryDate = parsed;
  }

  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "A PDF file is required." }, { status: 400 });
  }
  if (file.type !== "application/pdf") {
    return NextResponse.json({ error: "Only PDF files are supported in this prototype." }, { status: 400 });
  }
  const MAX_SIZE = 15 * 1024 * 1024; // 15MB
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File is too large (max 15MB)." }, { status: 400 });
  }
  if (!category) {
    return NextResponse.json({ error: "Please select a category." }, { status: 400 });
  }

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  const storedName = `${uuid()}.pdf`;
  const filePath = path.join(UPLOAD_DIR, storedName);
  await fs.writeFile(filePath, buffer);

  const totalChars = pages.reduce((acc, p) => acc + (p?.length || 0), 0);
  console.log(`[Upload Pipeline] Stage 1 (Text Extraction): Extracted ${totalChars} total characters across ${pages.length} pages.`);

  const chunkRows = [];
  pages.forEach((pageText, pageIdx) => {
    const chunks = chunkPageText(pageText);
    chunks.forEach((text, chunkIdx) => {
      chunkRows.push({
        userId: user.id,
        documentId: null, // assigned after document creation
        documentVersionId: null,
        pageNumber: pageIdx + 1,
        chunkIndex: chunkIdx,
        text,
      });
    });
  });

  console.log(`[Upload Pipeline] Stage 2 (Chunking): Generated ${chunkRows.length} chunks from document "${title}".`);

  // Guardrail: Never report success with 0 passages.
  if (chunkRows.length === 0) {
    console.error(`[Upload Pipeline] Ingestion failed for "${title}": 0 passages extracted after OCR fallback.`);
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
    const document = await prisma.document.create({
      data: {
        userId: user.id,
        title,
        category,
        subcategory,
        customCategory,
        expiryDate,
      },
    });

    const version = await prisma.documentVersion.create({
      data: {
        documentId: document.id,
        versionNumber: 1,
        filePath: storedName,
        originalName: file.name,
        fileSize: file.size,
        pageCount: pages.length,
      },
    });

    await prisma.document.update({
      where: { id: document.id },
      data: { currentVersionId: version.id },
    });

    // Assign document and version IDs to chunk rows
    chunkRows.forEach((row) => {
      row.documentId = document.id;
      row.documentVersionId = version.id;
    });

    await prisma.chunk.createMany({ data: chunkRows });

    console.log(`[Upload Pipeline] Stage 3 (Indexing Success): Persisted ${chunkRows.length} passages scoped to userId ${user.id}.`);

    const pageLabel = `${pages.length} page${pages.length === 1 ? "" : "s"}`;
    const passageLabel = `${chunkRows.length} passage${chunkRows.length === 1 ? "" : "s"}`;

    return NextResponse.json({
      ok: true,
      documentId: document.id,
      pageCount: pages.length,
      chunksIndexed: chunkRows.length,
      message: `${pageLabel}, ${passageLabel} indexed`,
    });
  } catch (dbErr) {
    console.error("[Upload Pipeline] Database Error:", dbErr.message);
    await fs.unlink(filePath).catch(() => {});
    return NextResponse.json({ error: "Failed to persist document and passages." }, { status: 500 });
  }
}
