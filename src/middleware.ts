import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;

  const isStatic =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/public") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/robots.txt") ||
    pathname.startsWith("/sitemap.xml") ||
    pathname.startsWith("/site.webmanifest") ||
    pathname.startsWith("/sw.js") ||
    pathname.startsWith("/sw.js.map") ||
    pathname.startsWith("/workbox-") ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|webp|mp4|pdf|webmanifest)$/i);

  if (isStatic) {
    return NextResponse.next();
  }

  const isMaintenanceMode = process.env.MAINTENANCE_MODE === "true";

  if (isMaintenanceMode && pathname !== "/maintenance") {
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Maintenance mode" }, { status: 503 });
    }
    return NextResponse.rewrite(new URL("/maintenance", req.url));
  }

  if (pathname === "/maintenance" && !isMaintenanceMode) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const session = await getToken({ req });

  const payonaireToken = req.cookies.get("payonaire_access_token")?.value;

  const publicRoutes = ["/login", "/welcome", "/unauthorized", "/maintenance"];

  if (publicRoutes.includes(pathname)) {
    // If they already have access, redirect from login/welcome/unauthorized to appropriate home
    if ((pathname === "/login" || pathname === "/unauthorized") && (session || payonaireToken)) {
      if (session) {
        return NextResponse.redirect(new URL("/~/admin", req.url));
      }
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Admin routes require NextAuth session
  if (pathname.startsWith("/~")) {
    if (!session) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // All other pages require NextAuth session OR valid Payonaire token cookie
  if (!session && !payonaireToken) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|static|public|favicon.ico|robots.txt|sitemap.xml|site.webmanifest|sw.js|workbox-).*)"],
};
