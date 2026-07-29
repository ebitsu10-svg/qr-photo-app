import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, isLocale } from "./dictionaries";

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const d = dict.home;

  return (
    <main className="bg-white dark:bg-black">
      {/* Hero */}
      <section className="flex min-h-[90vh] flex-col items-center justify-center gap-8 px-4 text-center">
        <div className="flex flex-col items-center gap-4">
          <span className="text-5xl">📸</span>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-black dark:text-white">
            {d.heroTitle}
          </h1>
          <p className="max-w-xl text-lg text-zinc-600 dark:text-zinc-400">
            {d.heroSubtitle}
          </p>
        </div>
        <div className="flex gap-4">
          <Link
            href={`/${lang}/auth/signin`}
            className="rounded-lg bg-black px-6 py-3 text-sm font-semibold text-white hover:bg-zinc-800 transition-colors dark:bg-white dark:text-black dark:hover:bg-zinc-100"
          >
            {d.getStarted}
          </Link>
          <Link
            href={`/${lang}/dashboard`}
            className="rounded-lg border border-zinc-300 px-6 py-3 text-sm font-semibold hover:bg-zinc-50 transition-colors dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            {d.dashboard}
          </Link>
        </div>
        <p className="text-xs text-zinc-400">{d.freePlan}</p>
      </section>

      {/* Use cases */}
      <section className="px-4 py-16 border-t border-zinc-100 dark:border-zinc-900">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-black dark:text-white">
            {d.useCasesTitle}
          </h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">{d.useCasesSubtitle}</p>
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {d.eventTypes.map((item) => (
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
            {d.howItWorksTitle}
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3 text-left">
            {d.steps.map((step, i) => (
              <div
                key={step.title}
                className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-sm font-semibold text-white dark:bg-white dark:text-black">
                  {i + 1}
                </span>
                <h3 className="mt-4 font-semibold text-black dark:text-white">{step.title}</h3>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-4 py-16 border-t border-zinc-100 dark:border-zinc-900">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-black dark:text-white">
            {d.pricingTitle}
          </h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">{d.pricingSubtitle}</p>
          <Link
            href={`/${lang}/auth/signin`}
            className="mt-6 inline-block rounded-lg bg-black px-6 py-3 text-sm font-semibold text-white hover:bg-zinc-800 transition-colors dark:bg-white dark:text-black dark:hover:bg-zinc-100"
          >
            {d.pricingCta}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-100 px-4 py-8 dark:border-zinc-900">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-3 text-sm text-zinc-500 sm:flex-row sm:justify-between">
          <p>{d.footerCopyright}</p>
          <div className="flex items-center gap-4">
            <Link href={`/${lang}/terms`} className="hover:text-black dark:hover:text-white transition-colors">
              {d.footerTerms}
            </Link>
            <Link href={`/${lang}/privacy`} className="hover:text-black dark:hover:text-white transition-colors">
              {d.footerPrivacy}
            </Link>
            <a
              href={`mailto:${d.footerContact}`}
              className="hover:text-black dark:hover:text-white transition-colors"
            >
              {d.footerContact}
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
