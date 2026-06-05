import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

// Middleware uses only the edge-safe config (no Prisma/Node.js modules)
export default NextAuth(authConfig).auth;

export const config = {
  matcher: ["/dashboard/:path*"],
};
