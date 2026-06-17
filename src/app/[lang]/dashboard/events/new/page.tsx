import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateSlug } from "@/lib/qr";
import { PLAN_LIMITS } from "@/lib/stripe";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getDictionary, isLocale } from "../../../dictionaries";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "New Event" };

export default async function NewEventPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const session = await auth();
  if (!session?.user) redirect(`/${lang}/auth/signin`);
  const userId = (session.user as { id: string }).id;

  const dict = await getDictionary(lang);
  const d = dict.dashboard;

  const user = await (db as any).user.findUnique({
    where: { id: userId },
    select: { plan: true, _count: { select: { events: true } } },
  });

  const plan = (user?.plan ?? "free") as "free" | "pro";
  const maxEvents = PLAN_LIMITS[plan].maxEvents;
  const eventCount = user?._count?.events ?? 0;
  const atLimit = eventCount >= maxEvents;

  if (atLimit) {
    return (
      <div className="max-w-lg space-y-6">
        <h1 className="text-2xl font-bold text-black dark:text-white">{d.createEventTitle}</h1>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-800 dark:bg-amber-950">
          <p className="font-semibold text-amber-800 dark:text-amber-300">{d.limitTitle}</p>
          <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">{d.limitDesc}</p>
          <Link
            href={`/${lang}/dashboard/upgrade`}
            className="mt-4 inline-block rounded-lg bg-black px-5 py-2 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-white dark:text-black"
          >
            {d.upgradeButton}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-black dark:text-white">{d.createEventTitle}</h1>
        <p className="mt-1 text-sm text-zinc-500">{d.createEventSubtitle}</p>
      </div>

      <form
        action={async (formData: FormData) => {
          "use server";
          const session = await auth();
          if (!session?.user) redirect(`/${lang}/auth/signin`);
          const userId = (session.user as { id: string }).id;
          const name = (formData.get("name") as string).trim();
          const locale = (formData.get("locale") as string) || "en";
          if (!name) return;
          const slug = generateSlug(name);
          await (db as any).event.create({ data: { ownerId: userId, name, slug } });
          redirect(`/${locale}/dashboard/events/${slug}`);
        }}
        className="space-y-5 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
      >
        <input type="hidden" name="locale" value={lang} />
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
            {d.eventNameLabel}
          </label>
          <input id="name" name="name" type="text" required maxLength={80}
            placeholder={d.eventNamePlaceholder}
            className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm placeholder-zinc-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-500 dark:focus:border-white"
          />
        </div>
        <div className="flex gap-3">
          <button type="submit"
            className="rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 transition-colors dark:bg-white dark:text-black dark:hover:bg-zinc-100">
            {d.createEventButton}
          </button>
          <Link href={`/${lang}/dashboard`}
            className="rounded-lg border border-zinc-300 px-5 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">
            {d.cancel}
          </Link>
        </div>
      </form>
    </div>
  );
}
