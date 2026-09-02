export const ROUTES = {
  home: "/",
  dashboard: "/dashboard",
  auth: {
    login: "/auth/login",
    register: "/auth/register",
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
  ROUTES.auth.login,
  ROUTES.auth.register,
  ROUTES.auth.error,
  ROUTES.auth.reset,
  ROUTES.auth.newPassword,
] as const;

export const DEFAULT_AUTHENTICATED_REDIRECT = ROUTES.dashboard;
export const DEFAULT_UNAUTHENTICATED_REDIRECT = ROUTES.auth.login;

export const API_AUTH_PREFIX = ROUTES.api.authPrefix;
