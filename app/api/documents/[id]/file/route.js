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
    include: { versions: { orderBy: { versionNumber: "desc" } } },
  });
  // Ownership check happens here, on every file request — not just at upload time.
  if (!doc || doc.userId !== user.id || doc.versions.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { searchParams } = new URL(req.url);
  const versionParam = searchParams.get("version");
  let version = doc.versions[0];

  if (versionParam) {
    const targetVersion = parseInt(versionParam, 10);
    const matched = doc.versions.find((v) => v.versionNumber === targetVersion);
    if (!matched) {
      return NextResponse.json({ error: "Version not found" }, { status: 404 });
    }
    version = matched;
  }

  const safeUploadDir = path.resolve(UPLOAD_DIR);
  const filePath = path.resolve(path.join(safeUploadDir, version.filePath));
  if (!filePath.startsWith(safeUploadDir)) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  try {
    const buffer = await fs.readFile(filePath);
    const sanitizedName = version.originalName.replace(/["\r\n]/g, "_");
    return new NextResponse(buffer, {
      headers: {
        "content-type": "application/pdf",
        "content-disposition": `inline; filename="${sanitizedName}"`,
        "x-content-type-options": "nosniff",
        "cache-control": "private, no-cache, no-store, must-revalidate",
      },
    });
  } catch {
    return NextResponse.json({ error: "File missing on disk" }, { status: 404 });
  }
}
