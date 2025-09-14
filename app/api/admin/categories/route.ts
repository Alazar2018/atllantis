import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001'

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/categories`, {
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
    
    // Backend returns { error: false, categories: [...] }
    // Frontend expects { data: [...] }
    return NextResponse.json({
      data: data.categories || [],
      error: data.error || false,
      message: data.message || null
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories', data: [] },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const id = request.nextUrl.pathname.split('/').pop()
    const authHeader = request.headers.get('authorization')
    
    // Parse the incoming FormData
    const formData = await request.formData()
    
    // Create a new FormData object to send to the backend
    const backendFormData = new FormData()
    
    // Copy all the fields
    const entries = Array.from(formData.entries())
    for (const [key, value] of entries) {
      backendFormData.append(key, value)
    }
    
    // Send to backend
    const response = await fetch(`${BACKEND_URL}/api/categories/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': authHeader || '',
      },
      body: backendFormData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Backend error:', errorText)
      throw new Error(`Backend responded with ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the authorization header from the original request
    const authHeader = request.headers.get('authorization')
    
    // Parse the incoming FormData
    const formData = await request.formData()
    
    // Create a new FormData object to send to the backend
    const backendFormData = new FormData()
    
    // Copy all the fields
    const entries = Array.from(formData.entries())
    for (const [key, value] of entries) {
      backendFormData.append(key, value)
    }
    
    // Send to backend
    const response = await fetch(`${BACKEND_URL}/api/categories`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader || '',
      },
      body: backendFormData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Backend error:', errorText)
      throw new Error(`Backend responded with ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.pathname.split('/').pop()
    const authHeader = request.headers.get('authorization')
    
    const response = await fetch(`${BACKEND_URL}/api/categories/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': authHeader || '',
      },
    })

    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    )
  }
}
