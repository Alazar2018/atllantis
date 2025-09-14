import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001'

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/products/admin`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization') || ''
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Backend error:', errorText)
      throw new Error(`Backend responded with ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    
    // Backend returns { error: false, products: [...], pagination: {...} }
    // Frontend expects { data: [...], pagination: {...} }
    return NextResponse.json({
      data: data.products || [],
      pagination: data.pagination || {},
      error: data.error || false,
      message: data.message || null
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products', data: [], pagination: {} },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Handle FormData for file uploads
    const formData = await request.formData()
    
    // Convert FormData to the format expected by the backend
    const productData: any = {}
    
    // Extract all form fields - convert to array first to avoid iteration issues
    const entries = Array.from(formData.entries())
    for (const [key, value] of entries) {
      if (key === 'images') {
        // Handle multiple images
        if (!productData.images) {
          productData.images = []
        }
        if (value instanceof File) {
          productData.images.push(value)
        }
      } else if (key === 'colors' || key === 'sizes' || key === 'features') {
        // Parse JSON arrays
        try {
          productData[key] = JSON.parse(value as string)
        } catch (e) {
          productData[key] = []
        }
      } else if (key === 'price' || key === 'original_price' || key === 'sale_price' || key === 'stock_quantity' || key === 'category_id') {
        // Convert numeric fields
        productData[key] = Number(value)
      } else if (key === 'is_on_sale' || key === 'active') {
        // Convert boolean fields
        productData[key] = value === 'true'
      } else {
        // Handle string fields
        productData[key] = value
      }
    }

    // Create a new FormData for the backend
    const backendFormData = new FormData()
    
    // Add all product data
    Object.keys(productData).forEach(key => {
      if (key === 'images') {
        // Add image files
        if (Array.isArray(productData[key])) {
          productData[key].forEach((file: File) => {
            backendFormData.append('images', file)
          })
        }
      } else if (key === 'colors' || key === 'sizes' || key === 'features') {
        // Add arrays as JSON strings
        backendFormData.append(key, JSON.stringify(productData[key]))
      } else {
        // Add other fields
        backendFormData.append(key, String(productData[key]))
      }
    })

    const response = await fetch(`${BACKEND_URL}/api/products`, {
      method: 'POST',
      headers: {
        'Authorization': request.headers.get('Authorization') || ''
      },
      body: backendFormData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || `Backend responded with ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Failed to create product', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
