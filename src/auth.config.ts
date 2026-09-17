import type { NextAuthConfig } from "next-auth";
import { NextResponse } from "next/server";

// Edge-safe subset of the auth configuration (no Prisma/bcrypt imports),
// used by middleware.ts for route protection. The full configuration with
// the Credentials provider lives in src/auth.ts and runs in the Node
// runtime (API routes, server components).
export const authConfig: NextAuthConfig = {
  // Deployment hosts (Vercel, containers, this sandbox) front the app behind
  // a proxy/dynamic hostname, so Auth.js can't statically verify the Host
  // header against NEXTAUTH_URL — trust it rather than rejecting every
  // request as an "UntrustedHost" error.
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as string) ?? "CUSTOMER";
      }
      return session;
    },
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isLoggedIn = !!auth?.user;
      const isAdminRoute = pathname.startsWith("/admin");

      const protectedPrefixes = [
        "/onboarding",
        "/profile",
        "/my-project",
        "/payments",
        "/notifications",
        "/reservation",
        "/account",
      ];
      const isProtected = protectedPrefixes.some((p) => pathname.startsWith(p));

      if (isAdminRoute) {
        if (!isLoggedIn) return false;
        if (auth?.user?.role !== "ADMIN") return NextResponse.redirect(new URL("/", request.nextUrl.origin));
        return true;
      }
      if (isProtected) return isLoggedIn;
      return true;
    },
  },
};
