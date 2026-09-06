export const ROUTES = {
  home: "/",

  dashboard: {
    home: "/dashboard",
    create: "/dashboard/create",
    library: "/dashboard/library",
    analytics: "/dashboard/analytics",
    settings: "/dashboard/settings",
  },

  auth: {
    signin: "/auth/sign-in",
    signup: "/auth/sign-up",
    error: "/auth/error",
    reset: "/auth/reset",
    newPassword: "/auth/new-password",
    newVerification: "/auth/new-verification",
  },

  api: {
    authPrefix: "/api/auth",
  },
} as const;

export const PUBLIC_ROUTES = [
  ROUTES.home,
  ROUTES.auth.newVerification,
] as const;

export const AUTH_ROUTES = [
  ROUTES.auth.signin,
  ROUTES.auth.signup,
  ROUTES.auth.error,
  ROUTES.auth.reset,
  ROUTES.auth.newPassword,
] as const;

export const DEFAULT_AUTHENTICATED_REDIRECT = ROUTES.dashboard.home;
export const DEFAULT_UNAUTHENTICATED_REDIRECT = ROUTES.auth.signin;

export const API_AUTH_PREFIX = ROUTES.api.authPrefix;
