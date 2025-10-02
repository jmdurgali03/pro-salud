import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Define las rutas públicas (sign-in y sign-up)
const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/', // Opcional: si quieres que la landing sea pública
])

export default clerkMiddleware(async (auth, req) => {
  // Solo protege las rutas que NO son públicas
  if (!isPublicRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}