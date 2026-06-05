import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-4 text-center bg-white dark:bg-black">
      <div className="flex flex-col items-center gap-4">
        <span className="text-5xl">📸</span>
        <h1 className="text-4xl font-bold tracking-tight text-black dark:text-white">
          QR Photo Upload
        </h1>
        <p className="max-w-md text-lg text-zinc-600 dark:text-zinc-400">
          Let guests upload photos at your event by scanning a QR code — no app
          required.
        </p>
      </div>
      <div className="flex gap-4">
        <Link
          href="/auth/signin"
          className="rounded-lg bg-black px-6 py-3 text-sm font-semibold text-white hover:bg-zinc-800 transition-colors dark:bg-white dark:text-black dark:hover:bg-zinc-100"
        >
          Get started free
        </Link>
        <Link
          href="/dashboard"
          className="rounded-lg border border-zinc-300 px-6 py-3 text-sm font-semibold hover:bg-zinc-50 transition-colors dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          Dashboard →
        </Link>
      </div>
      <p className="text-xs text-zinc-400">
        Free plan · 1 event · 50 photos · No credit card required
      </p>
    </main>
  );
}
