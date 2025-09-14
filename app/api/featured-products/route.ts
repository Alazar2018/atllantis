import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    const privateApiKey = process.env.NEXT_PUBLIC_PRIVATE_API_KEY || 'your_private_api_key_for_customers_here';
    
    const response = await fetch(`${backendUrl}/api/public/featured-products`, {
      headers: {
        'x-api-key': privateApiKey
      }
    });
    
    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Featured products API error:', error);
    return NextResponse.json(
      { error: true, message: 'Failed to fetch featured products' },
      { status: 500 }
    );
  }
}
