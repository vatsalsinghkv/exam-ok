import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getUserServer } from "@/lib/auth/server";
import {
  API_AUTH_PREFIX,
  AUTH_ROUTES,
  DEFAULT_AUTHENTICATED_REDIRECT,
  DEFAULT_UNAUTHENTICATED_REDIRECT,
  PUBLIC_ROUTES,
} from "@/lib/constants/routes";

export async function proxy(request: NextRequest) {
  const { nextUrl } = request;

  const isApiAuthRoute = nextUrl.pathname.startsWith(API_AUTH_PREFIX);
  const isPublicRoute = PUBLIC_ROUTES.some((r) => r === nextUrl.pathname);
  const isAuthRoute = AUTH_ROUTES.some((r) => r === nextUrl.pathname);

  if (isPublicRoute || isApiAuthRoute) {
    return NextResponse.next(); // Don't do anything | like redirect
  }

  const user = await getUserServer();
  const isLoggedIn = !!user;
  console.log("isLoggedIn: ", isLoggedIn);

  // Logged-in users shouldn't access sign-in/sign-up pages
  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(
        new URL(DEFAULT_AUTHENTICATED_REDIRECT, nextUrl),
      );
    }

    return NextResponse.next();
  }

  // Protected route + unauthenticated user
  if (!isLoggedIn) {
    return NextResponse.redirect(
      new URL(DEFAULT_UNAUTHENTICATED_REDIRECT, nextUrl),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
