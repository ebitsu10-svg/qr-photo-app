import { signIn, auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getDictionary, isLocale } from "../../dictionaries";
import type { Metadata } from "next";

type Params = Promise<{ lang: string }>;
type SearchParams = Promise<{ callbackUrl?: string; error?: string; mode?: string; reset?: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang } = await params;
  return { title: lang === "es" ? "Iniciar sesión" : "Sign in" };
}

export default async function SignInPage({
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

  const useMagicLink = sp.mode === "magic";

  function errorMessage(error?: string) {
    if (!error) return null;
    if (error === "CredentialsSignin") return d.errorCredentials;
    if (error === "EmailSignin") return d.errorEmail;
    return d.errorDefault;
  }
  const errMsg = errorMessage(sp.error);
  const resetSuccess = sp.reset === "1";

  const callbackQuery = sp.callbackUrl
    ? `?callbackUrl=${encodeURIComponent(sp.callbackUrl)}`
    : "";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 bg-white dark:bg-black">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <span className="text-4xl">📸</span>
          <h1 className="text-2xl font-bold tracking-tight text-black dark:text-white">
            {d.signInTitle}
          </h1>
        </div>

        {resetSuccess && (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400">
            {d.resetSuccess}
          </div>
        )}
        {errMsg && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
            {errMsg}
          </div>
        )}

        {useMagicLink ? (
          <>
            <form
              action={async (formData: FormData) => {
                "use server";
                const email = formData.get("email") as string;
                const cb = (formData.get("callbackUrl") as string) || `/${lang}/dashboard`;
                await signIn("resend", { email, redirectTo: cb });
              }}
              className="space-y-4"
            >
              <input type="hidden" name="callbackUrl" value={sp.callbackUrl ?? `/${lang}/dashboard`} />
              <p className="text-sm text-zinc-500 text-center">{d.magicLinkHint}</p>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  {d.emailLabel}
                </label>
                <input id="email" name="email" type="email" autoComplete="email" required
                  placeholder={d.emailPlaceholder}
                  className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm placeholder-zinc-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:border-white dark:focus:ring-white"
                />
              </div>
              <button type="submit"
                className="w-full rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 transition-colors dark:bg-white dark:text-black dark:hover:bg-zinc-100">
                {d.sendMagicLink}
              </button>
            </form>
            <p className="text-center text-sm text-zinc-500">
              <Link href={`/${lang}/auth/signin${callbackQuery}`}
                className="text-black underline underline-offset-2 dark:text-white">
                {d.usePassword}
              </Link>
            </p>
          </>
        ) : (
          <>
            <form
              action={async (formData: FormData) => {
                "use server";
                const email = formData.get("email") as string;
                const password = formData.get("password") as string;
                const cb = (formData.get("callbackUrl") as string) || `/${lang}/dashboard`;
                await signIn("credentials", { email, password, redirectTo: cb });
              }}
              className="space-y-4"
            >
              <input type="hidden" name="callbackUrl" value={sp.callbackUrl ?? `/${lang}/dashboard`} />
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
                <input id="password" name="password" type="password" autoComplete="current-password" required
                  placeholder={d.passwordPlaceholder}
                  className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm placeholder-zinc-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:border-white dark:focus:ring-white"
                />
              </div>
              <div className="flex justify-end">
                <Link href={`/${lang}/auth/forgot-password`}
                  className="text-xs text-zinc-400 underline underline-offset-2 hover:text-zinc-600 dark:hover:text-zinc-300">
                  {d.forgotPassword}
                </Link>
              </div>
              <button type="submit"
                className="w-full rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 transition-colors dark:bg-white dark:text-black dark:hover:bg-zinc-100">
                {d.signInButton}
              </button>
            </form>

            <div className="space-y-3 text-center text-sm text-zinc-500">
              <p>
                {d.noAccount}{" "}
                <Link href={`/${lang}/auth/signup${callbackQuery}`}
                  className="text-black font-medium underline underline-offset-2 dark:text-white">
                  {d.createOne}
                </Link>
              </p>
              <p>
                <Link
                  href={`/${lang}/auth/signin?mode=magic${sp.callbackUrl ? `&callbackUrl=${encodeURIComponent(sp.callbackUrl)}` : ""}`}
                  className="text-zinc-400 underline underline-offset-2 hover:text-zinc-600">
                  {d.useMagicLink}
                </Link>
              </p>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
