"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

// Translations are baked in at build time per locale via useParams.
// The actual strings come from the server page in a real app — here we
// inline them since this is a pure client component.
const DICT = {
  en: {
    title: "Upgrade to Pro",
    subtitle: "Unlock unlimited events and photos for your account.",
    freePlanName: "Free",
    proMonthlyName: "Pro · Monthly",
    proMonthlyBadge: "Popular",
    proAnnualName: "Pro · Annual",
    proAnnualBadge: "Save 58%",
    chooseMonthly: "Choose Monthly →",
    chooseAnnual: "Choose Annual →",
    redirecting: "Redirecting…",
    stripeFooter:
      "Secure payment via Stripe. Cancel anytime from your Stripe billing portal. Photos are automatically deleted 1 year after upload.",
    networkError: "Network error. Please try again.",
    proFeatures: [
      "Unlimited events",
      "Unlimited photos",
      "QR code generation",
      "Photos stored for 1 year",
      "Priority support",
    ],
    freeFeatures: [
      "1 event",
      "50 photos per event",
      "QR code generation",
      "Photos stored for 1 year",
    ],
    freeMissing: ["Unlimited events"],
  },
  es: {
    title: "Actualizar a Pro",
    subtitle: "Desbloquea eventos y fotos ilimitados para tu cuenta.",
    freePlanName: "Gratis",
    proMonthlyName: "Pro · Mensual",
    proMonthlyBadge: "Popular",
    proAnnualName: "Pro · Anual",
    proAnnualBadge: "Ahorra 58%",
    chooseMonthly: "Elegir mensual →",
    chooseAnnual: "Elegir anual →",
    redirecting: "Redirigiendo…",
    stripeFooter:
      "Pago seguro con Stripe. Cancela en cualquier momento desde tu portal de facturación de Stripe. Las fotos se eliminan automáticamente 1 año después de subirse.",
    networkError: "Error de red. Por favor intenta de nuevo.",
    proFeatures: [
      "Eventos ilimitados",
      "Fotos ilimitadas",
      "Generación de código QR",
      "Fotos guardadas 1 año",
      "Soporte prioritario",
    ],
    freeFeatures: [
      "1 evento",
      "50 fotos por evento",
      "Generación de código QR",
      "Fotos guardadas 1 año",
    ],
    freeMissing: ["Eventos ilimitados"],
  },
} as const;

type Locale = keyof typeof DICT;

export default function UpgradePage() {
  const params = useParams<{ lang: string }>();
  const lang = (params.lang in DICT ? params.lang : "en") as Locale;
  const d = DICT[lang];

  const [loading, setLoading] = useState<"month" | "year" | null>(null);
  const [error, setError] = useState("");

  const handleUpgrade = async (interval: "month" | "year") => {
    setLoading(interval);
    setError("");
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interval }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? d.networkError);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError(d.networkError);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="max-w-lg space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-black dark:text-white">{d.title}</h1>
        <p className="mt-1 text-sm text-zinc-500">{d.subtitle}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {/* Free */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm font-semibold text-zinc-500">{d.freePlanName}</p>
          <p className="mt-1 text-2xl font-bold text-black dark:text-white">$0</p>
          <ul className="mt-4 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
            {d.freeFeatures.map((f) => <li key={f}>✓ {f}</li>)}
            {d.freeMissing.map((f) => <li key={f} className="text-zinc-400">✗ {f}</li>)}
          </ul>
        </div>

        {/* Pro Monthly */}
        <div className="flex flex-col rounded-xl border-2 border-black bg-white p-5 dark:border-white dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">{d.proMonthlyName}</p>
            <span className="rounded-full bg-black px-2 py-0.5 text-xs font-semibold text-white dark:bg-white dark:text-black">
              {d.proMonthlyBadge}
            </span>
          </div>
          <p className="mt-1 text-2xl font-bold text-black dark:text-white">
            $9.99<span className="text-sm font-normal text-zinc-500">/mo</span>
          </p>
          <ul className="mt-4 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
            {d.proFeatures.map((f) => <li key={f}>✓ {f}</li>)}
          </ul>
          <button onClick={() => handleUpgrade("month")} disabled={loading !== null}
            className="mt-5 w-full rounded-xl bg-black py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-zinc-100">
            {loading === "month" ? d.redirecting : d.chooseMonthly}
          </button>
        </div>

        {/* Pro Annual */}
        <div className="flex flex-col rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">{d.proAnnualName}</p>
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-900 dark:text-green-400">
              {d.proAnnualBadge}
            </span>
          </div>
          <p className="mt-1 text-2xl font-bold text-black dark:text-white">
            $50<span className="text-sm font-normal text-zinc-500">/yr</span>
          </p>
          <ul className="mt-4 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
            {d.proFeatures.map((f) => <li key={f}>✓ {f}</li>)}
          </ul>
          <button onClick={() => handleUpgrade("year")} disabled={loading !== null}
            className="mt-5 w-full rounded-xl border border-black py-2.5 text-sm font-semibold text-black transition-colors hover:bg-zinc-100 disabled:opacity-60 dark:border-white dark:text-white dark:hover:bg-zinc-800">
            {loading === "year" ? d.redirecting : d.chooseAnnual}
          </button>
        </div>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
          {error}
        </p>
      )}

      <p className="text-center text-xs text-zinc-400">{d.stripeFooter}</p>
    </div>
  );
}
