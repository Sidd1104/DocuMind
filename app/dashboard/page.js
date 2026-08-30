import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AppShell from "@/components/AppShell";
import DashboardClient from "./DashboardClient";
import { categoryLabel } from "@/lib/categories";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const documents = await prisma.document.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    include: { versions: { orderBy: { versionNumber: "desc" }, take: 1 } },
  });

  const pinned = documents.filter((d) => d.pinned);
  const recent = documents.slice(0, 5);
  const upcomingExpiry = documents
    .filter((d) => d.expiryDate)
    .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate))
    .slice(0, 3);

  const safeUser = { id: user.id, name: user.name, email: user.email };

  const serialize = (d) => ({
    id: d.id,
    title: d.title,
    category: categoryLabel(d.category),
    updatedAt: d.updatedAt,
    expiryDate: d.expiryDate,
    pageCount: d.versions[0]?.pageCount ?? 0,
  });

  return (
    <AppShell user={safeUser}>
      <DashboardClient
        userName={user.name}
        pinned={pinned.map(serialize)}
        recent={recent.map(serialize)}
        upcomingExpiry={upcomingExpiry.map(serialize)}
        totalDocuments={documents.length}
      />
    </AppShell>
  );
}
