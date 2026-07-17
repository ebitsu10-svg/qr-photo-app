import { signIn } from "@/lib/auth";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in",
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string; mode?: string; reset?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;

  if (session?.user) {
    redirect(params.callbackUrl ?? "/dashboard");
  }

  const useMagicLink = params.mode === "magic";

  function errorMessage(error?: string) {
    if (!error) return null;
    if (error === "CredentialsSignin") return "Incorrect email or password.";
    if (error === "EmailSignin") return "Could not send the email. Check your RESEND_API_KEY.";
    return "Something went wrong. Please try again.";
  }

  const errMsg = errorMessage(params.error);
  const resetSuccess = params.reset === "1";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 bg-white dark:bg-black">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo / title */}
        <div className="text-center space-y-2">
          <span className="text-4xl">📸</span>
          <h1 className="text-2xl font-bold tracking-tight text-black dark:text-white">
            Sign in to QR Photo Upload
          </h1>
        </div>

        {/* Success / Error */}
        {resetSuccess && (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400">
            Password updated. You can now sign in with your new password.
          </div>
        )}
        {errMsg && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
            {errMsg}
          </div>
        )}

        {useMagicLink ? (
          <>
            {/* Magic-link form */}
            <form
              action={async (formData: FormData) => {
                "use server";
                const email = formData.get("email") as string;
                await signIn("resend", {
                  email,
                  redirectTo: params.callbackUrl ?? "/dashboard",
                });
              }}
              className="space-y-4"
            >
              <p className="text-sm text-zinc-500 text-center">
                Enter your email — we&apos;ll send you a magic link.
              </p>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
                >
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm placeholder-zinc-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:border-white dark:focus:ring-white"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 transition-colors dark:bg-white dark:text-black dark:hover:bg-zinc-100"
              >
                Send magic link
              </button>
            </form>

            <p className="text-center text-sm text-zinc-500">
              <Link
                href={`/auth/signin${params.callbackUrl ? `?callbackUrl=${encodeURIComponent(params.callbackUrl)}` : ""}`}
                className="text-black underline underline-offset-2 dark:text-white"
              >
                Sign in with password instead
              </Link>
            </p>
          </>
        ) : (
          <>
            {/* Password form */}
            <form
              action={async (formData: FormData) => {
                "use server";
                const email = formData.get("email") as string;
                const password = formData.get("password") as string;
                await signIn("credentials", {
                  email,
                  password,
                  redirectTo: params.callbackUrl ?? "/dashboard",
                });
              }}
              className="space-y-4"
            >
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
                >
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm placeholder-zinc-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:border-white dark:focus:ring-white"
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm placeholder-zinc-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:border-white dark:focus:ring-white"
                />
              </div>
              <div className="flex justify-end">
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-zinc-400 underline underline-offset-2 hover:text-zinc-600 dark:hover:text-zinc-300"
                >
                  Forgot password?
                </Link>
              </div>
              <button
                type="submit"
                className="w-full rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 transition-colors dark:bg-white dark:text-black dark:hover:bg-zinc-100"
              >
                Sign in
              </button>
            </form>

            <div className="space-y-3 text-center text-sm text-zinc-500">
              <p>
                No account?{" "}
                <Link
                  href={`/auth/signup${params.callbackUrl ? `?callbackUrl=${encodeURIComponent(params.callbackUrl)}` : ""}`}
                  className="text-black font-medium underline underline-offset-2 dark:text-white"
                >
                  Create one
                </Link>
              </p>
              <p>
                <Link
                  href={`/auth/signin?mode=magic${params.callbackUrl ? `&callbackUrl=${encodeURIComponent(params.callbackUrl)}` : ""}`}
                  className="text-zinc-400 underline underline-offset-2 hover:text-zinc-600"
                >
                  Use magic link instead
                </Link>
              </p>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
