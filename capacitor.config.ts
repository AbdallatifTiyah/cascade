import type { CapacitorConfig } from "@capacitor/cli";

// This wraps the live Cascade website (https://cascade-tau.vercel.app) in a
// native shell for Android/iOS, rather than bundling a static build — the
// app is server-rendered with auth/cookies/API routes, so "server.url" mode
// (native WebView pointed at the real deployment) is the right fit here.
// Swap server.url once a custom domain is live, and change appId to your
// real reverse-domain identifier before publishing to app stores.
const config: CapacitorConfig = {
  appId: "com.cascade.realestate",
  appName: "Cascade",
  webDir: "public",
  server: {
    url: "https://cascade-tau.vercel.app",
    cleartext: false,
  },
  android: {
    allowMixedContent: false,
  },
};

export default config;
