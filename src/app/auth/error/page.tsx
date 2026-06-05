import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Auth error" };

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="space-y-4 max-w-sm">
        <span className="text-4xl">⚠️</span>
        <h1 className="text-xl font-semibold">Authentication error</h1>
        <p className="text-sm text-zinc-500">
          {params.error ?? "Something went wrong during sign in."}
        </p>
        <Link
          href="/auth/signin"
          className="inline-block rounded-lg bg-black px-5 py-2 text-sm font-medium text-white hover:bg-zinc-800 transition-colors"
        >
          Try again
        </Link>
      </div>
    </main>
  );
}
