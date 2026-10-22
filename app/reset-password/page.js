"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import AuthShell from "@/components/AuthShell";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!token) {
      setError("No reset token provided. Please use the link sent to your email.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(data.error || "Unable to reset password.");
        return;
      }

      setSuccess("Your password has been reset successfully! Redirecting to login…");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch {
      setLoading(false);
      setError("Network error. Please try again.");
    }
  }

  if (!token) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
          Invalid or missing password reset token.
        </p>
        <Link
          href="/forgot-password"
          className="inline-block text-sm font-medium text-teal-700 hover:underline"
        >
          Request a new reset link
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-ink-700 mb-1">New Password</label>
        <input
          required
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-ink-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-500"
          placeholder="At least 8 characters"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-ink-700 mb-1">Confirm New Password</label>
        <input
          required
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full rounded-lg border border-ink-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-500"
          placeholder="Re-enter your new password"
        />
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">{error}</p>}
      {success && <p className="text-sm text-emerald-800 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">{success}</p>}

      <button
        disabled={loading || Boolean(success)}
        className="w-full rounded-lg bg-navy-900 hover:bg-navy-800 disabled:opacity-60 text-white text-sm font-medium py-2.5 transition-colors shadow-soft"
      >
        {loading ? "Updating password…" : "Reset Password"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthShell
      title="Create new password"
      subtitle="Enter and confirm your new secure password."
      footer={
        <>
          Remember your password?{" "}
          <Link href="/login" className="text-teal-700 font-medium hover:underline">
            Back to login
          </Link>
        </>
      }
    >
      <Suspense fallback={<p className="text-sm text-ink-400 text-center py-4">Loading reset form…</p>}>
        <ResetPasswordForm />
      </Suspense>
    </AuthShell>
  );
}
