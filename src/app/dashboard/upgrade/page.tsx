"use client";

import { useState } from "react";
import type { Metadata } from "next";

// Can't export metadata from a Client Component — handled via layout title template

export default function UpgradePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUpgrade = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-black dark:text-white">Upgrade to Pro</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Unlock unlimited events and photos for your account.
        </p>
      </div>

      {/* Plan comparison */}
      <div className="grid grid-cols-2 gap-4">
        {/* Free */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm font-semibold text-zinc-500">Free</p>
          <p className="mt-1 text-2xl font-bold text-black dark:text-white">$0</p>
          <ul className="mt-4 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
            <li>✓ 1 event</li>
            <li>✓ 50 photos per event</li>
            <li>✓ QR code generation</li>
            <li className="text-zinc-400">✗ Unlimited events</li>
          </ul>
        </div>

        {/* Pro */}
        <div className="rounded-xl border-2 border-black bg-white p-5 dark:border-white dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Pro</p>
            <span className="rounded-full bg-black px-2 py-0.5 text-xs font-semibold text-white dark:bg-white dark:text-black">
              Popular
            </span>
          </div>
          <p className="mt-1 text-2xl font-bold text-black dark:text-white">
            $9.99<span className="text-sm font-normal text-zinc-500">/mo</span>
          </p>
          <ul className="mt-4 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
            <li>✓ Unlimited events</li>
            <li>✓ Unlimited photos</li>
            <li>✓ QR code generation</li>
            <li>✓ Priority support</li>
          </ul>
        </div>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
          {error}
        </p>
      )}

      <button
        onClick={handleUpgrade}
        disabled={loading}
        className="w-full rounded-xl bg-black py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-zinc-100"
      >
        {loading ? "Redirecting to Stripe…" : "Upgrade to Pro — $9.99/month →"}
      </button>

      <p className="text-center text-xs text-zinc-400">
        Secure payment via Stripe. Cancel anytime from your Stripe billing portal.
      </p>
    </div>
  );
}
