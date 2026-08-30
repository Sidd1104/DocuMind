import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AppShell from "@/components/AppShell";
import ChatPanel from "@/components/ChatPanel";

export default async function AssistantPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const documents = await prisma.document.findMany({
    where: { userId: user.id },
    select: { title: true },
    take: 20,
  });

  const safeUser = { id: user.id, name: user.name, email: user.email };

  return (
    <AppShell user={safeUser}>
      <ChatPanel documentTitles={documents.map((d) => d.title)} />
    </AppShell>
  );
}
