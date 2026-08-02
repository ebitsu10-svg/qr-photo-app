import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, isLocale } from "../dictionaries";
import { AdCtaLink } from "@/components/AdCtaLink";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wedding Guest Photo Sharing — QR Code, No App Required",
  description:
    "Every wedding guest's photos, automatically collected in one place. Guests scan a QR code and upload from their phone — no app, no account.",
};

export default async function WeddingLandingPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const d = dict.weddingLanding;

  const ctaClass =
    "inline-block rounded-lg bg-black px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-100";

  return (
    <main className="bg-white dark:bg-black">
      {/* Hero — single message, single CTA, no nav to wander off to */}
      <section className="flex min-h-[92vh] flex-col items-center justify-center gap-6 px-4 text-center">
        <span className="rounded-full border border-zinc-200 px-3 py-1 text-xs font-semibold text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
          {d.badge}
        </span>
        <span className="text-5xl">💍</span>
        <h1 className="max-w-2xl text-4xl sm:text-5xl font-bold tracking-tight text-black dark:text-white">
          {d.heroTitle}
        </h1>
        <p className="max-w-xl text-lg text-zinc-600 dark:text-zinc-400">
          {d.heroSubtitle}
        </p>
        <AdCtaLink href={`/${lang}/auth/signin`} className={ctaClass}>
          {d.cta}
        </AdCtaLink>
        <p className="text-xs text-zinc-400">{d.trustLine}</p>
      </section>

      {/* Value props */}
      <section className="px-4 py-16 border-t border-zinc-100 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-950">
        <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-3">
          {d.valueProps.map((v) => (
            <div
              key={v.title}
              className="rounded-xl border border-zinc-200 bg-white p-6 text-center dark:border-zinc-800 dark:bg-zinc-900"
            >
              <span className="text-3xl">{v.emoji}</span>
              <h3 className="mt-3 font-semibold text-black dark:text-white">{v.title}</h3>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 py-16 border-t border-zinc-100 dark:border-zinc-900">
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

      {/* Pricing + second (final) CTA */}
      <section className="px-4 py-16 border-t border-zinc-100 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-950">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-black dark:text-white">
            {d.pricingTitle}
          </h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">{d.pricingSubtitle}</p>
          <AdCtaLink href={`/${lang}/auth/signin`} className={`mt-6 ${ctaClass}`}>
            {d.pricingCta}
          </AdCtaLink>
        </div>
      </section>

      {/* Minimal footer — legal only, nothing to click away to */}
      <footer className="border-t border-zinc-100 px-4 py-8 dark:border-zinc-900">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-3 text-sm text-zinc-500 sm:flex-row sm:justify-between">
          <p>{d.footerCopyright}</p>
          <div className="flex items-center gap-4">
            <Link
              href={`/${lang}/terms`}
              className="hover:text-black dark:hover:text-white transition-colors"
            >
              {d.footerTerms}
            </Link>
            <Link
              href={`/${lang}/privacy`}
              className="hover:text-black dark:hover:text-white transition-colors"
            >
              {d.footerPrivacy}
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
