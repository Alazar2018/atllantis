import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001'

export async function POST(request: NextRequest) {
  try {
    console.log('PDF export started');
    
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      console.log('No authorization header');
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { dateRange, reportData } = body
    console.log('Exporting report for date range:', dateRange);

    // Generate HTML content for the PDF
    const htmlContent = generateReportHTML(reportData, dateRange)
    console.log('HTML content generated');

    // Try to generate PDF, fallback to HTML if PDF fails
    try {
      const pdfBuffer = await generatePDF(htmlContent)
      console.log('PDF generated successfully');
      
      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="atlantic-leather-report-${new Date().toISOString().split('T')[0]}.pdf"`
        }
      })
    } catch (pdfError) {
      console.log('PDF generation failed, falling back to HTML:', pdfError);
      
      // Return HTML as fallback
      return new NextResponse(htmlContent, {
        headers: {
          'Content-Type': 'text/html',
          'Content-Disposition': `attachment; filename="atlantic-leather-report-${new Date().toISOString().split('T')[0]}.html"`
        }
      })
    }

  } catch (error) {
    console.error('PDF export error:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

function generateReportHTML(reportData: any, dateRange: string) {
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
      <title>Atlantic Leather - Business Report</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          margin: 0;
          padding: 20px;
          background-color: #f8fafc;
          color: #1f2937;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding: 20px;
          background: linear-gradient(135deg, #941b1f 0%, #b91c1f 100%);
          color: white;
          border-radius: 12px;
        }
        .logo {
          font-size: 32px;
          font-weight: bold;
          margin-bottom: 10px;
          color: #fbbf24;
        }
        .subtitle {
          font-size: 18px;
          opacity: 0.9;
        }
        .report-info {
          background: white;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        .metric-card {
          background: white;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          border-left: 4px solid #941b1f;
        }
        .metric-value {
          font-size: 24px;
          font-weight: bold;
          color: #941b1f;
          margin-bottom: 5px;
        }
        .metric-label {
          font-size: 14px;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .section {
          background: white;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .section-title {
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 2px solid #e5e7eb;
        }
        .table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 15px;
        }
        .table th, .table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #e5e7eb;
        }
        .table th {
          background-color: #f9fafb;
          font-weight: 600;
          color: #374151;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          padding: 20px;
          color: #6b7280;
          font-size: 12px;
        }
        .status-badge {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }
        .status-pending { background-color: #fef3c7; color: #92400e; }
        .status-confirmed { background-color: #dbeafe; color: #1e40af; }
        .status-sold { background-color: #d1fae5; color: #065f46; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">👜 ATLANTIC LEATHER</div>
        <div class="subtitle">Premium Leather Products & Accessories</div>
      </div>

      <div class="report-info">
        <h2>Business Performance Report</h2>
        <p><strong>Report Period:</strong> Last ${dateRange} days</p>
        <p><strong>Generated On:</strong> ${currentDate}</p>
      </div>

      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-value">ETB ${(reportData.totalSales || 0).toLocaleString()}</div>
          <div class="metric-label">Total Sales</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${reportData.totalOrders || 0}</div>
          <div class="metric-label">Total Orders</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${reportData.totalCustomers || 0}</div>
          <div class="metric-label">Total Customers</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${reportData.totalProducts || 0}</div>
          <div class="metric-label">Total Products</div>
        </div>
      </div>

      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-value">ETB ${(reportData.currentBalance || 0).toLocaleString()}</div>
          <div class="metric-label">Current Balance</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">ETB ${(reportData.totalEarned || 0).toLocaleString()}</div>
          <div class="metric-label">Total Earned</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">ETB ${(reportData.totalWithdrawn || 0).toLocaleString()}</div>
          <div class="metric-label">Total Withdrawn</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Order Status Breakdown</div>
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-value">${reportData.pendingOrders || 0}</div>
            <div class="metric-label">Pending Orders</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">${reportData.confirmedOrders || 0}</div>
            <div class="metric-label">Confirmed Orders</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">${reportData.soldOrders || 0}</div>
            <div class="metric-label">Sold Orders</div>
          </div>
        </div>
      </div>

      ${reportData.recentTransactions && reportData.recentTransactions.length > 0 ? `
        <div class="section">
          <div class="section-title">Recent Transactions</div>
          <table class="table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Description</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${reportData.recentTransactions.slice(0, 10).map((transaction: any) => `
                <tr>
                  <td><span class="status-badge status-${transaction.type}">${transaction.type}</span></td>
                  <td>${transaction.description}${transaction.orderId ? ` (Order #${transaction.orderId})` : ''}</td>
                  <td>ETB ${(transaction.amount || 0).toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : ''}

      <div class="footer">
        <p>This report was automatically generated by Atlantic Leather Admin System</p>
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
      top: '20mm',
      right: '20mm',
      bottom: '20mm',
      left: '20mm'
    }
  })
  
  await browser.close()
  return Buffer.from(pdfBuffer)
}
