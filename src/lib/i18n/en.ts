// English strings for the highest-traffic surfaces. Adding Arabic later is
// a matter of writing `ar.ts` with the same keys and switching `dir` to
// "rtl" in the root layout based on a locale cookie/segment — no component
// changes required, since components only ever call `t()`.
const en = {
  nav: {
    home: "Home",
    projects: "Projects",
    myProject: "My Project",
    payments: "Payments",
    notifications: "Notifications",
    profile: "Profile",
    login: "Log in",
    signup: "Get started",
    logout: "Log out",
  },
  landing: {
    heroTitle: "Your path to owning a home.",
    heroSubtitle:
      "Tell us what you need, what you can afford, and where you want to live. Cascade matches you with real estate development opportunities designed around your plan.",
    ctaPrimary: "Build My Property Plan",
    ctaSecondary: "Explore Projects",
  },
} as const;

export default en;
export type Dictionary = typeof en;
