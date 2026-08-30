import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { retrieveTopChunks } from "@/lib/rag";
import { generateGroundedAnswer } from "@/lib/llm";

export async function GET() {
  const user = await requireUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const messages = await prisma.chatMessage.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({
    messages: messages.map((m) => ({
      ...m,
      sources: m.sourcesJson ? JSON.parse(m.sourcesJson) : [],
    })),
  });
}

export async function POST(req) {
  const user = await requireUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const { message } = await req.json();
  if (!message || !message.trim()) {
    return NextResponse.json({ error: "Message is required." }, { status: 400 });
  }

  await prisma.chatMessage.create({
    data: { userId: user.id, role: "user", content: message },
  });

  // Retrieval is scoped to this user's documents AND to each document's
  // CURRENT version only, so an answer never cites a superseded version.
  const documents = await prisma.document.findMany({
    where: { userId: user.id, currentVersionId: { not: null } },
    select: { id: true, title: true, currentVersionId: true },
  });
  const versionToTitle = new Map(documents.map((d) => [d.currentVersionId, d.title]));

  const chunks = await prisma.chunk.findMany({
    where: {
      userId: user.id,
      documentVersionId: { in: documents.map((d) => d.currentVersionId) },
    },
  });

  const enrichedChunks = chunks.map((c) => ({
    ...c,
    documentTitle: versionToTitle.get(c.documentVersionId) || "Document",
  }));

  const topChunks = retrieveTopChunks(message, enrichedChunks, 5);
  const { text, provider, error } = await generateGroundedAnswer(message, topChunks);

  const sources = topChunks.map((c) => ({
    documentId: c.documentId,
    documentTitle: c.documentTitle,
    pageNumber: c.pageNumber,
  }));
  // De-duplicate sources by document+page for a cleaner citation list.
  const uniqueSources = Array.from(
    new Map(sources.map((s) => [`${s.documentId}-${s.pageNumber}`, s])).values()
  );

  await prisma.chatMessage.create({
    data: {
      userId: user.id,
      role: "assistant",
      content: text,
      sourcesJson: JSON.stringify(uniqueSources),
    },
  });

  return NextResponse.json({ answer: text, sources: uniqueSources, provider, error });
}
