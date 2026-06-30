import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// Temporary free upgrade — expires 2026-07-06
const FREE_PROMO_EXPIRES = new Date("2026-07-06T00:00:00Z");

export async function POST(): Promise<NextResponse> {
  if (new Date() > FREE_PROMO_EXPIRES) {
    return NextResponse.json({ error: "Promo has ended" }, { status: 410 });
  }

  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const user = await (db as any).user.findUnique({
    where: { id: userId },
    select: { plan: true },
  });

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (user.plan === "pro") return NextResponse.json({ error: "Already on Pro plan" }, { status: 400 });

  await (db as any).user.update({
    where: { id: userId },
    data: { plan: "pro" },
  });

  return NextResponse.json({ success: true });
}
