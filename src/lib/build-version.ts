// A stable identifier for "what's currently deployed", used to detect when
// a newer build has gone live while a client (browser tab or the mobile
// app's persistent WebView) is still sitting on an older one. Vercel sets
// these automatically at build/runtime — no config needed. Falls back to a
// per-process random id locally, so the dev server still round-trips
// correctly even without a real deployment.
export const BUILD_VERSION =
  process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.VERCEL_DEPLOYMENT_ID ?? `dev-${process.pid}`;
