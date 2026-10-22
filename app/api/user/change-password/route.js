import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, verifyPassword, hashPassword } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rateLimit";

export async function POST(req) {
  const user = await requireUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  // Rate limit password change attempts: 5 attempts per 15 minutes per user
  const { allowed, resetMs } = checkRateLimit("change-password", user.id, 5, 15 * 60 * 1000);
  if (!allowed) {
    const mins = Math.ceil(resetMs / 60000);
    return NextResponse.json(
      { error: `Too many password change attempts. Please wait ${mins} minute${mins === 1 ? "" : "s"}.` },
      { status: 429 }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const { currentPassword, newPassword } = body;
  if (!currentPassword || typeof currentPassword !== "string") {
    return NextResponse.json({ error: "Current password is required." }, { status: 400 });
  }
  if (!newPassword || typeof newPassword !== "string" || newPassword.length < 8) {
    return NextResponse.json({ error: "New password must be at least 8 characters long." }, { status: 400 });
  }

  const isValidCurrent = await verifyPassword(currentPassword, user.passwordHash);
  if (!isValidCurrent) {
    return NextResponse.json({ error: "Incorrect current password." }, { status: 400 });
  }

  const newHash = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: newHash },
  });

  return NextResponse.json({ ok: true, message: "Password updated successfully." });
}
