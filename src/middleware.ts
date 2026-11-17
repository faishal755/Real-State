import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "./lib/rateLimit";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Rate Limiting on API routes
  if (pathname.startsWith("/api/")) {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    const isAuthRoute = pathname.startsWith("/api/auth/");
    const isAppointmentRoute = pathname.startsWith("/api/appointments");

    // Differentiated rate limits
    let maxAllowed = 60; // default 60 req/min for general APIs
    let bucket = "api";

    if (isAuthRoute) {
      maxAllowed = 15; // 15 req/min for auth brute-force protection
      bucket = "auth";
    } else if (isAppointmentRoute) {
      maxAllowed = 10; // 10 req/min for appointment booking/status requests
      bucket = "appointments";
    }

    const { isAllowed, resetTime, remaining } = checkRateLimit(
      ip,
      bucket,
      maxAllowed,
      60 * 1000
    );

    if (!isAllowed) {
      const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);
      return new NextResponse(
        JSON.stringify({
          message: "Too many requests. Please slow down and try again later.",
          retryAfterSeconds: retryAfter,
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": retryAfter.toString(),
          },
        }
      );
    }

    const response = NextResponse.next();
    response.headers.set("X-RateLimit-Limit", maxAllowed.toString());
    response.headers.set("X-RateLimit-Remaining", remaining.toString());
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
