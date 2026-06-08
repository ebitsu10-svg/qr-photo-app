import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

// Proxy (Next.js 16 rename of middleware) — edge-safe, no Prisma/Node.js modules
export default NextAuth(authConfig).auth;

export const config = {
  matcher: ["/dashboard/:path*"],
};
