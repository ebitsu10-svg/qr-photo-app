import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { deleteFromR2 } from "@/lib/r2";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const RETENTION_MS = 365 * 24 * 60 * 60 * 1000; // 1 year

/**
 * Deletes photos (and their R2 objects) that are older than the 1-year
 * storage retention policy. Triggered by Vercel Cron with CRON_SECRET.
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cutoff = new Date(Date.now() - RETENTION_MS);

  const expiredPhotos = await (db as any).photo.findMany({
    where: { uploadedAt: { lt: cutoff } },
    select: { id: true, r2Key: true },
  });

  let deleted = 0;
  const errors: string[] = [];

  for (const photo of expiredPhotos) {
    try {
      await deleteFromR2(photo.r2Key);
      await (db as any).photo.delete({ where: { id: photo.id } });
      deleted++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      errors.push(`${photo.id}: ${msg}`);
    }
  }

  return NextResponse.json({ checked: expiredPhotos.length, deleted, errors });
}
