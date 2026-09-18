import type { Dictionary } from "./types";

const en: Dictionary = {
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
    howItWorks: "How it works",
    exploreProjects: "Explore Projects",
    financialPlanning: "Financial planning",
    buildPlan: "Build My Property Plan",
    admin: {
      badge: "Admin",
      dashboard: "Dashboard",
      demand: "Demand",
      users: "Users",
      lands: "Lands",
      projects: "Projects",
      apartments: "Apartments",
      matching: "Matching",
      feasibility: "Feasibility",
      reservations: "Reservations",
      payments: "Payments",
      analytics: "Analytics",
    },
  },
  landing: {
    heroBadge: "Demand-driven real estate development",
    heroTitlePrefix: "Your path to",
    heroTitleAccent: "owning a home.",
    heroSubtitle:
      "Tell us what you need, what you can afford, and where you want to live. Cascade matches you with real estate development opportunities designed around your plan.",
    heroCtaPrimary: "Build My Property Plan",
    heroCtaSecondary: "Explore Projects",
    heroNote: "Demo accounts available — no commitment required to explore.",
    howItWorks: {
      title: "How Cascade works",
      subtitle: "A different starting point: your demand shapes what gets built, not the other way around.",
      stepLabel: "Step",
      steps: [
        {
          title: "Share your plan",
          description:
            "Tell Cascade where you want to live, what you need, and what you can afford — down payment, monthly budget, and timeline.",
        },
        {
          title: "Get matched",
          description: "Our matching engine scores real development opportunities against your plan and explains exactly why each one fits.",
        },
        {
          title: "Join the project",
          description: "Reserve your apartment within a group development project — participants join together to bring a project to life.",
        },
        {
          title: "Track to handover",
          description: "Follow construction progress and your payment plan from land acquisition through apartment handover.",
        },
      ],
    },
    whyCascade: {
      title: "Why Cascade",
      reasons: [
        {
          title: "Built around your budget",
          description: "Every recommendation is scored against your actual affordability — not a generic listing feed.",
        },
        {
          title: "Transparent, explainable matching",
          description: "See exactly why a project matches: location, budget, size, timeline — no black-box percentages.",
        },
        {
          title: "Real development, real data",
          description: "Projects are shaped by aggregated demand — Cascade only pursues land where the demand already exists.",
        },
        {
          title: "Clarity from day one",
          description: "Estimated vs. confirmed pricing is always labeled clearly. No hidden terms, no surprise numbers.",
        },
      ],
    },
    featuredProjects: {
      title: "Featured projects",
      subtitle: "A sample of active Cascade group-development projects. Sign up to see your personalized match score for each one.",
      viewAll: "View all projects",
    },
    groupDevelopment: {
      title: "How group development works",
      subtitle:
        "A group of participants jointly takes part in a real estate development project — each participant is allocated an apartment as the project moves from land to handover.",
      stages: ["Join the project", "Land acquisition", "Design", "Construction", "Apartment handover"],
      disclaimer:
        "Cascade uses neutral terms like participation and allocation until a formal ownership structure is finalized for a given project — full legal terms are shared before any binding commitment.",
    },
    financialPlanning: {
      title: "Financial planning you can trust",
      subtitle:
        "Every project shows a clear breakdown of initial payment, monthly installments, and duration — calculated the same way, every time, and always labeled as an estimate until a reservation is confirmed.",
      bullet1: "No assumed interest — your remaining balance is simply split across your payment duration.",
      bullet2: "Estimated figures are always distinguished from confirmed, contractual amounts.",
      exampleLabel: "Example — 135 m² apartment",
      rowTotal: "Estimated total price",
      rowInitial: "Initial payment",
      rowRemaining: "Remaining balance",
      rowDuration: "Duration",
      monthsSuffix: "months",
      rowMonthly: "Monthly payment",
      perMonthSuffix: "/mo",
    },
    constructionTransparency: {
      title: "Construction transparency",
      subtitle: "Follow every stage from confirmation to handover. No guessing where your project stands.",
      stages: ["Project confirmed", "Land acquired", "Design approved", "Construction started", "Structure completed", "Finishing", "Handover"],
    },
    finalCta: {
      title: "Ready to see what fits your plan?",
      subtitle: "It takes about two minutes to build your property plan. From there, Cascade does the matching.",
      ctaPrimary: "Build My Property Plan",
      ctaSecondary: "I already have an account",
    },
    footer: "Cascade Real Estate Investment & Development · Demo build",
  },
  auth: {
    loginTitle: "Welcome back",
    loginSubtitle: "Log in to continue your property plan.",
    signupTitle: "Build your property plan",
    signupSubtitle: "Create your account to get matched with real development opportunities.",
    emailLabel: "Email",
    passwordLabel: "Password",
    loginButton: "Log in",
    newToCascade: "New to Cascade?",
    buildPlanLink: "Build my property plan",
    demoAccounts: "Demo accounts",
    customerRole: "Customer",
    adminRole: "Admin",
    incorrectCreds: "Incorrect email or password.",
    networkError: "Network error. Please try again.",
    firstName: "First name",
    lastName: "Last name",
    phoneOptional: "Phone (optional)",
    passwordHint: "At least 8 characters.",
    createAccount: "Create account",
    alreadyHaveAccount: "Already have an account?",
    loginLink: "Log in",
    verifyEmail: "Verify your email",
    demoModePrefix: "Demo mode: no SMS/email provider is connected, so your code is shown here instead of being sent. Your verification code is",
    sixDigitCode: "6-digit code",
    verifyContinue: "Verify & continue",
    verificationFailed: "Verification failed",
    accountCreatedLoginFailed: "Account created, but automatic sign-in failed. Please log in.",
    somethingWentWrong: "Something went wrong. Please try again.",
    authShellHeadline: "Real estate development, shaped by real demand.",
    authShellPoints: [
      "Matched against your real budget and timeline",
      "Explainable match scores — never a black box",
      "Track construction and payments in one place",
    ],
    authShellFooter: "Cascade Real Estate Investment & Development",
  },
  common: {
    languageToggle: "العربية",
  },
};

export default en;
export type { Dictionary } from "./types";
