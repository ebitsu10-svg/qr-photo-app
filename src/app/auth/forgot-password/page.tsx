"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Something went wrong.");
        return;
      }
      setSent(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 bg-white dark:bg-black">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <span className="text-4xl">📸</span>
          <h1 className="text-2xl font-bold tracking-tight text-black dark:text-white">
            Forgot your password?
          </h1>
        </div>

        {sent ? (
          <div className="space-y-4 text-center">
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400">
              If an account exists for <strong>{email}</strong>, we&apos;ve sent a reset link. Check your inbox.
            </div>
            <Link href="/auth/signin" className="text-sm text-zinc-500 underline underline-offset-2 hover:text-black dark:hover:text-white">
              Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm text-zinc-500 text-center">
                Enter your email and we&apos;ll send you a link to reset your password.
              </p>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
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
                {loading ? "Sending…" : "Send reset link"}
              </button>
            </form>
            <p className="text-center text-sm text-zinc-500">
              <Link href="/auth/signin" className="text-black underline underline-offset-2 dark:text-white">
                Back to sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </main>
  );
}
