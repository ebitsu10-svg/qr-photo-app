import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateQrDataUrl, buildUploadUrl } from "@/lib/qr";
import { getPublicUrl } from "@/lib/r2";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: slug };
}

export default async function EventPage({ params }: Props) {
  const { slug } = await params;
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const userId = (session.user as { id: string }).id;

  const event = await (db as any).event.findUnique({
    where: { slug },
    include: {
      photos: { orderBy: { uploadedAt: "desc" } },
      _count: { select: { photos: true } },
    },
  });

  if (!event || event.ownerId !== userId) notFound();

  const uploadUrl = buildUploadUrl(slug);
  const qrDataUrl = await generateQrDataUrl(uploadUrl);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-zinc-400 mb-1">
            <Link href="/dashboard" className="hover:text-zinc-600 dark:hover:text-zinc-300">
              Events
            </Link>
            <span>/</span>
            <span>{event.name}</span>
          </div>
          <h1 className="text-2xl font-bold text-black dark:text-white">{event.name}</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            {event._count.photos} photo{event._count.photos !== 1 ? "s" : ""} · {event.scanCount} scan{event.scanCount !== 1 ? "s" : ""}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
            event.active
              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-400"
              : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800"
          }`}
        >
          {event.active ? "Active" : "Inactive"}
        </span>
      </div>

      {/* QR + upload link */}
      <div className="flex flex-col sm:flex-row gap-6 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        {/* QR code */}
        <div className="flex flex-col items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrDataUrl}
            alt={`QR code for ${event.name}`}
            width={160}
            height={160}
            className="rounded-lg border border-zinc-200 dark:border-zinc-700"
          />
          <a
            href={qrDataUrl}
            download={`${slug}-qr.png`}
            className="text-xs text-zinc-500 hover:text-black dark:hover:text-white transition-colors underline underline-offset-2"
          >
            Download QR
          </a>
        </div>

        {/* Upload link info */}
        <div className="flex flex-col justify-center gap-3 min-w-0">
          <div>
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Guest upload link
            </p>
            <p className="text-xs text-zinc-400 mb-2">
              Share this link or QR code with guests — no app required.
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded-md bg-zinc-100 px-3 py-2 text-xs text-zinc-700 break-all dark:bg-zinc-800 dark:text-zinc-300">
                {uploadUrl}
              </code>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Link
              href={`/upload/${slug}`}
              target="_blank"
              className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium hover:bg-zinc-50 transition-colors dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              Preview upload page ↗
            </Link>
          </div>
        </div>
      </div>

      {/* Photo gallery */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-black dark:text-white">
          Photos ({event._count.photos})
        </h2>

        {event.photos.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-300 bg-white px-8 py-12 text-center dark:border-zinc-700 dark:bg-zinc-900">
            <span className="text-4xl">📷</span>
            <p className="mt-3 text-sm text-zinc-500">
              No photos yet. Share the QR code with your guests!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {event.photos.map((photo: any) => (
              <a
                key={photo.id}
                href={getPublicUrl(photo.r2Key)}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative aspect-square overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800"
              >
                <Image
                  src={getPublicUrl(photo.r2Key)}
                  alt={photo.filename}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                />
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
