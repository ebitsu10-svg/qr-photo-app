import { signIn, auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import Link from "next/link";
import { getDictionary, isLocale } from "../../dictionaries";
import type { Metadata } from "next";

type Params = Promise<{ lang: string }>;
type SearchParams = Promise<{ callbackUrl?: string; error?: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang } = await params;
  return { title: lang === "es" ? "Crear cuenta" : "Create account" };
}

export default async function SignUpPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const session = await auth();
  const sp = await searchParams;
  const dict = await getDictionary(lang);
  const d = dict.auth;

  if (session?.user) redirect(sp.callbackUrl ?? `/${lang}/dashboard`);

  function errorMessage(error?: string) {
    if (!error) return null;
    if (error === "exists") return d.errorExists;
    if (error === "mismatch") return d.errorMismatch;
    if (error === "short") return d.errorShort;
    return d.errorDefault;
  }
  const errMsg = errorMessage(sp.error);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 bg-white dark:bg-black">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <span className="text-4xl">📸</span>
          <h1 className="text-2xl font-bold tracking-tight text-black dark:text-white">
            {d.signUpTitle}
          </h1>
          <p className="text-sm text-zinc-500">{d.signUpSubtitle}</p>
        </div>

        {errMsg && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
            {errMsg}
          </div>
        )}

        <form
          action={async (formData: FormData) => {
            "use server";
            const email = (formData.get("email") as string).toLowerCase().trim();
            const password = formData.get("password") as string;
            const confirm = formData.get("confirm") as string;
            const callbackUrl = (formData.get("callbackUrl") as string) || `/${lang}/dashboard`;
            const locale = (formData.get("locale") as string) || "en";

            const base = `/${locale}/auth/signup?callbackUrl=${encodeURIComponent(callbackUrl)}&error=`;

            if (password.length < 8) redirect(base + "short");
            if (password !== confirm) redirect(base + "mismatch");

            const existing = await (db as any).user.findUnique({ where: { email } });
            if (existing) redirect(base + "exists");

            const hash = await bcrypt.hash(password, 12);
            await (db as any).user.create({ data: { email, password: hash } });

            await signIn("credentials", { email, password, redirectTo: callbackUrl });
          }}
          className="space-y-4"
        >
          <input type="hidden" name="callbackUrl" value={sp.callbackUrl ?? `/${lang}/dashboard`} />
          <input type="hidden" name="locale" value={lang} />

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              {d.emailLabel}
            </label>
            <input id="email" name="email" type="email" autoComplete="email" required
              placeholder={d.emailPlaceholder}
              className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm placeholder-zinc-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:border-white dark:focus:ring-white"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              {d.passwordLabel}
            </label>
            <input id="password" name="password" type="password" autoComplete="new-password" required minLength={8}
              placeholder={d.passwordHint}
              className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm placeholder-zinc-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:border-white dark:focus:ring-white"
            />
          </div>
          <div>
            <label htmlFor="confirm" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              {d.confirmPasswordLabel}
            </label>
            <input id="confirm" name="confirm" type="password" autoComplete="new-password" required
              placeholder={d.confirmPasswordPlaceholder}
              className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm placeholder-zinc-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:border-white dark:focus:ring-white"
            />
          </div>
          <button type="submit"
            className="w-full rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 transition-colors dark:bg-white dark:text-black dark:hover:bg-zinc-100">
            {d.createAccountButton}
          </button>
        </form>

        <p className="text-center text-sm text-zinc-500">
          {d.alreadyHaveAccount}{" "}
          <Link
            href={`/${lang}/auth/signin${sp.callbackUrl ? `?callbackUrl=${encodeURIComponent(sp.callbackUrl)}` : ""}`}
            className="text-black font-medium underline underline-offset-2 dark:text-white"
          >
            {d.signInLink}
          </Link>
        </p>
      </div>
    </main>
  );
}
