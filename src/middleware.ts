import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const url = req.nextUrl.clone()
    
    console.log(`[MIDDLEWARE] Path: ${url.pathname}, Token Present: ${!!token}`)
    
    if (token) {
      console.log(`[MIDDLEWARE] User Role: ${(token as any).role}`)
    }

    if (url.pathname === "/login" && token) {
      console.log(`[MIDDLEWARE] Authenticated user on login page, redirecting to /dashboard`)
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
    return NextResponse.next()
  },
  {
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname
        if (path === "/login") return true
        
        const isAuth = !!token
        if (!isAuth) {
          console.log(`[MIDDLEWARE] Denied access to ${path} - no token found`)
        }
        return isAuth
      },
    },
  }
)

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/dashboard",
    "/profile/:path*",
    "/profile",
    "/instructor/:path*",
    "/instructor",
    "/session/:path*",
    "/session",
    "/login",
  ],
}