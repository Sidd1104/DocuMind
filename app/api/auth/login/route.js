import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, issueSessionCookie } from "@/lib/auth";
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
  const { allowed, resetMs } = checkRateLimit("login", ip, 5, 10 * 60 * 1000);
  if (!allowed) {
    const waitMins = Math.ceil(resetMs / 60000);
    return NextResponse.json(
      { error: `Too many login attempts. Please try again in ${waitMins} minute${waitMins === 1 ? "" : "s"}.` },
      {
        status: 429,
        headers: { "Retry-After": Math.ceil(resetMs / 1000).toString() },
      }
    );
  }
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
