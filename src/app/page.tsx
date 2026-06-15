import Link from "next/link";

const EVENT_TYPES = [
  { emoji: "🎂", label: "Birthday parties" },
  { emoji: "💍", label: "Weddings" },
  { emoji: "🎓", label: "Graduations" },
  { emoji: "👶", label: "Baby showers" },
  { emoji: "🏢", label: "Corporate events" },
  { emoji: "🎉", label: "Reunions" },
  { emoji: "🎄", label: "Holiday parties" },
  { emoji: "✨", label: "Any celebration" },
];

const STEPS = [
  {
    title: "Create your event",
    body: "Give it a name and we'll generate a unique link and QR code instantly.",
  },
  {
    title: "Print or share the QR code",
    body: "Put it on tables, invitations, or a screen — guests just scan with their phone camera.",
  },
  {
    title: "Watch photos roll in",
    body: "Guests upload straight from their phone, no app or account needed. You see everything in your dashboard.",
  },
];

export default function HomePage() {
  return (
    <main className="bg-white dark:bg-black">
      {/* Hero */}
      <section className="flex min-h-[90vh] flex-col items-center justify-center gap-8 px-4 text-center">
        <div className="flex flex-col items-center gap-4">
          <span className="text-5xl">📸</span>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-black dark:text-white">
            One QR code. Every guest&apos;s photos.
          </h1>
          <p className="max-w-xl text-lg text-zinc-600 dark:text-zinc-400">
            PhotosEvents lets every guest at your event — birthday party, wedding,
            graduation, or company party — share their photos with a quick scan.
            No app to download, no account to create.
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
          Free plan · 1 event · 50 photos · Photos stored for 1 year · No credit card required
        </p>
      </section>

      {/* Use cases */}
      <section className="px-4 py-16 border-t border-zinc-100 dark:border-zinc-900">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-black dark:text-white">
            Built for any event
          </h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            If people are taking photos, PhotosEvents helps you collect them all in one place.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {EVENT_TYPES.map((item) => (
              <div
                key={item.label}
                className="flex flex-col items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-6 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <span className="text-3xl">{item.emoji}</span>
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 py-16 border-t border-zinc-100 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-950">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-black dark:text-white">
            How it works
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3 text-left">
            {STEPS.map((step, i) => (
              <div
                key={step.title}
                className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-sm font-semibold text-white dark:bg-white dark:text-black">
                  {i + 1}
                </span>
                <h3 className="mt-4 font-semibold text-black dark:text-white">
                  {step.title}
                </h3>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="px-4 py-16 border-t border-zinc-100 dark:border-zinc-900">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-black dark:text-white">
            Simple pricing
          </h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Start free for your first event. Upgrade to Pro for unlimited events,
            unlimited photos, and a full year of photo storage — from $50/year.
          </p>
          <Link
            href="/auth/signin"
            className="mt-6 inline-block rounded-lg bg-black px-6 py-3 text-sm font-semibold text-white hover:bg-zinc-800 transition-colors dark:bg-white dark:text-black dark:hover:bg-zinc-100"
          >
            Get started free
          </Link>
        </div>
      </section>
    </main>
  );
}
