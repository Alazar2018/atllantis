import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('📋 Order Detail API - Starting request for order:', params.id);
    
    const response = await fetch(`${BACKEND_URL}/api/orders/${params.id}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization') || ''
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('📋 Order Detail API - Backend error:', errorText);
      throw new Error(`Backend responded with ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('📋 Order Detail API - Backend data:', data);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('📋 Order Detail API - Error fetching order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}
