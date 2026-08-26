export const PUBLIC_ROUTES: string[] = ["/", "/auth/new-verification"];

export const AUTH_ROUTES: string[] = [
  "/auth/login",
  "/auth/register",
  "/auth/error",
  "/auth/reset",
  "/auth/new-password",
];

export const DEFAULT_AUTHENTICATED_REDIRECT = "/dashboard";
export const DEFAULT_UNAUTHENTICATED_REDIRECT = AUTH_ROUTES[0]; // /auth/login

export const API_AUTH_PREFIX = "/api/auth";
