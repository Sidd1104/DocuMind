import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AppShell from "@/components/AppShell";
import DetailClient from "./DetailClient";

export default async function DocumentDetailPage({ params }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const doc = await prisma.document.findUnique({
    where: { id: params.id },
    include: { versions: { orderBy: { versionNumber: "desc" } } },
  });
  if (!doc || doc.userId !== user.id) notFound();

  const serialized = {
    id: doc.id,
    title: doc.title,
    category: doc.category,
    subcategory: doc.subcategory,
    customCategory: doc.customCategory,
    pinned: doc.pinned,
    expiryDate: doc.expiryDate,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    versions: doc.versions.map((v) => ({
      id: v.id,
      versionNumber: v.versionNumber,
      originalName: v.originalName,
      fileSize: v.fileSize,
      pageCount: v.pageCount,
      uploadedAt: v.uploadedAt,
    })),
  };

  const safeUser = { id: user.id, name: user.name, email: user.email };

  return (
    <AppShell user={safeUser}>
      <DetailClient doc={serialized} />
    </AppShell>
  );
}
