# EmailJS Setup Guide

## Step 1: Create EmailJS Account
1. Go to [EmailJS.com](https://www.emailjs.com/)
2. Sign up for a free account
3. Verify your email address

## Step 2: Create Email Service
1. In your EmailJS dashboard, go to "Email Services"
2. Click "Add New Service"
3. Choose your email provider (Gmail, Outlook, etc.)
4. Follow the setup instructions for your chosen provider
5. Note down your **Service ID**

## Step 3: Create Email Template
1. Go to "Email Templates" in your dashboard
2. Click "Create New Template"
3. Use this template content:

```
Subject: New Contact Form Message - {{subject}}

From: {{from_name}} ({{from_email}})

Message:
{{message}}

---
This message was sent from your website contact form.
```

4. Save the template and note down your **Template ID**

## Step 4: Get Public Key
1. Go to "Account" in your dashboard
2. Find your **Public Key** (also called User ID)

## Step 5: Update Configuration
Replace the placeholder values in `src/pages/Contact.jsx`:

```javascript
const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID';        // Replace with your Service ID
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';      // Replace with your Template ID  
const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY';        // Replace with your Public Key
```

## Step 6: Test the Form
1. Start your development server: `npm run dev`
2. Navigate to the Contact page
3. Fill out and submit the form
4. Check your email for the message

## Template Variables Used
- `{{from_name}}` - Sender's full name
- `{{from_email}}` - Sender's email address
- `{{subject}}` - Message subject
- `{{message}}` - Message content
- `{{to_email}}` - Recipient email (set to corporaterelation@chanrerier.com)

## Troubleshooting
- Make sure all IDs are correct and match your EmailJS dashboard
- Check browser console for any error messages
- Verify your email service is properly configured
- Ensure your template uses the correct variable names
