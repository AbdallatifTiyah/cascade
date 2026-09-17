import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  matcher: [
    "/admin/:path*",
    "/onboarding/:path*",
    "/profile/:path*",
    "/my-project/:path*",
    "/payments/:path*",
    "/notifications/:path*",
    "/reservation/:path*",
    "/account/:path*",
  ],
};
