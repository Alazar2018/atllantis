import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('✅ Order Confirm API - Starting confirmation for order:', params.id);
    
    const response = await fetch(`${BACKEND_URL}/api/orders/${params.id}/confirm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization') || ''
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('✅ Order Confirm API - Backend error:', errorText);
      throw new Error(`Backend responded with ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Order Confirm API - Backend data:', data);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('✅ Order Confirm API - Error confirming order:', error);
    return NextResponse.json(
      { error: 'Failed to confirm order' },
      { status: 500 }
    );
  }
}
