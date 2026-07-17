import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const { token, password } = await req.json().catch(() => ({}));

  if (!token || typeof token !== "string") {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }
  if (!password || typeof password !== "string" || password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const record = await (db as any).passwordResetToken.findUnique({ where: { token } });

  if (!record || new Date() > record.expires) {
    return NextResponse.json({ error: "Reset link is invalid or has expired" }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 12);

  await (db as any).user.update({
    where: { email: record.email },
    data: { password: hashed },
  });

  await (db as any).passwordResetToken.delete({ where: { token } });

  return NextResponse.json({ success: true });
}
