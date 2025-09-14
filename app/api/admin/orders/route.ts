import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001'

export async function GET(request: NextRequest) {
  try {
    console.log('📋 Orders API - Starting request...')
    console.log('📋 Orders API - Authorization header:', request.headers.get('Authorization'))
    
    const response = await fetch(`${BACKEND_URL}/api/orders`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization') || ''
      },
    })

    console.log('📋 Orders API - Backend response status:', response.status)
    console.log('📋 Orders API - Backend response headers:', response.headers)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('📋 Orders API - Backend error:', errorText)
      throw new Error(`Backend responded with ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    console.log('📋 Orders API - Backend data:', data)
    
    // Backend returns { error: false, data: [...], pagination: {...} }
    // Frontend expects { data: [...], pagination: {...} }
    return NextResponse.json({
      data: data.data || [],
      pagination: data.pagination || {},
      error: data.error || false,
      message: data.message || null
    })
  } catch (error) {
    console.error('📋 Orders API - Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders', data: [], pagination: {} },
      { status: 500 }
    )
  }
}
