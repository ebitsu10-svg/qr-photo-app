"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      router.push("/auth/signin?reset=1");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-4 bg-white dark:bg-black">
        <div className="w-full max-w-sm space-y-4 text-center">
          <span className="text-4xl">📸</span>
          <p className="text-sm text-zinc-500">This reset link is invalid or has expired.</p>
          <Link href="/auth/forgot-password" className="text-sm text-black underline underline-offset-2 dark:text-white">
            Request a new one
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 bg-white dark:bg-black">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <span className="text-4xl">📸</span>
          <h1 className="text-2xl font-bold tracking-tight text-black dark:text-white">
            Set a new password
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              New password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm placeholder-zinc-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:border-white dark:focus:ring-white"
            />
          </div>
          <div>
            <label htmlFor="confirm" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Confirm password
            </label>
            <input
              id="confirm"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm placeholder-zinc-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:border-white dark:focus:ring-white"
            />
          </div>
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 transition-colors disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-zinc-100"
          >
            {loading ? "Saving…" : "Set new password"}
          </button>
        </form>
      </div>
    </main>
  );
}
