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

  let pages = [];
  try {
    pages = await extractPages(buffer);
  } catch (e) {
    // Extraction failure shouldn't block the upload — the document is still
    // stored, it just won't be answerable by the assistant yet.
    pages = [];
  }

  const document = await prisma.document.create({
    data: {
      userId: user.id,
      title,
      category,
      subcategory,
      customCategory,
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

  const chunkRows = [];
  pages.forEach((pageText, pageIdx) => {
    const chunks = chunkPageText(pageText);
    chunks.forEach((text, chunkIdx) => {
      chunkRows.push({
        userId: user.id,
        documentId: document.id,
        documentVersionId: version.id,
        pageNumber: pageIdx + 1,
        chunkIndex: chunkIdx,
        text,
      });
    });
  });
  if (chunkRows.length > 0) {
    await prisma.chunk.createMany({ data: chunkRows });
  }

  return NextResponse.json({ ok: true, documentId: document.id, chunksIndexed: chunkRows.length });
}
