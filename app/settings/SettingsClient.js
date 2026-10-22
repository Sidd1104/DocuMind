"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function formatSize(bytes) {
  if (!bytes) return "0 MB";
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function SettingsClient({ initialUser, stats }) {
  const router = useRouter();
  const [user, setUser] = useState(initialUser);
  const [name, setName] = useState(initialUser.name);
  const [editingName, setEditingName] = useState(false);
  const [nameLoading, setNameLoading] = useState(false);
  const [nameMsg, setNameMsg] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");

  async function handleUpdateName(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setNameLoading(true);
    setNameMsg("");

    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      setNameLoading(false);
      if (res.ok) {
        setUser(data.user);
        setEditingName(false);
        setNameMsg("Name updated successfully.");
        router.refresh();
      } else {
        setNameMsg(data.error || "Failed to update name.");
      }
    } catch {
      setNameLoading(false);
      setNameMsg("Network error.");
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setPwError("");
    setPwSuccess("");

    if (newPassword.length < 8) {
      setPwError("New password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError("New passwords do not match.");
      return;
    }

    setPwLoading(true);
    try {
      const res = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      setPwLoading(false);

      if (!res.ok) {
        setPwError(data.error || "Failed to update password.");
        return;
      }

      setPwSuccess("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setPwLoading(false);
      setPwError("Network error. Please try again.");
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-navy-950">Account & Settings</h1>
        <p className="text-sm text-ink-500 mt-1">
          Manage your personal profile, security credentials, and view vault telemetry.
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white border border-ink-100 rounded-xl2 shadow-soft p-6 space-y-6">
        <h2 className="text-base font-semibold text-navy-950 flex items-center gap-2">
          <span>👤</span> Profile Information
        </h2>

        <div className="space-y-4 text-sm divide-y divide-ink-100">
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="font-medium text-ink-700 block">Display Name</span>
              <span className="text-xs text-ink-400">Used for greetings and assistant interactions</span>
            </div>
            {editingName ? (
              <form onSubmit={handleUpdateName} className="flex items-center gap-2">
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="border border-ink-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                  maxLength={80}
                />
                <button
                  type="submit"
                  disabled={nameLoading}
                  className="text-xs bg-navy-900 text-white rounded-lg px-3 py-2 font-medium hover:bg-navy-800 disabled:opacity-50"
                >
                  {nameLoading ? "Saving…" : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setName(user.name);
                    setEditingName(false);
                  }}
                  className="text-xs border border-ink-200 rounded-lg px-2.5 py-2 text-ink-600 hover:bg-ink-50"
                >
                  Cancel
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-3">
                <span className="font-medium text-navy-950">{user.name}</span>
                <button
                  onClick={() => setEditingName(true)}
                  className="text-xs text-teal-700 font-medium hover:underline"
                >
                  Edit
                </button>
              </div>
            )}
          </div>
          {nameMsg && <p className="text-xs text-teal-700 pt-1">{nameMsg}</p>}

          <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="font-medium text-ink-700 block">Email Address</span>
              <span className="text-xs text-ink-400">Your account identifier for logging in</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-navy-950">{user.email}</span>
              <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-2 py-0.5 font-medium">
                Verified
              </span>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="font-medium text-ink-700 block">Member Since</span>
              <span className="text-xs text-ink-400">Date your DocuMind vault was created</span>
            </div>
            <span className="text-ink-600">{formatDate(user.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Security Card: Change Password */}
      <div className="bg-white border border-ink-100 rounded-xl2 shadow-soft p-6 space-y-5">
        <div>
          <h2 className="text-base font-semibold text-navy-950 flex items-center gap-2">
            <span>🔒</span> Security & Password
          </h2>
          <p className="text-xs text-ink-400 mt-1">
            Ensure your account uses a strong password with at least 8 characters.
          </p>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-medium text-ink-700 mb-1">Current Password</label>
            <input
              required
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full text-sm border border-ink-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
              placeholder="••••••••"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-ink-700 mb-1">New Password</label>
              <input
                required
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full text-sm border border-ink-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
                placeholder="Min. 8 characters"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-700 mb-1">Confirm New Password</label>
              <input
                required
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full text-sm border border-ink-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
                placeholder="Re-enter password"
              />
            </div>
          </div>

          {pwError && <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">{pwError}</p>}
          {pwSuccess && <p className="text-xs text-emerald-800 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">{pwSuccess}</p>}

          <button
            type="submit"
            disabled={pwLoading}
            className="rounded-lg bg-navy-900 hover:bg-navy-800 disabled:opacity-60 text-white text-xs font-medium px-4 py-2.5 transition-colors shadow-soft"
          >
            {pwLoading ? "Updating…" : "Update Password"}
          </button>
        </form>
      </div>

      {/* Vault Telemetry & Statistics */}
      <div className="bg-white border border-ink-100 rounded-xl2 shadow-soft p-6 space-y-5">
        <h2 className="text-base font-semibold text-navy-950 flex items-center gap-2">
          <span>📊</span> Vault Storage & Indexing Telemetry
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-ink-50/60 border border-ink-100 rounded-xl p-4">
            <span className="text-xs text-ink-500 block">Total Documents</span>
            <span className="text-2xl font-bold text-navy-950 mt-1 block">{stats.documentCount}</span>
          </div>
          <div className="bg-ink-50/60 border border-ink-100 rounded-xl p-4">
            <span className="text-xs text-ink-500 block">Document Versions</span>
            <span className="text-2xl font-bold text-navy-950 mt-1 block">{stats.versionCount}</span>
          </div>
          <div className="bg-ink-50/60 border border-ink-100 rounded-xl p-4">
            <span className="text-xs text-ink-500 block">RAG Chunks Indexed</span>
            <span className="text-2xl font-bold text-teal-700 mt-1 block">{stats.chunkCount}</span>
          </div>
          <div className="bg-ink-50/60 border border-ink-100 rounded-xl p-4">
            <span className="text-xs text-ink-500 block">Storage Used</span>
            <span className="text-2xl font-bold text-navy-950 mt-1 block">{formatSize(stats.totalSizeBytes)}</span>
          </div>
        </div>
      </div>

      {/* Privacy & Isolation Verification */}
      <div className="bg-teal-50/50 border border-teal-100 rounded-xl2 p-6 flex items-start gap-4">
        <div className="text-2xl text-teal-600">🛡️</div>
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-navy-950">Security & Isolation Guarantee</h3>
          <p className="text-xs text-ink-600 leading-relaxed">
            Every file upload, document version, and chunk index in this vault is strictly tied to your authenticated user identifier (<code className="bg-white px-1 py-0.5 rounded text-navy-950 border border-teal-200">{user.id}</code>). All database queries and AI assistant retrievals enforce query-level tenancy isolation.
          </p>
        </div>
      </div>
    </div>
  );
}
