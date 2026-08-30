import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

export async function GET(req, { params }) {
  const user = await requireUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const doc = await prisma.document.findUnique({
    where: { id: params.id },
    include: { versions: { orderBy: { versionNumber: "desc" }, take: 1 } },
  });
  // Ownership check happens here, on every file request — not just at upload time.
  if (!doc || doc.userId !== user.id || doc.versions.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const version = doc.versions[0];
  const filePath = path.join(UPLOAD_DIR, version.filePath);
  try {
    const buffer = await fs.readFile(filePath);
    return new NextResponse(buffer, {
      headers: {
        "content-type": "application/pdf",
        "content-disposition": `inline; filename="${version.originalName}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "File missing on disk" }, { status: 404 });
  }
}
