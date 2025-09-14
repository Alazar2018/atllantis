import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if this is an image request
    const imageUrl = request.nextUrl.searchParams.get('image')
    
    if (imageUrl) {
      // This is an image request - proxy the image
      const imageResponse = await fetch(`${BACKEND_URL}${imageUrl}`)
      
      if (!imageResponse.ok) {
        return NextResponse.json({ error: 'Image not found' }, { status: 404 })
      }

      // Get the image data and content type
      const imageBuffer = await imageResponse.arrayBuffer()
      const contentType = imageResponse.headers.get('content-type') || 'image/jpeg'

      // Return the image with proper headers
      return new NextResponse(imageBuffer, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
          'Access-Control-Allow-Origin': '*',
        },
      })
    }

    // This is a product data request
    const response = await fetch(`${BACKEND_URL}/api/products/admin/${params.id}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization') || ''
      },
    })

    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}`)
    }

    const data = await response.json()
    
    // Backend returns { error: false, product: {...} }
    // Frontend expects { data: {...} } or direct product object
    if (data.error === false && data.product) {
      return NextResponse.json({
        data: data.product,
        error: false
      })
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if this is a multipart form data request (for image uploads)
    const contentType = request.headers.get('content-type') || ''
    
    if (contentType.includes('multipart/form-data')) {
      // Handle FormData (image uploads)
      const formData = await request.formData()
      
      const response = await fetch(`${BACKEND_URL}/api/products/${params.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': request.headers.get('Authorization') || ''
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
        throw new Error(errorData.message || `Backend responded with ${response.status}`)
      }

      const data = await response.json()
      return NextResponse.json(data)
    } else {
      // Handle JSON data (regular product updates)
      const body = await request.json()
      
      const response = await fetch(`${BACKEND_URL}/api/products/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': request.headers.get('Authorization') || ''
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
        throw new Error(errorData.message || `Backend responded with ${response.status}`)
      }

      const data = await response.json()
      return NextResponse.json(data)
    }
  } catch (error) {
    console.error('Error updating product:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to update product', message: errorMessage },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    const response = await fetch(`${BACKEND_URL}/api/products/${params.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization') || ''
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/products/${params.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization') || ''
      },
    })

    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}
