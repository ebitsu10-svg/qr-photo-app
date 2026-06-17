import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, isLocale } from "../../dictionaries";
import type { Metadata } from "next";

type Params = Promise<{ lang: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang } = await params;
  return { title: lang === "es" ? "Error de autenticación" : "Auth error" };
}

export default async function AuthErrorPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Promise<{ error?: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const sp = await searchParams;
  const dict = await getDictionary(lang);
  const d = dict.auth;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="space-y-4 max-w-sm">
        <span className="text-4xl">⚠️</span>
        <h1 className="text-xl font-semibold">{d.errorTitle}</h1>
        <p className="text-sm text-zinc-500">{sp.error ?? d.errorDefault}</p>
        <Link
          href={`/${lang}/auth/signin`}
          className="inline-block rounded-lg bg-black px-5 py-2 text-sm font-medium text-white hover:bg-zinc-800 transition-colors"
        >
          {d.tryAgain}
        </Link>
      </div>
    </main>
  );
}
