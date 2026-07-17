import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import type Stripe from "stripe";

// Disable body parsing — Stripe needs the raw body for signature verification
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature or secret" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("[webhook] signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === "subscription" && session.metadata?.userId) {
          await (db as any).user.update({
            where: { id: session.metadata.userId },
            data: { plan: "pro", stripeId: session.customer as string, photoLimit: 1000 },
          });
          console.log(`[webhook] upgraded user ${session.metadata.userId} to pro`);
        }
        break;
      }

      case "customer.subscription.deleted":
      case "customer.subscription.paused": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;
        await (db as any).user.updateMany({
          where: { stripeId: customerId },
          data: { plan: "free" },
        });
        console.log(`[webhook] downgraded customer ${customerId} to free`);
        break;
      }

      case "customer.subscription.resumed":
      case "invoice.payment_succeeded": {
        const obj = event.data.object as Stripe.Invoice | Stripe.Subscription;
        const customerId = "customer" in obj ? obj.customer as string : null;
        if (customerId) {
          await (db as any).user.updateMany({
            where: { stripeId: customerId },
            data: { plan: "pro" },
          });
        }
        break;
      }
    }
  } catch (err) {
    console.error("[webhook] handler error", err);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
