import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)'])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    const { userId } = await auth()

    if (!userId) {
      const loginUrl = new URL('/login', req.url)
      const destination = `${req.nextUrl.pathname}${req.nextUrl.search}`

      if (destination && destination !== '/login') {
        loginUrl.searchParams.set('redirect_url', destination)
      }

      return NextResponse.redirect(loginUrl)
    }
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
