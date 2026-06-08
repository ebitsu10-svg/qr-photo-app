"use client";

import { useRef, useState, useCallback } from "react";

type UploadState = "idle" | "resizing" | "uploading" | "done" | "error";

type FileResult = {
  filename: string;
  ok: boolean;
  url?: string;
  error?: string;
};

const MAX_DIMENSION = 2048;
const JPEG_QUALITY = 0.82;
const MAX_FILES = 10;

/** Resize an image file client-side using Canvas and return a JPEG Blob. */
async function resizeToJpeg(file: File): Promise<{ blob: Blob; name: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve({ blob, name: file.name.replace(/\.[^.]+$/, "") + ".jpg" });
          } else {
            reject(new Error(`Could not process ${file.name}`));
          }
        },
        "image/jpeg",
        JPEG_QUALITY
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`Could not load ${file.name}`));
    };
    img.src = objectUrl;
  });
}

export function UploadForm({ slug, eventName }: { slug: string; eventName: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<UploadState>("idle");
  const [previews, setPreviews] = useState<{ name: string; url: string }[]>([]);
  const [results, setResults] = useState<FileResult[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState("");

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    const items = Array.from(files).slice(0, MAX_FILES);
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

    const fileList = Array.from(files).slice(0, MAX_FILES);
    setState("resizing");
    setResults([]);
    setProgress(`Preparing ${fileList.length} photo${fileList.length !== 1 ? "s" : ""}…`);

    // Resize all images client-side first
    const resized: { blob: Blob; name: string; original: string }[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      setProgress(`Preparing ${i + 1} / ${fileList.length}…`);
      try {
        const { blob, name } = await resizeToJpeg(file);
        resized.push({ blob, name, original: file.name });
      } catch {
        resized.push({ blob: file, name: file.name, original: file.name });
      }
    }

    setState("uploading");
    setProgress(`Uploading ${resized.length} photo${resized.length !== 1 ? "s" : ""}…`);

    const formData = new FormData();
    formData.append("slug", slug);
    resized.forEach(({ blob, name }) => formData.append("files", blob, name));

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });

      let data: {
        results?: { filename: string; url: string }[];
        errors?: { filename: string; error: string }[];
        error?: string;
      };
      try {
        data = await res.json();
      } catch {
        const text = await res.text().catch(() => "");
        setState("error");
        setResults([
          {
            filename: "Upload",
            ok: false,
            error: `Server error (${res.status})${text ? ": " + text.slice(0, 120) : ""}`,
          },
        ]);
        return;
      }

      if (!res.ok) {
        setState("error");
        setResults([{ filename: "Upload", ok: false, error: data.error ?? "Upload failed." }]);
        return;
      }

      const combined: FileResult[] = [
        ...(data.results ?? []).map((r) => ({ filename: r.filename, ok: true, url: r.url })),
        ...(data.errors ?? []).map((e) => ({ filename: e.filename, ok: false, error: e.error })),
      ];

      setResults(combined);
      setState(combined.some((r) => !r.ok) ? "error" : "done");
      if (inputRef.current) inputRef.current.value = "";
      setPreviews([]);
      setProgress("");
    } catch (err) {
      setState("error");
      const msg = err instanceof Error ? err.message : "Network error. Please try again.";
      setResults([{ filename: "Upload", ok: false, error: msg }]);
      setProgress("");
    }
  };

  const isWorking = state === "resizing" || state === "uploading";

  return (
    <div className="space-y-5">
      {/* Drop zone */}
      <div
        onClick={() => !isWorking && inputRef.current?.click()}
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
          JPEG, PNG, HEIC · up to {MAX_FILES} photos
        </p>
        <input
          ref={inputRef}
          type="file"
          name="files"
          accept="image/*"
          multiple
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
          disabled={isWorking}
          className="w-full rounded-xl bg-black py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-zinc-100"
        >
          {isWorking ? progress : `Upload ${previews.length} photo${previews.length !== 1 ? "s" : ""}`}
        </button>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-2">
          {state === "done" && (
            <div className="rounded-xl bg-green-50 px-4 py-3 text-center dark:bg-green-950">
              <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                ✅ {results.filter((r) => r.ok).length} photo
                {results.filter((r) => r.ok).length !== 1 ? "s" : ""} uploaded to {eventName}!
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
