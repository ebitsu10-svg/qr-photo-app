import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { uploadToR2 } from "@/lib/r2";
import { processImage, isAcceptedImageType } from "@/lib/image";
import { headers } from "next/headers";

const MAX_FILES_PER_REQUEST = 10;

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // ── Rate limiting (optional — skipped if Redis not configured) ──────────
    if (
      process.env.UPSTASH_REDIS_REST_URL &&
      process.env.UPSTASH_REDIS_REST_TOKEN
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

    // ── Validate event ───────────────────────────────────────────────────────
    const event = await (db as any).event.findUnique({
      where: { slug },
      select: { id: true, active: true, name: true },
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

    return NextResponse.json({ results, errors }, { status: 200 });
  } catch (err) {
    console.error("[upload]", err);
    return NextResponse.json(
      { error: "Unexpected server error." },
      { status: 500 }
    );
  }
}
