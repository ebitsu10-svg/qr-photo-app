import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { getDictionary, isLocale } from "../../dictionaries";
import { UploadForm } from "./_components/UploadForm";
import type { Metadata } from "next";

type Params = Promise<{ lang: string; slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang, slug } = await params;
  const event = await (db as any).event.findUnique({
    where: { slug },
    select: { name: true },
  });
  const label = lang === "es" ? "Subir fotos" : "Upload photos";
  return { title: event ? `${label} — ${event.name}` : label };
}

const MAX_FILES = 10;

export default async function UploadPage({ params }: { params: Params }) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();

  const event = await (db as any).event.findUnique({
    where: { slug },
    select: { id: true, name: true, active: true },
  });

  if (!event) notFound();

  void (db as any).event.update({
    where: { slug },
    data: { scanCount: { increment: 1 } },
  });

  const dict = await getDictionary(lang);
  const u = dict.upload;

  const formT = {
    tapToChoose: u.tapToChoose,
    formatsHint: u.formatsHint.replace("{max}", String(MAX_FILES)),
    uploadMore: u.uploadMore,
    networkError: u.networkError,
    upload: u.upload,
    photo: u.photo,
    photos: u.photos,
    preparing: u.preparing,
    uploading: u.uploading,
    successSingular: u.successSingular,
    successPlural: u.successPlural,
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-4 py-12 dark:bg-black">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <span className="text-5xl">📸</span>
          <h1 className="text-2xl font-bold text-black dark:text-white">{event.name}</h1>
          {event.active ? (
            <p className="text-sm text-zinc-500">{u.uploadDesc}</p>
          ) : (
            <p className="text-sm text-red-500">{u.closedDesc}</p>
          )}
        </div>

        {event.active ? (
          <UploadForm slug={slug} eventName={event.name} t={formT} />
        ) : (
          <div className="rounded-xl border border-dashed border-zinc-300 px-8 py-12 text-center dark:border-zinc-700">
            <p className="text-sm text-zinc-400">{u.closedOrganizer}</p>
          </div>
        )}

        <p className="text-center text-xs text-zinc-400">{u.poweredBy}</p>
      </div>
    </main>
  );
}
