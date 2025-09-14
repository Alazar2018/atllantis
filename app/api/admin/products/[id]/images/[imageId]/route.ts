import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; imageId: string } }
) {
  try {
    const { id, imageId } = params

    // Forward the request to the backend
    const response = await fetch(`${process.env.BACKEND_URL}/api/products/${id}/images/${imageId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': request.headers.get('Authorization') || ''
      }
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: true, message: data.message || 'Failed to delete image' },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Delete image error:', error)
    return NextResponse.json(
      { error: true, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
