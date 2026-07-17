"use client";

import { useState } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import Link from "next/link";

const COPY = {
  en: {
    title: "Set a new password",
    newPasswordLabel: "New password",
    confirmLabel: "Confirm password",
    placeholder: "At least 8 characters",
    confirmPlaceholder: "••••••••",
    submit: "Set new password",
    saving: "Saving…",
    mismatch: "Passwords do not match.",
    invalid: "This reset link is invalid or has expired.",
    requestNew: "Request a new one",
    networkError: "Network error. Please try again.",
  },
  es: {
    title: "Establece una nueva contraseña",
    newPasswordLabel: "Nueva contraseña",
    confirmLabel: "Confirmar contraseña",
    placeholder: "Al menos 8 caracteres",
    confirmPlaceholder: "••••••••",
    submit: "Establecer nueva contraseña",
    saving: "Guardando…",
    mismatch: "Las contraseñas no coinciden.",
    invalid: "Este enlace de restablecimiento es inválido o ha vencido.",
    requestNew: "Solicitar uno nuevo",
    networkError: "Error de red. Por favor intenta de nuevo.",
  },
} as const;

type Locale = keyof typeof COPY;

export default function ResetPasswordPage() {
  const params = useParams<{ lang: string }>();
  const lang = (params.lang in COPY ? params.lang : "en") as Locale;
  const d = COPY[lang];

  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError(d.mismatch); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data.error ?? d.networkError); return; }
      router.push(`/${lang}/auth/signin?reset=1`);
    } catch {
      setError(d.networkError);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-4 bg-white dark:bg-black">
        <div className="w-full max-w-sm space-y-4 text-center">
          <span className="text-4xl">📸</span>
          <p className="text-sm text-zinc-500">{d.invalid}</p>
          <Link href={`/${lang}/auth/forgot-password`} className="text-sm text-black underline underline-offset-2 dark:text-white">
            {d.requestNew}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 bg-white dark:bg-black">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <span className="text-4xl">📸</span>
          <h1 className="text-2xl font-bold tracking-tight text-black dark:text-white">{d.title}</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              {d.newPasswordLabel}
            </label>
            <input id="password" type="password" autoComplete="new-password" required minLength={8}
              value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder={d.placeholder}
              className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm placeholder-zinc-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:border-white dark:focus:ring-white"
            />
          </div>
          <div>
            <label htmlFor="confirm" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              {d.confirmLabel}
            </label>
            <input id="confirm" type="password" autoComplete="new-password" required minLength={8}
              value={confirm} onChange={(e) => setConfirm(e.target.value)}
              placeholder={d.confirmPlaceholder}
              className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm placeholder-zinc-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:border-white dark:focus:ring-white"
            />
          </div>
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 transition-colors disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-zinc-100">
            {loading ? d.saving : d.submit}
          </button>
        </form>
      </div>
    </main>
  );
}
