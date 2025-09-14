require('dotenv').config()
const { sendOrderEmails } = require('./services/emailService')

async function testEmailService() {
  try {
    console.log('Testing email service with complete product data...')
    
    // Test data that matches the new database structure
    const testOrderData = {
      orderId: 'TEST-001',
      customerName: 'John Doe',
      customerEmail: 'alazartilahun14@gmail.com',
      customerPhone: '+251912345678',
      totalAmount: 450.00,
      notes: 'Test order for email verification',
      items: [
        {
          productId: 1,
          product_name: 'Premium Leather Wallet',
          product_image: '/uploads/wallet-1.jpg',
          product_category: 'Wallets',
          quantity: 2,
          price: 150.00,
          original_price: 180.00,
          size: 'Standard',
          color: 'Brown'
        },
        {
          productId: 2,
          product_name: 'Classic Leather Belt',
          product_image: '/uploads/belt-1.jpg',
          product_category: 'Belts',
          quantity: 1,
          price: 150.00,
          original_price: 200.00,
          size: '32',
          color: 'Black'
        }
      ]
    }

    console.log('📧 Sending test emails...')
    const result = await sendOrderEmails(testOrderData)
    
    console.log('Email service test result:', result)
    
    if (result.customerEmail.success) {
      console.log('✅ Customer email sent successfully')
    } else {
      console.log('❌ Customer email failed:', result.customerEmail.error)
    }
    
    if (result.adminEmail.success) {
      console.log('✅ Admin email sent successfully')
    } else {
      console.log('❌ Admin email failed:', result.adminEmail.error)
    }
    
  } catch (error) {
    console.error('❌ Error testing email service:', error)
  }
}

testEmailService()
