import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, issueSessionCookie } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rateLimit";

function getClientIp(req) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    req.ip ||
    "127.0.0.1"
  );
}

export async function POST(req) {
  const ip = getClientIp(req);
  const { allowed, resetMs } = checkRateLimit("signup", ip, 5, 10 * 60 * 1000);
  if (!allowed) {
    const waitMins = Math.ceil(resetMs / 60000);
    return NextResponse.json(
      { error: `Too many registration attempts. Please try again in ${waitMins} minute${waitMins === 1 ? "" : "s"}.` },
      {
        status: 429,
        headers: { "Retry-After": Math.ceil(resetMs / 1000).toString() },
      }
    );
  }

  const { name, email, password } = await req.json();

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Name, email, and password are required." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { name, email: email.toLowerCase(), passwordHash },
  });

  issueSessionCookie(user.id);
  return NextResponse.json({
    ok: true,
    user: { id: user.id, name: user.name, email: user.email },
  });
}
