"use client";

import { useState } from "react";

export function ManageSubscriptionButton({
  label,
  loadingLabel,
  returnPath,
}: {
  label: string;
  loadingLabel: string;
  returnPath: string;
}) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ returnPath }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLoading(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="rounded-full border border-zinc-300 px-2 py-0.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 transition-colors disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
    >
      {loading ? loadingLabel : label}
    </button>
  );
}
