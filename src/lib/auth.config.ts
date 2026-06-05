import type { NextAuthConfig } from "next-auth";

/**
 * Edge-compatible auth config — no Prisma, no Node.js modules.
 * Used ONLY by src/middleware.ts which runs on the Vercel Edge runtime.
 */
export const authConfig = {
  providers: [], // providers not evaluated in middleware
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isDashboard = nextUrl.pathname.startsWith("/dashboard");
      if (isDashboard && !isLoggedIn) {
        const url = new URL("/auth/signin", nextUrl.origin);
        url.searchParams.set("callbackUrl", nextUrl.pathname);
        return Response.redirect(url);
      }
      return true;
    },
  },
} satisfies NextAuthConfig;
