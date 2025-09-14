import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { refreshToken } = body
    
    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token is required' },
        { status: 400 }
      )
    }

    const response = await fetch(`${BACKEND_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    })

    const data = await response.json()
    
    if (response.ok) {
      return NextResponse.json({
        success: true,
        message: data.message,
        accessToken: data.data.accessToken,
        refreshToken: data.data.refreshToken,
        user: data.data.user
      })
    } else {
      return NextResponse.json(
        { error: data.message || 'Token refresh failed' },
        { status: response.status }
      )
    }
  } catch (error) {
    console.error('Token refresh error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
