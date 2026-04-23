import { NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  const pathName = request.nextUrl.pathname;

  // Skip middleware for OAuth callback and home page to avoid interfering with auth flow
  if (pathName === "/" || pathName.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  let user: { role?: string } | null = null;

  try {
    const backendUrl =
      process.env.BACKEND_URL || "https://foodhub-backend-v2.onrender.com";

    const sessionRes = await fetch(`${backendUrl}/api/auth/get-session`, {
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    });

    if (sessionRes.ok) {
      const session = await sessionRes.json();
      user = session?.user ?? null;
    } else {
      // Non-200 — pass through, client-side auth will handle it
      return NextResponse.next();
    }
  } catch {
    // Network error — pass through rather than wrongly bounce to /login
    return NextResponse.next();
  }

  const role = (user as { role?: string })?.role ?? "";
  const isAuthenticated = !!user;

  // Not logged in → redirect to login
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Customer trying to access provider routes
  if (role === "CUSTOMER" && pathName.startsWith("/provider")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Customer trying to access admin routes
  if (role === "CUSTOMER" && pathName.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Provider trying to access admin routes
  if (role === "PROVIDER" && pathName.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/provider/dashboard", request.url));
  }

  return NextResponse.next();
}

// /cart intentionally excluded — client-side only, no server data needed
export const config = {
  matcher: [
    "/orders/:path*",
    "/checkout/:path*",
    "/profile/:path*",
    "/provider/:path*",
    "/admin/:path*",
  ],
};
