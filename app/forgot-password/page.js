"use client";

import { useState } from "react";
import Link from "next/link";
import AuthShell from "@/components/AuthShell";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [devResetUrl, setDevResetUrl] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setDevResetUrl("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(data.error || "Unable to process password reset request.");
        return;
      }

      setSuccess(data.message || "Password reset instructions have been generated.");
      if (data.devResetUrl) {
        setDevResetUrl(data.devResetUrl);
      }
    } catch {
      setLoading(false);
      setError("Network error. Please try again.");
    }
  }

  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter your account email to receive a password recovery link."
      footer={
        <>
          Remembered your password?{" "}
          <Link href="/login" className="text-teal-700 font-medium hover:underline">
            Back to login
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1">Account Email</label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-ink-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-500"
            placeholder="you@example.com"
          />
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">{error}</p>}
        {success && <p className="text-sm text-emerald-800 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">{success}</p>}

        {devResetUrl && (
          <div className="bg-teal-50 border border-teal-200 p-3 rounded-lg text-xs text-teal-900 space-y-1.5">
            <p className="font-semibold">Development Testing Helper:</p>
            <p className="text-ink-600">SMTP email provider is not active in this development environment. Use the link below to test the reset flow:</p>
            <Link
              href={devResetUrl}
              className="inline-block mt-1 font-semibold text-teal-700 hover:text-teal-900 underline"
            >
              Open Password Reset Form ↗
            </Link>
          </div>
        )}

        <button
          disabled={loading}
          className="w-full rounded-lg bg-navy-900 hover:bg-navy-800 disabled:opacity-60 text-white text-sm font-medium py-2.5 transition-colors shadow-soft"
        >
          {loading ? "Sending reset instructions…" : "Send Reset Link"}
        </button>
      </form>
    </AuthShell>
  );
}
