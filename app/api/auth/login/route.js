import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, issueSessionCookie } from "@/lib/auth";

export async function POST(req) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  // Deliberately generic error message — never reveal whether the email exists.
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  issueSessionCookie(user.id);
  return NextResponse.json({ ok: true });
}
