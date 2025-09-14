import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const { image_id } = await request.json()

    if (!image_id) {
      return NextResponse.json(
        { error: true, message: 'Image ID is required' },
        { status: 400 }
      )
    }

    // Forward the request to the backend
    const response = await fetch(`${process.env.BACKEND_URL}/api/products/${id}/primary-image`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization') || ''
      },
      body: JSON.stringify({ image_id })
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: true, message: data.message || 'Failed to update primary image' },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Primary image update error:', error)
    return NextResponse.json(
      { error: true, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
