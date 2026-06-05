import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateSlug } from "@/lib/qr";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "New Event" };

export default async function NewEventPage() {
  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-black dark:text-white">Create event</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Give your event a name. We&apos;ll generate a unique QR code for guests to upload photos.
        </p>
      </div>

      <form
        action={async (formData: FormData) => {
          "use server";
          const session = await auth();
          if (!session?.user) redirect("/auth/signin");

          const userId = (session.user as { id: string }).id;
          const name = (formData.get("name") as string).trim();
          if (!name) return;

          const slug = generateSlug(name);

          await (db as any).event.create({
            data: { ownerId: userId, name, slug },
          });

          redirect(`/dashboard/events/${slug}`);
        }}
        className="space-y-5 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
      >
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
          >
            Event name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            maxLength={80}
            placeholder="e.g. Sarah & Tom's Wedding"
            className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm placeholder-zinc-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-500 dark:focus:border-white"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 transition-colors dark:bg-white dark:text-black dark:hover:bg-zinc-100"
          >
            Create event
          </button>
          <a
            href="/dashboard"
            className="rounded-lg border border-zinc-300 px-5 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Cancel
          </a>
        </div>
      </form>
    </div>
  );
}
