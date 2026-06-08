"use client";

import { useRef, useState, useCallback } from "react";

type UploadState = "idle" | "uploading" | "done" | "error";

type FileResult = {
  filename: string;
  ok: boolean;
  url?: string;
  error?: string;
};

export function UploadForm({ slug, eventName }: { slug: string; eventName: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<UploadState>("idle");
  const [previews, setPreviews] = useState<{ name: string; url: string }[]>([]);
  const [results, setResults] = useState<FileResult[]>([]);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    const items = Array.from(files).slice(0, 10);
    const urls = items.map((f) => ({ name: f.name, url: URL.createObjectURL(f) }));
    setPreviews(urls);
    setState("idle");
    setResults([]);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleUpload = async () => {
    const files = inputRef.current?.files;
    if (!files || files.length === 0) return;

    setState("uploading");
    setResults([]);

    const formData = new FormData();
    formData.append("slug", slug);
    Array.from(files)
      .slice(0, 10)
      .forEach((f) => formData.append("files", f));

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        setState("error");
        setResults([{ filename: "Upload", ok: false, error: data.error ?? "Upload failed." }]);
        return;
      }

      const combined: FileResult[] = [
        ...(data.results ?? []).map((r: { filename: string; url: string }) => ({
          filename: r.filename,
          ok: true,
          url: r.url,
        })),
        ...(data.errors ?? []).map((e: { filename: string; error: string }) => ({
          filename: e.filename,
          ok: false,
          error: e.error,
        })),
      ];

      setResults(combined);
      setState(combined.some((r) => !r.ok) ? "error" : "done");

      // Clear file input
      if (inputRef.current) inputRef.current.value = "";
      setPreviews([]);
    } catch {
      setState("error");
      setResults([{ filename: "Upload", ok: false, error: "Network error. Please try again." }]);
    }
  };

  return (
    <div className="space-y-5">
      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-colors ${
          dragOver
            ? "border-black bg-zinc-50 dark:border-white dark:bg-zinc-800"
            : "border-zinc-300 hover:border-zinc-400 dark:border-zinc-600 dark:hover:border-zinc-400"
        }`}
      >
        <span className="text-4xl">📷</span>
        <p className="mt-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Tap to choose photos
        </p>
        <p className="mt-1 text-xs text-zinc-400">
          or drag &amp; drop · JPEG, PNG, HEIC · up to 10 photos · 20 MB each
        </p>
        <input
          ref={inputRef}
          type="file"
          name="files"
          accept="image/*"
          multiple
          capture="environment"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* Previews */}
      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {previews.map((p) => (
            <div key={p.url} className="relative aspect-square overflow-hidden rounded-lg bg-zinc-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt={p.name} className="h-full w-full object-cover" />
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      {previews.length > 0 && state !== "done" && (
        <button
          onClick={handleUpload}
          disabled={state === "uploading"}
          className="w-full rounded-xl bg-black py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-zinc-100"
        >
          {state === "uploading"
            ? `Uploading ${previews.length} photo${previews.length !== 1 ? "s" : ""}…`
            : `Upload ${previews.length} photo${previews.length !== 1 ? "s" : ""}`}
        </button>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-2">
          {state === "done" && (
            <div className="rounded-xl bg-green-50 px-4 py-3 text-center dark:bg-green-950">
              <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                ✅ {results.filter((r) => r.ok).length} photo{results.filter((r) => r.ok).length !== 1 ? "s" : ""} uploaded to {eventName}!
              </p>
              <button
                onClick={() => { setState("idle"); setResults([]); }}
                className="mt-2 text-xs text-green-600 underline underline-offset-2 dark:text-green-500"
              >
                Upload more
              </button>
            </div>
          )}
          {results
            .filter((r) => !r.ok)
            .map((r, i) => (
              <div
                key={i}
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400"
              >
                <span className="font-medium">{r.filename}:</span> {r.error}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
