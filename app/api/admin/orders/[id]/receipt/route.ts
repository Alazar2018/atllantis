import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Receipt generation started for order:', params.id);
    
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      console.log('No authorization header');
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      )
    }

    const orderId = params.id
    console.log('Fetching order details for ID:', orderId);

    // Fetch order details from backend
    const orderResponse = await fetch(`${BACKEND_URL}/api/orders/${orderId}`, {
      headers: {
        'Authorization': authHeader
      }
    })

    if (!orderResponse.ok) {
      console.log('Failed to fetch order from backend:', orderResponse.status);
      return NextResponse.json(
        { error: 'Failed to fetch order details' },
        { status: 404 }
      )
    }

    const orderData = await orderResponse.json()
    const order = orderData.data
    console.log('Order data fetched successfully');

    // Generate HTML content for the receipt
    const htmlContent = generateReceiptHTML(order)
    console.log('HTML content generated');

    // Try to generate PDF, fallback to HTML if PDF fails
    try {
      const pdfBuffer = await generatePDF(htmlContent)
      console.log('PDF generated successfully');
      
      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="receipt-order-${orderId}.pdf"`
        }
      })
    } catch (pdfError) {
      console.log('PDF generation failed, falling back to HTML:', pdfError);
      
      // Return HTML as fallback
      return new NextResponse(htmlContent, {
        headers: {
          'Content-Type': 'text/html',
          'Content-Disposition': `attachment; filename="receipt-order-${orderId}.html"`
        }
      })
    }

  } catch (error) {
    console.error('Receipt generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate receipt', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

function generateReceiptHTML(order: any) {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Receipt - Order #${order.id}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          margin: 0;
          padding: 15px;
          background-color: #f8fafc;
          color: #1f2937;
          font-size: 12px;
          line-height: 1.3;
        }
        
        /* Mobile responsiveness */
        @media (max-width: 768px) {
          body {
            padding: 10px;
          }
          
          .header {
            padding: 15px;
            margin-bottom: 20px;
          }
          
          .logo {
            font-size: 24px;
          }
          
          .subtitle {
            font-size: 14px;x
          }
          
          .receipt-info, .customer-info {
            padding: 15px;
            margin-bottom: 15px;
          }
          
          .receipt-info h2 {
            font-size: 18px;
          }
          
          .customer-info h3 {
            font-size: 16px;
          }
          
          .items-table {
            font-size: 12px;
          }
          
          .receipt-details, .customer-details {
            gap: 10px;
          }
          
          .detail-row {
            flex-direction: column;
            justify-content: flex-start;
            align-items: flex-start;
            gap: 8px;
            padding: 8px 0;
            border-bottom: 1px solid #e5e7eb;
          }
          
          .detail-row:last-child {
            border-bottom: none;
          }
          
          .items-table th, .items-table td {
            padding: 8px;
          }
          
          .total-section {
            padding: 15px;
          }
          
          .total-row {
            font-size: 14px;
          }
          
          .total-row:last-child {
            font-size: 16px;
          }
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
          padding: 15px;
          background: linear-gradient(135deg, #941b1f 0%, #b91c1f 100%);
          color: white;
          border-radius: 12px;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 8px;
          color: #fbbf24;
        }
        .subtitle {
          font-size: 16px;
          opacity: 0.9;
        }
        .receipt-info {
          background: white;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 15px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .customer-info {
          background: white;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 15px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin: 15px 0;
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .items-table th, .items-table td {
          padding: 10px;
          text-align: left;
          border-bottom: 1px solid #e5e7eb;
        }
        .items-table th {
          background-color: #f9fafb;
          font-weight: 600;
          color: #374151;
        }
        .total-section {
          background: white;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 15px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #e5e7eb;
        }
        .total-row:last-child {
          border-bottom: none;
          font-weight: bold;
          font-size: 18px;
          color: #941b1f;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          padding: 15px;
          color: #6b7280;
          font-size: 11px;
        }
        .status-badge {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
          text-transform: uppercase;
        }
        .status-confirmed { background-color: #fecaca; color: #941b1f; }
        
        .receipt-details, .customer-details {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .detail-row {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
        }
        
        .detail-row p {
          margin: 0;
          min-width: 0;
          flex: 1;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">👜 ATLANTIC LEATHER</div>
        <div class="subtitle">Premium Leather Products & Accessories</div>
      </div>

              <div class="receipt-info">
          <h2>Order Receipt</h2>
          <div class="receipt-details">
            <div class="detail-row">
              <p><strong>Receipt #:</strong> ${order.id}</p>
              <p><strong>Date:</strong> ${currentDate}</p>
              <p><strong>Status:</strong> <span class="status-badge status-confirmed">Confirmed</span></p>
            </div>
            <div class="detail-row">
              <p><strong>Order Date:</strong> ${new Date(order.created_at).toLocaleDateString()}</p>
              <p><strong>Payment Status:</strong> ${order.payment_status}</p>
            </div>
          </div>
        </div>

        <div class="customer-info">
          <h3>Customer Information</h3>
          <div class="customer-details">
            <div class="detail-row">
              <p><strong>Name:</strong> ${order.customer_name}</p>
              <p><strong>Email:</strong> ${order.customer_email}</p>
              <p><strong>Phone:</strong> ${order.customer_phone}</p>
            </div>
            ${order.customer_address ? `<div class="detail-row">
              <p><strong>Address:</strong> ${order.customer_address}</p>
            </div>` : ''}
          </div>
        </div>

      <div style="background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h3>Order Items</h3>
        <table class="items-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Details</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map((item: any) => `
              <tr>
                <td>${item.product_name}</td>
                <td>${item.product_category || 'N/A'}${item.size ? ` | ${item.size}` : ''}${item.color ? ` | ${item.color}` : ''}</td>
                <td>${item.quantity}</td>
                <td>ETB ${item.price.toLocaleString()}</td>
                <td>ETB ${(item.price * item.quantity).toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="total-section">
        <h3>Order Summary</h3>
        <div class="total-row">
          <span>Subtotal:</span>
          <span>ETB ${order.total_amount.toLocaleString()}</span>
        </div>
        <div class="total-row">
          <span>Total Amount:</span>
          <span>ETB ${order.total_amount.toLocaleString()}</span>
        </div>
      </div>

      ${order.notes ? `
        <div style="background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h3>Additional Notes</h3>
          <p>${order.notes}</p>
        </div>
      ` : ''}

      <div class="footer">
        <p>Thank you for your order! This receipt serves as proof of purchase.</p>
        <p>For any questions, please contact us at support@atlanticleather.com</p>
        <p>© ${new Date().getFullYear()} Atlantic Leather. All rights reserved.</p>
      </div>
    </body>
    </html>
  `
}

async function generatePDF(htmlContent: string): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })
  
  const page = await browser.newPage()
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' })
  
  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: {
      top: '15mm',
      right: '15mm',
      bottom: '15mm',
      left: '15mm'
    }
  })
  
  await browser.close()
  return Buffer.from(pdfBuffer)
}
