import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const COOKIE_NAME = "la_session";

if (!process.env.AUTH_SECRET || !process.env.AUTH_SECRET.trim()) {
  throw new Error("AUTH_SECRET is not set. Add a long random string to .env before starting the server.");
}
const SECRET = process.env.AUTH_SECRET.trim();

export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export function issueSessionCookie(userId) {
  const token = jwt.sign({ sub: userId }, SECRET, { expiresIn: "7d" });
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function clearSessionCookie() {
  cookies().set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
}

// Reads the session cookie, verifies it, and returns the authenticated user.
// This is the ONLY way any server code should learn "who is asking" —
// nothing in this app trusts a userId sent from the client.
export async function getCurrentUser() {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const payload = jwt.verify(token, SECRET);
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    return user;
  } catch {
    return null;
  }
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    const err = new Error("UNAUTHENTICATED");
    err.status = 401;
    throw err;
  }
  return user;
}
