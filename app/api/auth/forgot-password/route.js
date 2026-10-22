import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rateLimit";

const SECRET = process.env.AUTH_SECRET ? process.env.AUTH_SECRET.trim() : "";

export async function POST(req) {
  if (!SECRET) {
    return NextResponse.json({ error: "Server authentication misconfigured." }, { status: 500 });
  }

  // Rate limit by client IP: 5 attempts per 15 minutes
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
  const { allowed, resetMs } = checkRateLimit("forgot-password", ip, 5, 15 * 60 * 1000);
  if (!allowed) {
    const mins = Math.ceil(resetMs / 60000);
    return NextResponse.json(
      { error: `Too many password reset requests. Please try again in ${mins} minute${mins === 1 ? "" : "s"}.` },
      { status: 429 }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const { email } = body;
  if (!email || typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
  }

  const cleanEmail = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: cleanEmail } });

  // Uniform response message to prevent email enumeration attacks
  const standardMessage = "If an account with that email exists, password reset instructions have been generated.";

  if (!user) {
    return NextResponse.json({ ok: true, message: standardMessage });
  }

  // Generate a cryptographically signed, expiring (1 hour), single-use token.
  // Including the last 10 characters of the current passwordHash ensures that
  // once the password is reset, the token is permanently invalidated against replay.
  const token = jwt.sign(
    {
      sub: user.id,
      email: user.email,
      type: "password_reset",
      pwhash: user.passwordHash.slice(-10),
    },
    SECRET,
    { expiresIn: "1h" }
  );

  const isDev = process.env.NODE_ENV !== "production";

  return NextResponse.json({
    ok: true,
    message: standardMessage,
    // In local development or testing where an external SMTP server is not attached,
    // expose the reset link directly in the response so the developer/user can test the flow.
    ...(isDev ? { devResetUrl: `/reset-password?token=${token}` } : {}),
  });
}
