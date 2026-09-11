import { NextResponse } from "next/server";

/**
 * Edge-safe JWT verification using Web Crypto API (SubtleCrypto).
 * 
 * Why Web Crypto instead of jsonwebtoken?
 * The 'jsonwebtoken' package depends on Node.js-specific 'crypto' modules (e.g. crypto.createSign)
 * which are not supported in Next.js Edge runtime. Web Crypto API is a standard, built-in global
 * available across both Edge and Node runtimes with zero external dependencies.
 */
async function verifySessionToken(token, secret) {
  if (!token || typeof token !== "string" || !secret) return null;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [headerB64, payloadB64, signatureB64] = parts;

    // Decode base64url signature to byte buffer
    const sigStr = atob(signatureB64.replace(/-/g, "+").replace(/_/g, "/"));
    const sigBuf = new Uint8Array(sigStr.length);
    for (let i = 0; i < sigStr.length; i++) {
      sigBuf[i] = sigStr.charCodeAt(i);
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(`${headerB64}.${payloadB64}`);
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const isValid = await crypto.subtle.verify("HMAC", key, sigBuf, data);
    if (!isValid) return null;

    // Decode base64url payload
    const payloadJson = atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(payloadJson);

    // Validate expiration
    if (payload.exp && payload.exp < Date.now() / 1000) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

const PROTECTED_PREFIXES = ["/dashboard", "/documents", "/assistant"];
const AUTH_PAGES = ["/login", "/signup"];

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("la_session")?.value;
  const secret = process.env.AUTH_SECRET;

  const payload = await verifySessionToken(token, secret);
  const isAuthenticated = Boolean(payload?.sub);

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
  const isAuthPage = AUTH_PAGES.includes(pathname);

  // Unauthenticated users visiting protected pages -> redirect to /login
  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  // Already authenticated users visiting /login or /signup -> redirect to /dashboard
  if (isAuthPage && isAuthenticated) {
    const dashboardUrl = new URL("/dashboard", req.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/documents",
    "/documents/:path*",
    "/assistant",
    "/assistant/:path*",
    "/login",
    "/signup",
  ],
};
