import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getPublicUrl } from "@/lib/r2";
import { zipSync, strToU8 } from "fflate";

type Props = { params: Promise<{ slug: string }> };

export async function GET(req: NextRequest, { params }: Props): Promise<NextResponse> {
  const { slug } = await params;

  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const event = await (db as any).event.findUnique({
    where: { slug },
    include: { photos: { orderBy: { uploadedAt: "asc" } } },
  });

  if (!event || event.ownerId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (event.photos.length === 0) {
    return NextResponse.json({ error: "No photos to download" }, { status: 400 });
  }

  // Fetch all photos in parallel
  const fetched = await Promise.all(
    event.photos.map(async (photo: any) => {
      const url = getPublicUrl(photo.r2Key);
      const res = await fetch(url);
      if (!res.ok) return null;
      const buf = await res.arrayBuffer();
      return { name: photo.filename, buf: new Uint8Array(buf) };
    })
  );

  // Build zip entries, deduplicate filenames
  const seen = new Map<string, number>();
  const files: Record<string, Uint8Array> = {};
  for (const item of fetched) {
    if (!item) continue;
    let name = item.name;
    const count = seen.get(name) ?? 0;
    if (count > 0) {
      const ext = name.lastIndexOf(".");
      name = ext >= 0
        ? `${name.slice(0, ext)}_${count}${name.slice(ext)}`
        : `${name}_${count}`;
    }
    seen.set(item.name, count + 1);
    files[name] = item.buf;
  }

  const zip = zipSync(files, { level: 0 });

  return new NextResponse(zip, {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${slug}-photos.zip"`,
      "Content-Length": zip.byteLength.toString(),
    },
  });
}
