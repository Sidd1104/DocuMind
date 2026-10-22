import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export async function GET() {
  const user = await requireUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const [documentCount, versions, chunkCount] = await Promise.all([
    prisma.document.count({ where: { userId: user.id } }),
    prisma.documentVersion.findMany({
      where: { document: { userId: user.id } },
      select: { fileSize: true },
    }),
    prisma.chunk.count({ where: { userId: user.id } }),
  ]);

  const versionCount = versions.length;
  const totalSizeBytes = versions.reduce((sum, v) => sum + (v.fileSize || 0), 0);

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    },
    stats: {
      documentCount,
      versionCount,
      chunkCount,
      totalSizeBytes,
    },
  });
}

export async function PATCH(req) {
  const user = await requireUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const { name } = body;
  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }
  if (name.trim().length > 80) {
    return NextResponse.json({ error: "Name must be 80 characters or fewer." }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { name: name.trim() },
    select: { id: true, name: true, email: true, createdAt: true },
  });

  return NextResponse.json({ ok: true, user: updated });
}
