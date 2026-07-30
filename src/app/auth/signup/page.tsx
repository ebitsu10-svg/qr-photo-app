import { signIn, auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create account",
};

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;

  if (session?.user) {
    redirect(params.callbackUrl ?? "/dashboard");
  }

  function errorMessage(error?: string) {
    if (!error) return null;
    if (error === "exists") return "An account with that email already exists. Please sign in.";
    if (error === "mismatch") return "Passwords do not match.";
    if (error === "short") return "Password must be at least 8 characters.";
    if (error === "terms") return "You must agree to the Terms & Conditions to create an account.";
    return "Something went wrong. Please try again.";
  }

  const errMsg = errorMessage(params.error);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 bg-white dark:bg-black">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo / title */}
        <div className="text-center space-y-2">
          <span className="text-4xl">📸</span>
          <h1 className="text-2xl font-bold tracking-tight text-black dark:text-white">
            Create your account
          </h1>
          <p className="text-sm text-zinc-500">
            Start collecting photos at your events.
          </p>
        </div>

        {/* Error */}
        {errMsg && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
            {errMsg}
          </div>
        )}

        {/* Registration form */}
        <form
          action={async (formData: FormData) => {
            "use server";
            const email = (formData.get("email") as string).toLowerCase().trim();
            const password = formData.get("password") as string;
            const confirm = formData.get("confirm") as string;
            const agreeToTerms = formData.get("agreeToTerms") === "on";
            const callbackUrl = (formData.get("callbackUrl") as string) || "/dashboard";

            const base = `/auth/signup${callbackUrl !== "/dashboard" ? `?callbackUrl=${encodeURIComponent(callbackUrl)}&` : "?"}error=`;

            if (!agreeToTerms) redirect(base + "terms");
            if (password.length < 8) redirect(base + "short");
            if (password !== confirm) redirect(base + "mismatch");

            const existing = await (db as any).user.findUnique({ where: { email } });
            if (existing) redirect(base + "exists");

            const hash = await bcrypt.hash(password, 12);
            await (db as any).user.create({
              data: { email, password: hash },
            });

            await signIn("credentials", { email, password, redirectTo: callbackUrl });
          }}
          className="space-y-4"
        >
          <input type="hidden" name="callbackUrl" value={params.callbackUrl ?? "/dashboard"} />

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
              autoComplete="new-password"
              required
              minLength={8}
              placeholder="Min. 8 characters"
              className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm placeholder-zinc-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:border-white dark:focus:ring-white"
            />
          </div>

          <div>
            <label
              htmlFor="confirm"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
            >
              Confirm password
            </label>
            <input
              id="confirm"
              name="confirm"
              type="password"
              autoComplete="new-password"
              required
              placeholder="Repeat your password"
              className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm placeholder-zinc-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:border-white dark:focus:ring-white"
            />
          </div>

          <div className="flex items-start gap-2">
            <input
              id="agreeToTerms"
              name="agreeToTerms"
              type="checkbox"
              required
              className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-black focus:ring-black dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-white"
            />
            <label htmlFor="agreeToTerms" className="text-xs text-zinc-500">
              I agree to the{" "}
              <Link
                href="/terms"
                className="underline underline-offset-2 hover:text-zinc-600 dark:hover:text-zinc-300"
              >
                Terms & Conditions
              </Link>
              .
            </label>
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 transition-colors dark:bg-white dark:text-black dark:hover:bg-zinc-100"
          >
            Create account
          </button>
        </form>

        <p className="text-center text-sm text-zinc-500">
          Already have an account?{" "}
          <Link
            href={`/auth/signin${params.callbackUrl ? `?callbackUrl=${encodeURIComponent(params.callbackUrl)}` : ""}`}
            className="text-black font-medium underline underline-offset-2 dark:text-white"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
