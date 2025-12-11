import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // CORS handling for /api/track (public pixel endpoint)
  if (pathname.startsWith('/api/track')) {
    // Handle preflight OPTIONS request
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      })
    }
    
    const response = NextResponse.next()
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
    return response
  }

  // Auth redirects (template's original logic)
  if (pathname === '/login') {
    return NextResponse.redirect(new URL('/auth/sign-in', request.url))
  }
  
  if (pathname === '/register') {
    return NextResponse.redirect(new URL('/auth/sign-up', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Match API routes (for CORS)
    '/api/:path*',
    // Match auth redirects
    '/login',
    '/register',
  ],
}