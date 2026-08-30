import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AppShell from "@/components/AppShell";
import LibraryClient from "./LibraryClient";
import { categoryLabel } from "@/lib/categories";

export default async function DocumentsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const documents = await prisma.document.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    include: { versions: { orderBy: { versionNumber: "desc" }, take: 1 } },
  });

  const serialized = documents.map((d) => ({
    id: d.id,
    title: d.title,
    category: d.category,
    categoryLabel: categoryLabel(d.category),
    subcategory: d.subcategory,
    customCategory: d.customCategory,
    pinned: d.pinned,
    expiryDate: d.expiryDate,
    updatedAt: d.updatedAt,
    createdAt: d.createdAt,
    fileSize: d.versions[0]?.fileSize ?? 0,
    pageCount: d.versions[0]?.pageCount ?? 0,
    versionCount: d.versions.length,
  }));

  const safeUser = { id: user.id, name: user.name, email: user.email };

  return (
    <AppShell user={safeUser}>
      <LibraryClient documents={serialized} />
    </AppShell>
  );
}
