"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Can't export metadata from a Client Component — handled via layout title template

export default function UpgradePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFreeUpgrade = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/upgrade/free", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      router.push("/dashboard?upgraded=true");
      router.refresh();
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

      {/* Limited-time promo banner */}
      <div className="rounded-xl border border-green-300 bg-green-50 px-5 py-4 dark:border-green-700 dark:bg-green-950">
        <p className="text-sm font-semibold text-green-800 dark:text-green-300">
          🎉 Limited-time offer — Pro is free until July 15
        </p>
        <p className="mt-1 text-xs text-green-700 dark:text-green-400">
          No payment required. Activate now to unlock all Pro features at no cost.
        </p>
      </div>

      {/* Plan comparison */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Free */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm font-semibold text-zinc-500">Free</p>
          <p className="mt-1 text-2xl font-bold text-black dark:text-white">$0</p>
          <ul className="mt-4 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
            <li>✓ 1 event</li>
            <li>✓ 50 photos per event</li>
            <li>✓ QR code generation</li>
            <li>✓ Photos stored for 1 year</li>
            <li className="text-zinc-400">✗ Unlimited events</li>
          </ul>
        </div>

        {/* Pro */}
        <div className="flex flex-col rounded-xl border-2 border-black bg-white p-5 dark:border-white dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Pro</p>
            <span className="rounded-full bg-green-500 px-2 py-0.5 text-xs font-semibold text-white">
              Free until Jul 15
            </span>
          </div>
          <p className="mt-1 text-2xl font-bold text-black dark:text-white">
            $0<span className="text-sm font-normal text-zinc-500"> this week</span>
          </p>
          <ul className="mt-4 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
            <li>✓ Unlimited events</li>
            <li>✓ Unlimited photos</li>
            <li>✓ QR code generation</li>
            <li>✓ Photos stored forever</li>
            <li>✓ Priority support</li>
          </ul>
          <button
            onClick={handleFreeUpgrade}
            disabled={loading}
            className="mt-5 w-full rounded-xl bg-black py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-zinc-100"
          >
            {loading ? "Activating…" : "Get Pro Free →"}
          </button>
        </div>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
          {error}
        </p>
      )}

      <p className="text-center text-xs text-zinc-400">
        Photos are automatically deleted 1 year after upload.
      </p>
    </div>
  );
}
