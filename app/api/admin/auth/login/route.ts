import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001'

// Input validation
function validateLoginInput(body: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!body || typeof body !== 'object') {
    errors.push('Invalid request body')
    return { isValid: false, errors }
  }

  if (!body.username || typeof body.username !== 'string') {
    errors.push('Username is required')
  } else if (body.username.length < 3 || body.username.length > 50) {
    errors.push('Username must be between 3 and 50 characters')
  } else if (!/^[a-zA-Z0-9_]+$/.test(body.username)) {
    errors.push('Username can only contain letters, numbers, and underscores')
  }

  if (!body.password || typeof body.password !== 'string') {
    errors.push('Password is required')
  } else if (body.password.length < 6) {
    errors.push('Password must be at least 6 characters')
  } else if (body.password.length > 128) {
    errors.push('Password is too long')
  }

  return { isValid: errors.length === 0, errors }
}

// Rate limiting
const loginAttempts = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const windowMs = 15 * 60 * 1000 // 15 minutes
  const maxAttempts = 5

  const current = loginAttempts.get(ip)
  
  if (!current || now > current.resetTime) {
    loginAttempts.set(ip, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (current.count >= maxAttempts) {
    return false
  }

  current.count++
  return true
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    
    // Rate limiting - DISABLED for development
    // if (!checkRateLimit(ip)) {
    //   return NextResponse.json(
    //     { error: 'Too many login attempts. Please try again later.' },
    //     { status: 429 }
    //   )
    // }

    const body = await request.json()
    
    // Input validation
    const validation = validateLoginInput(body)
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.errors.join(', ') },
        { status: 400 }
      )
    }

    // Sanitize input
    const sanitizedBody = {
      username: body.username.trim().toLowerCase(),
      password: body.password
    }
    
    const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Forwarded-For': ip,
      },
      body: JSON.stringify(sanitizedBody),
    })

    const data = await response.json()
    
    if (response.ok) {
      // Transform the response to match frontend expectations
      return NextResponse.json({
        success: true,
        message: data.message,
        accessToken: data.data.accessToken,
        refreshToken: data.data.refreshToken,
        user: data.data.user
      })
    } else {
      return NextResponse.json(
        { error: data.message || 'Login failed' },
        { status: response.status }
      )
    }
  } catch (error) {
    // Don't expose internal error details
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
