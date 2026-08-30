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

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  const storedName = `${uuid()}.pdf`;
  await fs.writeFile(path.join(UPLOAD_DIR, storedName), buffer);

  let pages = [];
  try {
    pages = await extractPages(buffer);
  } catch {
    pages = [];
  }

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

  // Old chunks stay in the DB tagged with their own documentVersionId (history is
  // preserved), but retrieval for the assistant only ever looks at the CURRENT
  // version's chunks — see /api/chat.
  const chunkRows = [];
  pages.forEach((pageText, pageIdx) => {
    chunkPageText(pageText).forEach((text, chunkIdx) => {
      chunkRows.push({
        userId: user.id,
        documentId: doc.id,
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

  return NextResponse.json({ ok: true, versionNumber: nextVersionNumber });
}
