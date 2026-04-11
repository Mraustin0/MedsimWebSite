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

    const role = (token as any)?.role

    // After login, redirect based on role
    if (url.pathname === "/login" && token) {
      const dest = role === 'INSTRUCTOR' ? '/instructor' : '/dashboard'
      return NextResponse.redirect(new URL(dest, req.url))
    }

    // Redirect instructors away from student dashboard to instructor page
    if (url.pathname === "/dashboard" && role === 'INSTRUCTOR') {
      return NextResponse.redirect(new URL("/instructor", req.url))
    }

    // Prevent students from accessing instructor page
    if (url.pathname.startsWith("/instructor") && role !== 'INSTRUCTOR') {
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
    "/instructor/profile",
    "/instructor/:path*",
    "/instructor",
    "/session/:path*",
    "/session",
    "/login",
  ],
}