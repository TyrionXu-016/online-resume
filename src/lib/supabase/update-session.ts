import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/resumes",
  "/templates",
  "/analytics",
  "/settings",
  "/editor",
];

const AUTH_PREFIXES = ["/login", "/register", "/forgot-password"];

function isProtectedPath(pathname: string) {
  return PROTECTED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function isAuthPath(pathname: string) {
  return AUTH_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    return response;
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
        Object.entries(headers).forEach(([headerName, headerValue]) => {
          response.headers.set(headerName, headerValue);
        });
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  const hasUser = Boolean(data?.claims?.sub);
  const { pathname, search } = request.nextUrl;

  if (isProtectedPath(pathname) && !hasUser) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "";
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPath(pathname) && hasUser) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard";
    dashboardUrl.search = "";
    return NextResponse.redirect(dashboardUrl);
  }

  return response;
}
