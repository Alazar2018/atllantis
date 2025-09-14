# Gmail SMTP Setup for Order Confirmations

## Prerequisites
- A Gmail account
- 2-Factor Authentication enabled on your Gmail account

## Step 1: Enable 2-Factor Authentication
1. Go to your Google Account settings: https://myaccount.google.com/
2. Navigate to Security → 2-Step Verification
3. Enable 2-Step Verification if not already enabled

## Step 2: Generate App Password
1. Go to Security → App passwords
2. Select "Mail" as the app
3. Select "Other (Custom name)" as the device
4. Enter a name like "Atlantic Leather Orders"
5. Click "Generate"
6. **Copy the 16-character password** (it will look like: xxxx xxxx xxxx xxxx)

## Step 3: Update Environment Variables
1. Copy `.env.example` to `.env` if you haven't already:
   ```bash
   cp env.example .env
   ```

2. Edit `.env` and update these values:
   ```env
   GMAIL_USER=your_gmail_address@gmail.com
   GMAIL_APP_PASSWORD=your_16_character_app_password
   ```

3. Replace:
   - `your_gmail_address@gmail.com` with your actual Gmail address
   - `your_16_character_app_password` with the app password from Step 2

## Step 4: Test Email Service
1. Make sure your backend server is running
2. Run the test script:
   ```bash
   node test_email.js
   ```

3. Check the console output for success/error messages
4. Check your email inbox for the test emails

## Step 5: Verify Order System
1. Go to the frontend cart page
2. Add items to cart
3. Fill out the order form
4. Submit the order
5. Check that:
   - Customer receives confirmation email
   - Admin (Mollaberiandsons123@gmail.com) receives notification email
   - Order is saved to database

## Troubleshooting

### Common Issues:

1. **"Invalid login" error**
   - Make sure you're using the app password, not your regular Gmail password
   - Verify 2-Factor Authentication is enabled

2. **"Less secure app access" error**
   - This is expected - app passwords are the secure way to handle this
   - Make sure you're using the app password, not your regular password

3. **"Authentication failed" error**
   - Double-check the app password is copied correctly
   - Make sure there are no extra spaces

4. **Emails not sending**
   - Check console logs for error messages
   - Verify environment variables are set correctly
   - Restart the backend server after updating .env

### Security Notes:
- **Never commit your .env file** to version control
- **App passwords are more secure** than regular passwords
- **Each app password is unique** and can be revoked individually
- **Monitor your Gmail account** for any suspicious activity

## Email Templates

The system sends two types of emails:

1. **Customer Confirmation Email**
   - Sent to the customer who placed the order
   - Contains order details and confirmation
   - Professional branding with Atlantic Leather styling

2. **Admin Notification Email**
   - Sent to Mollaberiandsons123@gmail.com
   - Contains order details and next steps
   - Red alert styling to draw attention

## Customization

To customize email templates, edit `services/emailService.js`:
- Modify HTML content in `emailTemplates`
- Change colors, fonts, and layout
- Add your company logo
- Update contact information

## Support

If you continue to have issues:
1. Check the console logs for detailed error messages
2. Verify your Gmail account settings
3. Test with a different Gmail account
4. Check if your Gmail account has any restrictions
