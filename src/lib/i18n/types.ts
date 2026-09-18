export interface Dictionary {
  nav: {
    home: string;
    projects: string;
    myProject: string;
    payments: string;
    notifications: string;
    profile: string;
    login: string;
    signup: string;
    logout: string;
    howItWorks: string;
    exploreProjects: string;
    financialPlanning: string;
    buildPlan: string;
    admin: {
      badge: string;
      dashboard: string;
      demand: string;
      users: string;
      lands: string;
      projects: string;
      apartments: string;
      matching: string;
      feasibility: string;
      reservations: string;
      payments: string;
      analytics: string;
    };
  };
  landing: {
    heroBadge: string;
    heroTitlePrefix: string;
    heroTitleAccent: string;
    heroSubtitle: string;
    heroCtaPrimary: string;
    heroCtaSecondary: string;
    heroNote: string;
    howItWorks: {
      title: string;
      subtitle: string;
      stepLabel: string;
      steps: { title: string; description: string }[];
    };
    whyCascade: {
      title: string;
      reasons: { title: string; description: string }[];
    };
    featuredProjects: {
      title: string;
      subtitle: string;
      viewAll: string;
    };
    groupDevelopment: {
      title: string;
      subtitle: string;
      stages: string[];
      disclaimer: string;
    };
    financialPlanning: {
      title: string;
      subtitle: string;
      bullet1: string;
      bullet2: string;
      exampleLabel: string;
      rowTotal: string;
      rowInitial: string;
      rowRemaining: string;
      rowDuration: string;
      monthsSuffix: string;
      rowMonthly: string;
      perMonthSuffix: string;
    };
    constructionTransparency: {
      title: string;
      subtitle: string;
      stages: string[];
    };
    finalCta: {
      title: string;
      subtitle: string;
      ctaPrimary: string;
      ctaSecondary: string;
    };
    footer: string;
  };
  auth: {
    loginTitle: string;
    loginSubtitle: string;
    signupTitle: string;
    signupSubtitle: string;
    emailLabel: string;
    passwordLabel: string;
    loginButton: string;
    newToCascade: string;
    buildPlanLink: string;
    demoAccounts: string;
    customerRole: string;
    adminRole: string;
    incorrectCreds: string;
    networkError: string;
    firstName: string;
    lastName: string;
    phoneOptional: string;
    passwordHint: string;
    createAccount: string;
    alreadyHaveAccount: string;
    loginLink: string;
    verifyEmail: string;
    demoModePrefix: string;
    sixDigitCode: string;
    verifyContinue: string;
    verificationFailed: string;
    accountCreatedLoginFailed: string;
    somethingWentWrong: string;
    authShellHeadline: string;
    authShellPoints: string[];
    authShellFooter: string;
  };
  common: {
    languageToggle: string;
  };
}
