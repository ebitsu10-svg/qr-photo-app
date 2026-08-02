import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const user = await (db as any).user.findUnique({
      where: { id: userId },
      select: { stripeId: true },
    });

    if (!user?.stripeId) {
      return NextResponse.json({ error: "No billing account found" }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const returnPath = typeof body?.returnPath === "string" ? body.returnPath : "/dashboard";
    const origin = req.headers.get("origin") ?? process.env.AUTH_URL ?? "https://www.photosevents.com";

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeId,
      return_url: `${origin}${returnPath}`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (err) {
    console.error("[stripe/portal]", err);
    return NextResponse.json({ error: "Failed to create billing portal session" }, { status: 500 });
  }
}
