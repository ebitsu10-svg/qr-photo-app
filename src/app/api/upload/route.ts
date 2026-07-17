import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { uploadToR2 } from "@/lib/r2";
import { processImage, isAcceptedImageType } from "@/lib/image";
import { headers } from "next/headers";

const MAX_FILES_PER_REQUEST = 10;

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // ── Rate limiting (active when KV / Upstash env vars are present) ──────
    if (
      process.env.KV_REST_API_URL ||
      process.env.UPSTASH_REDIS_REST_URL
    ) {
      const { uploadRatelimit } = await import("@/lib/redis");
      const headerStore = await headers();
      const ip =
        headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
      const { success } = await uploadRatelimit.limit(ip);
      if (!success) {
        return NextResponse.json(
          { error: "Too many uploads. Please wait a few minutes." },
          { status: 429 }
        );
      }
    }

    // ── Parse multipart form data ────────────────────────────────────────────
    let formData: FormData;
    try {
      formData = await req.formData();
    } catch {
      return NextResponse.json(
        { error: "Invalid form data." },
        { status: 400 }
      );
    }

    const slug = formData.get("slug") as string | null;
    if (!slug) {
      return NextResponse.json(
        { error: "Missing event slug." },
        { status: 400 }
      );
    }

    // ── Validate event + plan limits ─────────────────────────────────────────
    const event = await (db as any).event.findUnique({
      where: { slug },
      include: {
        owner: { select: { id: true, plan: true, photoLimit: true, email: true, locale: true } },
        _count: { select: { photos: true } },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found." }, { status: 404 });
    }
    if (!event.active) {
      return NextResponse.json(
        { error: "This event is no longer accepting uploads." },
        { status: 403 }
      );
    }

    const { PLAN_LIMITS } = await import("@/lib/stripe");
    const plan = (event.owner?.plan ?? "free") as "free" | "pro";

    if (plan === "free") {
      // Free plan: max 50 photos per event
      const maxPhotos = PLAN_LIMITS.free.maxPhotosPerEvent;
      if (event._count.photos >= maxPhotos) {
        return NextResponse.json(
          { error: `This event has reached its ${maxPhotos}-photo limit. The organizer needs to upgrade to Pro.` },
          { status: 403 }
        );
      }
    } else if (event.owner?.photoLimit != null) {
      // Pro plan with a total photo cap — count across all events
      const totalPhotos = await (db as any).photo.count({
        where: { event: { ownerId: event.owner.id } },
      });
      if (totalPhotos >= event.owner.photoLimit) {
        return NextResponse.json(
          { error: `This account has reached its ${event.owner.photoLimit}-photo storage limit.` },
          { status: 403 }
        );
      }
    }
    // Pro plan with photoLimit = null → unlimited, no check needed

    // ── Collect files ────────────────────────────────────────────────────────
    const files = formData.getAll("files") as File[];
    if (!files.length) {
      return NextResponse.json({ error: "No files provided." }, { status: 400 });
    }
    if (files.length > MAX_FILES_PER_REQUEST) {
      return NextResponse.json(
        { error: `Maximum ${MAX_FILES_PER_REQUEST} files per upload.` },
        { status: 400 }
      );
    }

    // ── Process & upload each file ───────────────────────────────────────────
    const results: { filename: string; url: string }[] = [];
    const errors: { filename: string; error: string }[] = [];

    for (const file of files) {
      if (!isAcceptedImageType(file.type)) {
        errors.push({
          filename: file.name,
          error: "Unsupported file type. Please upload JPEG, PNG, WebP, or HEIC.",
        });
        continue;
      }

      try {
        const raw = Buffer.from(await file.arrayBuffer());
        const { buffer, contentType, sizeBytes } = await processImage(raw);

        const timestamp = Date.now();
        const safeName = file.name.replace(/[^a-z0-9._-]/gi, "_");
        const r2Key = `events/${event.id}/${timestamp}-${safeName.replace(/\.[^.]+$/, "")}.jpg`;

        const publicUrl = await uploadToR2({ key: r2Key, body: buffer, contentType });

        await (db as any).photo.create({
          data: {
            eventId: event.id,
            r2Key,
            filename: file.name,
            sizeBytes,
            mimeType: contentType,
          },
        });

        results.push({ filename: file.name, url: publicUrl });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Upload failed.";
        errors.push({ filename: file.name, error: msg });
      }
    }

    // ── Email notification (fire-and-forget — don't block the response) ──────
    if (results.length > 0 && event.owner?.email) {
      const newTotal = event._count.photos + results.length;
      void import("@/lib/email").then(({ sendNewPhotoNotification }) =>
        sendNewPhotoNotification({
          to: event.owner.email,
          locale: event.owner.locale === "es" ? "es" : "en",
          eventName: event.name,
          eventSlug: slug,
          newCount: results.length,
          totalCount: newTotal,
        }).catch((err) => console.error("[upload] email notification failed", err))
      );
    }

    return NextResponse.json({ results, errors }, { status: 200 });
  } catch (err) {
    console.error("[upload]", err);
    return NextResponse.json(
      { error: "Unexpected server error." },
      { status: 500 }
    );
  }
}
