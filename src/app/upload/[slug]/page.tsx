import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { UploadForm } from "./_components/UploadForm";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = await (db as any).event.findUnique({
    where: { slug },
    select: { name: true },
  });
  return {
    title: event ? `Upload photos — ${event.name}` : "Upload photos",
  };
}

export default async function UploadPage({ params }: Props) {
  const { slug } = await params;

  const event = await (db as any).event.findUnique({
    where: { slug },
    select: { id: true, name: true, active: true },
  });

  if (!event) notFound();

  // Increment scan count (fire-and-forget, don't block render)
  void (db as any).event.update({
    where: { slug },
    data: { scanCount: { increment: 1 } },
  });

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-4 py-12 dark:bg-black">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <span className="text-5xl">📸</span>
          <h1 className="text-2xl font-bold text-black dark:text-white">
            {event.name}
          </h1>
          {event.active ? (
            <p className="text-sm text-zinc-500">
              Upload your photos from the event — no account needed.
            </p>
          ) : (
            <p className="text-sm text-red-500">
              This event is no longer accepting uploads.
            </p>
          )}
        </div>

        {/* Upload form — only if active */}
        {event.active ? (
          <UploadForm slug={slug} eventName={event.name} />
        ) : (
          <div className="rounded-xl border border-dashed border-zinc-300 px-8 py-12 text-center dark:border-zinc-700">
            <p className="text-sm text-zinc-400">
              The organizer has closed this event.
            </p>
          </div>
        )}

        <p className="text-center text-xs text-zinc-400">
          Powered by QR Photo Upload
        </p>
      </div>
    </main>
  );
}
