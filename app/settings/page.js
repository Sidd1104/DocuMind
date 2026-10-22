import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AppShell from "@/components/AppShell";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

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

  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt.toISOString(),
  };

  const stats = {
    documentCount,
    versionCount,
    chunkCount,
    totalSizeBytes,
  };

  return (
    <AppShell user={safeUser}>
      <SettingsClient initialUser={safeUser} stats={stats} />
    </AppShell>
  );
}
