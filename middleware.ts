import { NextRequest, NextResponse } from 'next/server'

// CSRF token generation and validation
function generateCSRFToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

function validateCSRFToken(token: string, sessionToken: string): boolean {
  return token === sessionToken && token.length === 64
}

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const windowMs = 15 * 60 * 1000 // 15 minutes
  const maxRequests = 100

  const current = rateLimitMap.get(ip)
  
  if (!current || now > current.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (current.count >= maxRequests) {
    return false
  }

  current.count++
  return true
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'

  // Rate limiting
  if (!checkRateLimit(ip)) {
    return new NextResponse('Too Many Requests', { status: 429 })
  }

  // Security headers for all responses
  const response = NextResponse.next()

  // Add security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  
  // CSP header
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: http:",
      "font-src 'self'",
      "connect-src 'self' http://localhost:3001 https:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ')
  )

  // CSRF protection for API routes
  if (pathname.startsWith('/api/')) {
    const method = request.method
    
    // Skip CSRF for GET requests, public endpoints, and admin auth endpoints
    if (method === 'GET' || 
        pathname.startsWith('/api/public/') || 
        pathname.startsWith('/api/admin/auth/')) {
      return response
    }

    // Check CSRF token for state-changing operations
    const csrfToken = request.headers.get('x-csrf-token')
    const sessionToken = request.cookies.get('csrf-token')?.value

    if (!csrfToken || !sessionToken || !validateCSRFToken(csrfToken, sessionToken)) {
      return new NextResponse('Invalid CSRF token', { status: 403 })
    }
  }

  // Set CSRF token cookie for new sessions
  if (!request.cookies.get('csrf-token')) {
    const csrfToken = generateCSRFToken()
    response.cookies.set('csrf-token', csrfToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
    })
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
