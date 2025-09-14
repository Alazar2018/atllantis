const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

const emailTemplates = {
  orderConfirmation: (orderData) => ({
    subject: `Order Confirmation - #${orderData.orderId}`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation</title>
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 0; 
            padding: 0; 
            background-color: #f8f9fa; 
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background-color: #ffffff; 
            border-radius: 12px; 
            overflow: hidden; 
            box-shadow: 0 4px 20px rgba(0,0,0,0.1); 
          }
          .header { 
            background: linear-gradient(135deg, #941b1f 0%, #b91c1f 100%); 
            color: white; 
            padding: 30px; 
            text-align: center; 
          }
          .header h1 { 
            margin: 0; 
            font-size: 28px; 
            font-weight: 700; 
          }
          .header p { 
            margin: 10px 0 0 0; 
            font-size: 16px; 
            opacity: 0.9; 
          }
          .content { 
            padding: 40px 30px; 
          }
          .greeting { 
            font-size: 20px; 
            color: #333; 
            margin-bottom: 30px; 
          }
          .order-info { 
            background-color: #f8f9fa; 
            border-radius: 8px; 
            padding: 20px; 
            margin-bottom: 30px; 
          }
          .order-info h2 { 
            color: #941b1f; 
            margin-top: 0; 
            font-size: 18px; 
          }
          .order-details { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 15px; 
            margin-bottom: 20px; 
          }
          .detail-item { 
            display: flex; 
            flex-direction: column; 
          }
          .detail-label { 
            font-weight: 600; 
            color: #666; 
            font-size: 14px; 
            margin-bottom: 5px; 
          }
          .detail-value { 
            color: #333; 
            font-size: 16px; 
          }
          .items-section { 
            margin-top: 30px; 
          }
          .item { 
            display: flex; 
            align-items: center; 
            padding: 15px; 
            border: 1px solid #e9ecef; 
            border-radius: 8px; 
            margin-bottom: 15px; 
            background-color: white; 
          }
          .item-image { 
            width: 80px; 
            height: 80px; 
            border-radius: 8px; 
            object-fit: cover; 
            margin-right: 15px; 
            border: 2px solid #f1f3f4; 
          }
          .item-details { 
            flex: 1; 
          }
          .item-name { 
            font-weight: 600; 
            color: #333; 
            font-size: 16px; 
            margin-bottom: 5px; 
          }
          .item-specs { 
            color: #666; 
            font-size: 14px; 
            margin-bottom: 5px; 
          }
          .item-price { 
            color: #941b1f; 
            font-weight: 600; 
            font-size: 16px; 
          }
          .total-section { 
            background: linear-gradient(135deg, #941b1f 0%, #b91c1f 100%); 
            color: white; 
            padding: 20px; 
            border-radius: 8px; 
            text-align: center; 
            margin-top: 20px; 
          }
          .total-amount { 
            font-size: 24px; 
            font-weight: 700; 
            margin: 10px 0; 
          }
          .footer { 
            background-color: #f8f9fa; 
            padding: 30px; 
            text-align: center; 
            color: #666; 
          }
          .footer a { 
            color: #941b1f; 
            text-decoration: none; 
            font-weight: 600; 
          }
          .cta-button { 
            display: inline-block; 
            background: linear-gradient(135deg, #941b1f 0%, #b91c1f 100%); 
            color: white; 
            padding: 15px 30px; 
            text-decoration: none; 
            border-radius: 8px; 
            font-weight: 600; 
            margin: 20px 0; 
            transition: transform 0.2s; 
          }
          .cta-button:hover { 
            transform: translateY(-2px); 
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Order Confirmed!</h1>
            <p>Thank you for choosing Atlantic Leather</p>
          </div>
          
          <div class="content">
            <div class="greeting">
              Hello <strong>${orderData.customerName}</strong>,<br>
              Your order has been successfully placed!
            </div>
            
            <div class="order-info">
              <h2>📋 Order Details</h2>
              <div class="order-details">
                <div class="detail-item">
                  <span class="detail-label">Order ID</span>
                  <span class="detail-value">#${orderData.orderId}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Order Date</span>
                  <span class="detail-value">${new Date().toLocaleDateString()}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Customer</span>
                  <span class="detail-value">${orderData.customerName}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Phone</span>
                  <span class="detail-value">${orderData.customerPhone}</span>
                </div>
              </div>
              
              ${orderData.notes ? `
                <div class="detail-item">
                  <span class="detail-label">Special Notes</span>
                  <span class="detail-value">${orderData.notes}</span>
                </div>
              ` : ''}
            </div>
            
            <div class="items-section">
              <h2 style="color: #941b1f; margin-bottom: 20px;">🛍️ Order Items</h2>
              ${orderData.items.map(item => `
                <div class="item">
                  <img src="${item.product_image || item.image || 'https://via.placeholder.com/80x80/941b1f/ffffff?text=Product'}" alt="${item.product_name || item.name}" class="item-image" onerror="this.src='https://via.placeholder.com/80x80/941b1f/ffffff?text=Product'">
                  <div class="item-details">
                    <div class="item-name">${item.product_name || item.name}</div>
                    <div class="item-specs">
                      Size: ${item.size || 'N/A'} | Color: ${item.color || 'N/A'} | Qty: ${item.quantity}
                    </div>
                    <div class="item-price">ETB ${(item.price || 0).toFixed(2)}</div>
                  </div>
                </div>
              `).join('')}
            </div>
            
            <div class="total-section">
              <div>Total Amount</div>
              <div class="total-amount">ETB ${orderData.totalAmount.toFixed(2)}</div>
              <div style="font-size: 14px; opacity: 0.9;">
                Order-Only System • We'll contact you for payment & delivery
              </div>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://your-website.com" class="cta-button">
                View Our Products
              </a>
            </div>
          </div>
          
          <div class="footer">
            <p><strong>Atlantic Leather</strong></p>
            <p>We'll contact you within 24 hours to arrange payment and delivery.</p>
            <p>Questions? Contact us at <a href="mailto:support@atlanticleather.com">support@atlanticleather.com</a></p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  contactForm: (contactData) => ({
    subject: `New Contact Form Submission - ${contactData.subject}`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Contact Form Submission</title>
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 0; 
            padding: 0; 
            background-color: #f8f9fa; 
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background-color: #ffffff; 
            border-radius: 12px; 
            overflow: hidden; 
            box-shadow: 0 4px 20px rgba(0,0,0,0.1); 
          }
          .header { 
            background: linear-gradient(135deg, #941b1f 0%, #b91c1f 100%); 
            color: white; 
            padding: 30px; 
            text-align: center; 
          }
          .header h1 { 
            margin: 0; 
            font-size: 28px; 
            font-weight: 700; 
          }
          .header p { 
            margin: 10px 0 0 0; 
            font-size: 16px; 
            opacity: 0.9; 
          }
          .content { 
            padding: 40px 30px; 
          }
          .contact-info { 
            background-color: #f8f9fa; 
            border-radius: 8px; 
            padding: 20px; 
            margin-bottom: 30px; 
          }
          .contact-info h2 { 
            color: #941b1f; 
            margin-top: 0; 
            font-size: 18px; 
          }
          .info-grid { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 15px; 
            margin-bottom: 20px; 
          }
          .info-item { 
            display: flex; 
            flex-direction: column; 
          }
          .info-label { 
            font-weight: 600; 
            color: #666; 
            font-size: 14px; 
            margin-bottom: 5px; 
          }
          .info-value { 
            color: #333; 
            font-size: 16px; 
          }
          .message-section { 
            background-color: #fff3cd; 
            border: 2px solid #ffc107; 
            border-radius: 8px; 
            padding: 20px; 
            margin-top: 20px; 
          }
          .message-section h3 { 
            color: #856404; 
            margin-top: 0; 
            font-size: 16px; 
          }
          .message-content { 
            color: #333; 
            font-size: 16px; 
            line-height: 1.6; 
            white-space: pre-wrap; 
          }
          .footer { 
            background-color: #f8f9fa; 
            padding: 30px; 
            text-align: center; 
            color: #666; 
          }
          .action-button { 
            display: inline-block; 
            background: linear-gradient(135deg, #941b1f 0%, #b91c1f 100%); 
            color: white; 
            padding: 15px 30px; 
            text-decoration: none; 
            border-radius: 8px; 
            font-weight: 600; 
            margin: 20px 0; 
            transition: transform 0.2s; 
          }
          .action-button:hover { 
            transform: translateY(-2px); 
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📧 New Contact Form Submission</h1>
            <p>Someone has reached out through your website</p>
          </div>
          
          <div class="content">
            <div class="contact-info">
              <h2>👤 Contact Information</h2>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">Name</span>
                  <span class="info-value">${contactData.name}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Email</span>
                  <span class="info-value">${contactData.email}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Subject</span>
                  <span class="info-value">${contactData.subject}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Date</span>
                  <span class="info-value">${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
            
            <div class="message-section">
              <h3>💬 Message</h3>
              <div class="message-content">${contactData.message}</div>
            </div>
            
            <div style="text-align: center;">
              <a href="mailto:${contactData.email}" class="action-button">
                📧 Reply to Customer
              </a>
            </div>
          </div>
          
          <div class="footer">
            <p><strong>Atlantic Leather - Contact Form</strong></p>
            <p>This is an automated notification from your website contact form.</p>
            <p>Customer: ${contactData.name} (${contactData.email})</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  adminNotification: (orderData) => ({
    subject: `🚨 NEW ORDER RECEIVED - #${orderData.orderId}`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Order Notification</title>
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 0; 
            padding: 0; 
            background-color: #f8f9fa; 
          }
          .container { 
            max-width: 700px; 
            margin: 0 auto; 
            background-color: #ffffff; 
            border-radius: 12px; 
            overflow: hidden; 
            box-shadow: 0 4px 20px rgba(0,0,0,0.1); 
          }
          .header { 
            background: linear-gradient(135deg, #941b1f 0%, #b91c1f 100%); 
            color: white; 
            padding: 30px; 
            text-align: center; 
          }
          .header h1 { 
            margin: 0; 
            font-size: 32px; 
            font-weight: 700; 
          }
          .header p { 
            margin: 10px 0 0 0; 
            font-size: 18px; 
            opacity: 0.9; 
          }
          .alert-badge { 
            background-color: #dc3545; 
            color: white; 
            padding: 8px 16px; 
            border-radius: 20px; 
            font-size: 14px; 
            font-weight: 600; 
            display: inline-block; 
            margin-top: 10px; 
          }
          .content { 
            padding: 40px 30px; 
          }
          .order-summary { 
            background-color: #fff3cd; 
            border: 2px solid #ffc107; 
            border-radius: 8px; 
            padding: 20px; 
            margin-bottom: 30px; 
            text-align: center; 
          }
          .order-summary h2 { 
            color: #856404; 
            margin-top: 0; 
            font-size: 20px; 
          }
          .order-id { 
            font-size: 24px; 
            font-weight: 700; 
            color: #941b1f; 
            margin: 10px 0; 
          }
          .customer-info { 
            background-color: #f8f9fa; 
            border-radius: 8px; 
            padding: 20px; 
            margin-bottom: 30px; 
          }
          .customer-info h3 { 
            color: #941b1f; 
            margin-top: 0; 
            font-size: 18px; 
          }
          .info-grid { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 15px; 
          }
          .info-item { 
            display: flex; 
            flex-direction: column; 
          }
          .info-label { 
            font-weight: 600; 
            color: #666; 
            font-size: 14px; 
            margin-bottom: 5px; 
          }
          .info-value { 
            color: #333; 
            font-size: 16px; 
          }
          .items-section { 
            margin-top: 30px; 
          }
          .item { 
            display: flex; 
            align-items: center; 
            padding: 15px; 
            border: 1px solid #e9ecef; 
            border-radius: 8px; 
            margin-bottom: 15px; 
            background-color: white; 
          }
          .item-image { 
            width: 80px; 
            height: 80px; 
            border-radius: 8px; 
            object-fit: cover; 
            margin-right: 15px; 
            border: 2px solid #f1f3f4; 
          }
          .item-details { 
            flex: 1; 
          }
          .item-name { 
            font-weight: 600; 
            color: #333; 
            font-size: 16px; 
            margin-bottom: 5px; 
          }
          .item-specs { 
            color: #666; 
            font-size: 14px; 
            margin-bottom: 5px; 
          }
          .item-price { 
            color: #941b1f; 
            font-weight: 600; 
            font-size: 16px; 
          }
          .total-section { 
            background: linear-gradient(135deg, #941b1f 0%, #b91c1f 100%); 
            color: white; 
            padding: 25px; 
            border-radius: 8px; 
            text-align: center; 
            margin-top: 20px; 
          }
          .total-amount { 
            font-size: 28px; 
            font-weight: 700; 
            margin: 10px 0; 
          }
          .action-buttons { 
            text-align: center; 
            margin: 30px 0; 
          }
          .action-button { 
            display: inline-block; 
            background: linear-gradient(135deg, #941b1f 0%, #b91c1f 100%); 
            color: white; 
            padding: 15px 30px; 
            text-decoration: none; 
            border-radius: 8px; 
            font-weight: 600; 
            margin: 0 10px; 
            transition: transform 0.2s; 
          }
          .action-button:hover { 
            transform: translateY(-2px); 
          }
          .footer { 
            background-color: #f8f9fa; 
            padding: 30px; 
            text-align: center; 
            color: #666; 
          }
          .urgent-note { 
            background-color: #f8d7da; 
            border: 1px solid #f5c6cb; 
            color: #721c24; 
            padding: 15px; 
            border-radius: 8px; 
            margin: 20px 0; 
            text-align: center; 
            font-weight: 600; 
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚨 NEW ORDER RECEIVED!</h1>
            <p>Action Required - Customer Order Details</p>
            <div class="alert-badge">URGENT - Contact Customer Within 24 Hours</div>
          </div>
          
          <div class="content">
            <div class="order-summary">
              <h2>📋 Order Summary</h2>
              <div class="order-id">#${orderData.orderId}</div>
              <div style="color: #856404; font-size: 16px;">
                Received on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
              </div>
            </div>
            
            <div class="customer-info">
              <h3>👤 Customer Information</h3>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">Name</span>
                  <span class="info-value">${orderData.customerName}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Email</span>
                  <span class="info-value">${orderData.customerEmail}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Phone</span>
                  <span class="info-value">${orderData.customerPhone}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Order Value</span>
                  <span class="info-value" style="color: #941b1f; font-weight: 600;">ETB ${orderData.totalAmount.toFixed(2)}</span>
                </div>
              </div>
              
              ${orderData.notes ? `
                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e9ecef;">
                  <span class="info-label">Special Notes</span>
                  <div style="color: #333; font-size: 16px; margin-top: 5px;">${orderData.notes}</div>
                </div>
              ` : ''}
            </div>
            
            <div class="items-section">
              <h3 style="color: #941b1f; margin-bottom: 20px;">🛍️ Order Items (${orderData.items.length} items)</h3>
              ${orderData.items.map(item => `
                <div class="item">
                  <img src="${item.product_image || item.image || 'https://via.placeholder.com/80x80/941b1f/ffffff?text=Product'}" alt="${item.product_name || item.name}" class="item-image" onerror="this.src='https://via.placeholder.com/80x80/941b1f/ffffff?text=Product'">
                  <div class="item-details">
                    <div class="item-name">${item.product_name || item.name}</div>
                    <div class="item-specs">
                      Size: ${item.size || 'N/A'} | Color: ${item.color || 'N/A'} | Qty: ${item.quantity}
                    </div>
                    <div class="item-price">ETB ${(item.price || 0).toFixed(2)}</div>
                  </div>
                </div>
              `).join('')}
            </div>
            
            <div class="total-section">
              <div style="font-size: 18px;">Total Order Value</div>
              <div class="total-amount">ETB ${orderData.totalAmount.toFixed(2)}</div>
              <div style="font-size: 14px; opacity: 0.9;">
                Order-Only System • Customer waiting for contact
              </div>
            </div>
            
            <div class="urgent-note">
              ⚠️ URGENT: Contact customer within 24 hours to arrange payment and delivery!
            </div>
            
            <div class="action-buttons">
              <a href="mailto:${orderData.customerEmail}" class="action-button">
                📧 Email Customer
              </a>
              <a href="tel:${orderData.customerPhone}" class="action-button">
                📞 Call Customer
              </a>
            </div>
          </div>
          
          <div class="footer">
            <p><strong>Atlantic Leather - Admin Dashboard</strong></p>
            <p>This is an automated notification. Please take action immediately.</p>
            <p>Order ID: #${orderData.orderId} | Customer: ${orderData.customerName}</p>
          </div>
        </div>
      </body>
      </html>
    `
  })
};

const sendEmail = async (to, template, data) => {
  try {
    const emailContent = emailTemplates[template](data);
    
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: to,
      subject: emailContent.subject,
      html: emailContent.html
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to ${to}`);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error(`❌ Error sending email to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
};

const sendOrderEmails = async (orderData) => {
  try {
    console.log('📧 Sending order emails for order:', orderData.orderId);
    
    // Send customer confirmation email
    const customerEmailResult = await sendEmail(
      orderData.customerEmail,
      'orderConfirmation',
      orderData
    );
    
    // Send admin notification email
    const adminEmailResult = await sendEmail(
      'molaberiandsons123@gmail.com',
      'adminNotification',
      orderData
    );
    
    return {
      customerEmail: customerEmailResult,
      adminEmail: adminEmailResult
    };
  } catch (error) {
    console.error('❌ Error sending order emails:', error);
    throw error;
  }
};

// Send order confirmation email to customer
async function sendOrderConfirmationEmail(order, orderItems) {
  try {
    console.log('📧 Sending order confirmation email to:', order.customer_email);
    
    const itemsHtml = orderItems.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
          <div style="display: flex; align-items: center;">
            <img src="${item.product_image || 'https://via.placeholder.com/60x60'}" 
                 alt="${item.product_name}" 
                 style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; margin-right: 12px;">
            <div>
              <h4 style="margin: 0 0 4px 0; color: #1f2937; font-size: 16px;">${item.product_name}</h4>
              <p style="margin: 0; color: #6b7280; font-size: 14px;">${item.product_category}</p>
              ${item.size ? `<p style="margin: 4px 0 0 0; color: #6b7280; font-size: 14px;">Size: ${item.size}</p>` : ''}
              ${item.color ? `<p style="margin: 4px 0 0 0; color: #6b7280; font-size: 14px;">Color: ${item.color}</p>` : ''}
            </div>
          </div>
        </td>
        <td style="padding: 12px; text-align: center; border-bottom: 1px solid #e5e7eb; color: #374151;">${item.quantity}</td>
        <td style="padding: 12px; text-align: right; border-bottom: 1px solid #e5e7eb; color: #374151;">$${parseFloat(item.price).toFixed(2)}</td>
      </tr>
    `).join('');

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmed - Atlantic Leather</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #941b1f; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .order-details { background-color: white; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .items-table th { background-color: #f3f4f6; padding: 12px; text-align: left; font-weight: 600; color: #374151; }
          .total { background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          .button { display: inline-block; background-color: #941b1f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 28px;">🎉 Order Confirmed!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Thank you for your order</p>
          </div>
          
          <div class="content">
            <h2 style="color: #1f2937; margin-bottom: 20px;">Hello ${order.customer_name},</h2>
            
            <p style="margin-bottom: 20px; font-size: 16px;">
              Great news! Your order has been confirmed and is now being processed. 
              We're excited to prepare your items for shipping.
            </p>
            
            <div class="order-details">
              <h3 style="color: #1f2937; margin-bottom: 15px;">Order Details</h3>
              <p><strong>Order ID:</strong> #${order.id}</p>
              <p><strong>Order Date:</strong> ${new Date(order.created_at).toLocaleDateString()}</p>
              <p><strong>Status:</strong> <span style="color: #059669; font-weight: 600;">Confirmed</span></p>
            </div>
            
            <h3 style="color: #1f2937; margin: 20px 0 15px 0;">Your Items</h3>
            <table class="items-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th style="text-align: center;">Quantity</th>
                  <th style="text-align: right;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
            
            <div class="total">
              <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: 600;">
                <span>Total Amount:</span>
                <span>$${parseFloat(order.total_amount).toFixed(2)}</span>
              </div>
            </div>
            
            <div style="background-color: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h4 style="color: #0c4a6e; margin: 0 0 10px 0;">What's Next?</h4>
              <ul style="margin: 0; padding-left: 20px; color: #0c4a6e;">
                <li>We're preparing your items for shipment</li>
                <li>You'll receive a shipping confirmation email with tracking details</li>
                <li>Expected delivery: 3-5 business days</li>
              </ul>
            </div>
            
            <p style="margin: 30px 0 20px 0; font-size: 16px;">
              Thank you for choosing Atlantic Leather. We hope you love your new products!
            </p>
            
            <p style="margin-bottom: 30px; font-size: 16px;">
              If you have any questions about your order, please don't hesitate to contact us.
            </p>
            
            <div style="text-align: center;">
              <a href="mailto:support@atlanticleather.com" class="button">Contact Support</a>
            </div>
          </div>
          
          <div class="footer">
            <p>© 2024 Atlantic Leather. All rights reserved.</p>
            <p>This email was sent to ${order.customer_email}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: order.customer_email,
      subject: `Order Confirmed - #${order.id} - Atlantic Leather`,
      html: emailHtml
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Order confirmation email sent successfully to:', order.customer_email);
    return result;
    
  } catch (error) {
    console.error('❌ Error sending order confirmation email:', error);
    throw error;
  }
}

const sendContactFormEmail = async (contactData) => {
  try {
    console.log('📧 Sending contact form email for:', contactData.name);
    
    const result = await sendEmail(
      'molaberiandsons123@gmail.com', // Admin email
      'contactForm',
      contactData
    );
    
    return result;
  } catch (error) {
    console.error('❌ Error sending contact form email:', error);
    throw error;
  }
};

module.exports = {
  sendEmail,
  sendOrderEmails,
  emailTemplates,
  sendOrderConfirmationEmail,
  sendContactFormEmail
};
