import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";
import crypto from "crypto";

const APP_URL = process.env.AUTH_URL ?? "https://www.photosevents.com";
const EXPIRY_MS = 60 * 60 * 1000; // 1 hour

export async function POST(req: NextRequest): Promise<NextResponse> {
  const { email } = await req.json().catch(() => ({}));
  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const user = await (db as any).user.findUnique({
    where: { email: email.toLowerCase().trim() },
    select: { id: true, email: true, password: true, locale: true },
  });

  // Always return success to avoid leaking whether an account exists
  if (!user || !user.password) {
    return NextResponse.json({ success: true });
  }

  // Delete any existing reset tokens for this email
  await (db as any).passwordResetToken.deleteMany({ where: { email: user.email } });

  const token = crypto.randomBytes(32).toString("hex");
  await (db as any).passwordResetToken.create({
    data: {
      email: user.email,
      token,
      expires: new Date(Date.now() + EXPIRY_MS),
    },
  });

  const resetUrl = `${APP_URL}/auth/reset-password?token=${token}`;
  await sendPasswordResetEmail({ to: user.email, resetUrl, locale: user.locale ?? "en" });

  return NextResponse.json({ success: true });
}
