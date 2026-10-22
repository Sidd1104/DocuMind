import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rateLimit";

const SECRET = process.env.AUTH_SECRET ? process.env.AUTH_SECRET.trim() : "";

export async function POST(req) {
  if (!SECRET) {
    return NextResponse.json({ error: "Server authentication misconfigured." }, { status: 500 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
  const { allowed, resetMs } = checkRateLimit("reset-password", ip, 10, 15 * 60 * 1000);
  if (!allowed) {
    const mins = Math.ceil(resetMs / 60000);
    return NextResponse.json(
      { error: `Too many password reset attempts. Please try again in ${mins} minute${mins === 1 ? "" : "s"}.` },
      { status: 429 }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const { token, password } = body;
  if (!token || typeof token !== "string") {
    return NextResponse.json({ error: "Reset token is required." }, { status: 400 });
  }
  if (!password || typeof password !== "string" || password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters long." }, { status: 400 });
  }

  let payload;
  try {
    payload = jwt.verify(token, SECRET);
  } catch (jwtErr) {
    if (jwtErr.name === "TokenExpiredError") {
      return NextResponse.json({ error: "This password reset link has expired. Please request a new one." }, { status: 400 });
    }
    return NextResponse.json({ error: "Invalid password reset link. Please request a new one." }, { status: 400 });
  }

  if (payload.type !== "password_reset" || !payload.sub || !payload.pwhash) {
    return NextResponse.json({ error: "Malformed reset token." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user) {
    return NextResponse.json({ error: "User account not found." }, { status: 404 });
  }

  // Prevent token replay / reuse: verify that the token's hash fingerprint
  // matches the user's current password hash.
  if (user.passwordHash.slice(-10) !== payload.pwhash) {
    return NextResponse.json(
      { error: "This reset link has already been used. Please request a new one." },
      { status: 400 }
    );
  }

  const newHash = await hashPassword(password);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: newHash },
  });

  return NextResponse.json({
    ok: true,
    message: "Your password has been successfully reset. You can now log in.",
  });
}
