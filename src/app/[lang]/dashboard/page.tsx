import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, isLocale } from "../dictionaries";
import { ManageSubscriptionButton } from "@/components/ManageSubscriptionButton";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "My Events" };

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const session = await auth();
  const userId = (session!.user as { id: string }).id;
  const dict = await getDictionary(lang);
  const d = dict.dashboard;

  const [events, user] = await Promise.all([
    (db as any).event.findMany({
      where: { ownerId: userId },
      include: { _count: { select: { photos: true } } },
      orderBy: { createdAt: "desc" },
    }),
    (db as any).user.findUnique({ where: { id: userId }, select: { plan: true } }),
  ]);

  const isPro = user?.plan === "pro";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-black dark:text-white">{d.title}</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-sm text-zinc-500">
              {events.length === 0
                ? d.noEventsDesc
                : `${events.length} ${events.length === 1 ? d.event : d.events}`}
            </p>
            {isPro ? (
              <>
                <span className="rounded-full bg-black px-2 py-0.5 text-xs font-semibold text-white dark:bg-white dark:text-black">Pro</span>
                <ManageSubscriptionButton
                  label={d.manageSubscription}
                  loadingLabel={d.redirecting}
                  returnPath={`/${lang}/dashboard`}
                />
              </>
            ) : (
              <Link href={`/${lang}/dashboard/upgrade`}
                className="rounded-full border border-amber-400 px-2 py-0.5 text-xs font-semibold text-amber-600 hover:bg-amber-50 transition-colors dark:text-amber-400">
                {d.upgradeLabel}
              </Link>
            )}
          </div>
        </div>
        <Link
          href={`/${lang}/dashboard/events/new`}
          className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 transition-colors dark:bg-white dark:text-black dark:hover:bg-zinc-100"
        >
          {d.newEvent}
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-white px-8 py-16 text-center dark:border-zinc-700 dark:bg-zinc-900">
          <span className="text-5xl">🎉</span>
          <h2 className="mt-4 text-lg font-semibold text-black dark:text-white">{d.noEventsTitle}</h2>
          <p className="mt-1 text-sm text-zinc-500">{d.noEventsDesc}</p>
          <Link
            href={`/${lang}/dashboard/events/new`}
            className="mt-6 inline-block rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 transition-colors dark:bg-white dark:text-black"
          >
            {d.createFirstEvent}
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {events.map((event: any) => (
            <Link
              key={event.id}
              href={`/${lang}/dashboard/events/${event.slug}`}
              className="group rounded-xl border border-zinc-200 bg-white p-5 hover:border-zinc-400 hover:shadow-sm transition-all dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-600"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1 min-w-0">
                  <h2 className="font-semibold text-black dark:text-white truncate group-hover:underline">
                    {event.name}
                  </h2>
                  <p className="text-xs text-zinc-400">/{event.slug}</p>
                </div>
                <span className={`ml-3 shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                  event.active
                    ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-400"
                    : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800"
                }`}>
                  {event.active ? d.active : d.inactive}
                </span>
              </div>
              <div className="mt-4 flex items-center gap-4 text-sm text-zinc-500">
                <span>📷 {event._count.photos} {event._count.photos === 1 ? d.photo : d.photos}</span>
                <span>🔍 {event.scanCount} {event.scanCount === 1 ? d.scan : d.scans}</span>
                <span className="ml-auto text-xs">
                  {new Date(event.createdAt).toLocaleDateString(lang === "es" ? "es-MX" : "en-US")}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
