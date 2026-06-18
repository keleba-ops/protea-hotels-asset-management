import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isLoginPage = req.nextUrl.pathname === "/login";

  if (!isLoggedIn && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isLoggedIn && isLoginPage) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
});

export const config = {
  // Exclude Next.js internals, auth API, and all static file extensions served from /public
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon\\.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|woff2?|ttf|eot|css|js)$).*)"],
};
