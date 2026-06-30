"use client";

import { useState } from "react";

export default function DownloadButton({ slug }: { slug: string }) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/events/${slug}/download`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error ?? "Download failed.");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${slug}-photos.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium hover:bg-zinc-50 transition-colors disabled:opacity-60 dark:border-zinc-700 dark:hover:bg-zinc-800"
    >
      {loading ? "Zipping…" : "⬇ Download all"}
    </button>
  );
}
