# Third-Party Services & API Requirements

This document outlines all third-party APIs and services required for the Travel Plans application to function properly.

## 📋 Overview

The application requires several third-party services for core functionality:
- **Firebase** (Hosting, Authentication, Firestore, Functions)
- **Google AI** (AI-powered itinerary generation)
- **Twilio** (WhatsApp messaging)
- **Email Service** (User notifications, password reset, welcome emails)

---

## 🔥 Firebase Services

### Status: ✅ **Configured & Active**

Firebase is the primary platform hosting the application.

### Required Services:
1. **Firebase Hosting** - Frontend hosting
2. **Firebase Authentication** - User authentication
3. **Cloud Firestore** - Database
4. **Cloud Functions** - Backend API endpoints
5. **Firebase Storage** - File storage (if needed)

### Configuration:
- **Project ID**: `travelplan-grav`
- **Project Console**: https://console.firebase.google.com/project/travelplan-grav

### Setup:
Firebase is already configured. No additional setup required unless creating a new project.

### Cost:
- **Free Tier**: Generous free tier for development
- **Paid Plans**: Based on usage (Firestore reads/writes, Functions invocations, etc.)

---

## 🤖 Google AI (Gemini)

### Status: ⚠️ **Required for AI Features**

Used for AI-powered itinerary generation, image generation, and chatbot functionality.

### Required Credentials:
- **API Key**: Google AI (Gemini) API Key

### Setup Instructions:

1. **Get API Key**:
   - Visit: https://aistudio.google.com/app/apikey
   - Sign in with Google account
   - Create a new API key
   - Copy the API key

2. **Configure in Firebase Functions**:
   ```bash
   firebase functions:secrets:set GOOGLE_AI_API_KEY
   ```
   When prompted, paste your API key.

3. **Verify Configuration**:
   ```bash
   firebase functions:secrets:access GOOGLE_AI_API_KEY
   ```

### Features Using This Service:
- ✅ AI Itinerary Generation (`/generateItinerary`)
- ✅ AI Image Generation (`/generateImage`)
- ✅ AI Chatbot (`/chat`)

### API Models Used:
- `gemini-2.5-flash` - For text generation
- `imagen-4.0-generate-001` - For image generation

### Cost:
- **Free Tier**: Limited free requests per month
- **Paid Plans**: Pay-per-use pricing
- **Pricing**: Check https://ai.google.dev/pricing

### Documentation:
- https://ai.google.dev/
- https://ai.google.dev/docs

---

## 📱 Twilio (WhatsApp Messaging)

### Status: ⚠️ **Required for WhatsApp Features**

Used for sending WhatsApp messages to users (excluding admins).

### Required Credentials:
1. **Account SID** - Twilio Account Identifier
2. **Auth Token** - Twilio Authentication Token
3. **WhatsApp From Number** - Twilio WhatsApp-enabled phone number

### Setup Instructions:

1. **Create Twilio Account**:
   - Visit: https://www.twilio.com/try-twilio
   - Sign up for a free account
   - Verify your email and phone number

2. **Get Account Credentials**:
   - Log in to Twilio Console: https://console.twilio.com/
   - Navigate to Account → API Keys & Tokens
   - Copy your **Account SID** and **Auth Token**

3. **Set Up WhatsApp Sandbox** (For Testing):
   - Go to: https://console.twilio.com/us1/develop/sms/sandbox
   - Follow instructions to join the sandbox
   - You'll get a WhatsApp number (format: `whatsapp:+14155238886`)

4. **Upgrade to Production** (For Production Use):
   - Apply for WhatsApp Business API access
   - Get approved WhatsApp sender number
   - Complete Twilio verification process

5. **Configure in Firebase Functions**:
   ```bash
   # Set Account SID
   firebase functions:secrets:set TWILIO_ACCOUNT_SID
   # Paste your Account SID when prompted
   
   # Set Auth Token
   firebase functions:secrets:set TWILIO_AUTH_TOKEN
   # Paste your Auth Token when prompted
   
   # Set WhatsApp From Number
   firebase functions:secrets:set TWILIO_WHATSAPP_FROM
   # Paste your WhatsApp number (e.g., whatsapp:+14155238886)
   ```

6. **Verify Configuration**:
   ```bash
   firebase functions:secrets:access TWILIO_ACCOUNT_SID
   firebase functions:secrets:access TWILIO_AUTH_TOKEN
   firebase functions:secrets:access TWILIO_WHATSAPP_FROM
   ```

### Features Using This Service:
- ✅ WhatsApp Messaging (`/sendWhatsApp`)
- ✅ Send messages to multiple users
- ✅ Automatic admin filtering

### Cost:
- **Free Trial**: $15.50 credit for testing
- **WhatsApp Sandbox**: Free for testing (limited)
- **Production Pricing**: 
  - Per message pricing (varies by country)
  - Check: https://www.twilio.com/whatsapp/pricing

### Documentation:
- https://www.twilio.com/docs/whatsapp
- https://www.twilio.com/docs/whatsapp/quickstart

### Important Notes:
- ⚠️ **Sandbox Limitations**: Sandbox numbers can only send to verified numbers
- ⚠️ **Production Setup**: Requires business verification for production use
- ⚠️ **Message Templates**: Initial messages require pre-approved templates

---

## 📧 Email Service

### Status: ⚠️ **Required for Email Features**

Used for sending:
- Welcome emails to new users
- Password reset emails
- Notification emails
- System notifications

### Current Status:
- **Nodemailer** is installed in functions (`functions/package.json`)
- **Email sending functionality** needs to be implemented

### Recommended Services:

#### Option 1: SendGrid (Recommended)
- **Website**: https://sendgrid.com/
- **Free Tier**: 100 emails/day forever
- **Setup**: 
  1. Create account at https://sendgrid.com
  2. Verify sender identity
  3. Create API key
  4. Configure in Firebase Functions

#### Option 2: Mailgun
- **Website**: https://www.mailgun.com/
- **Free Tier**: 5,000 emails/month for 3 months
- **Setup**: Similar to SendGrid

#### Option 3: AWS SES (Amazon Simple Email Service)
- **Website**: https://aws.amazon.com/ses/
- **Free Tier**: 62,000 emails/month (if on EC2)
- **Setup**: Requires AWS account

#### Option 4: Firebase Extensions - Trigger Email
- **Website**: Firebase Extensions
- **Setup**: Install from Firebase Console
- **Note**: Uses SendGrid or Mailgun behind the scenes

### Setup Instructions (Using SendGrid):

1. **Create SendGrid Account**:
   - Visit: https://sendgrid.com/
   - Sign up for free account
   - Verify your email

2. **Create API Key**:
   - Go to Settings → API Keys
   - Click "Create API Key"
   - Name: "Travel Plans App"
   - Permissions: "Full Access" (or "Mail Send" only)
   - Copy the API key (shown only once!)

3. **Verify Sender Identity**:
   - Go to Settings → Sender Authentication
   - Verify Single Sender or Domain
   - Complete verification process

4. **Configure in Firebase Functions**:
   ```bash
   # Set SendGrid API Key
   firebase functions:secrets:set SENDGRID_API_KEY
   # Paste your API key when prompted
   
   # Set From Email (optional, can be hardcoded)
   firebase functions:secrets:set EMAIL_FROM
   # Paste your verified sender email
   ```

5. **Update Functions Code**:
   - Add SendGrid SDK: `npm install @sendgrid/mail` (in functions directory)
   - Implement email sending in functions

### Features Requiring Email:
- ⚠️ Welcome emails (when new user is created)
- ⚠️ Password reset emails (currently using Firebase Auth default)
- ⚠️ Notification emails (future feature)
- ⚠️ System alerts (future feature)

### Cost Comparison:

| Service | Free Tier | Paid Plans |
|---------|-----------|------------|
| **SendGrid** | 100 emails/day | $19.95/month (40K emails) |
| **Mailgun** | 5K/month (3 months) | $35/month (50K emails) |
| **AWS SES** | 62K/month (on EC2) | $0.10 per 1,000 emails |
| **Firebase Extensions** | Varies | Varies by provider |

### Documentation:
- SendGrid: https://docs.sendgrid.com/
- Mailgun: https://documentation.mailgun.com/
- AWS SES: https://docs.aws.amazon.com/ses/

---

## 🔐 Environment Variables & Secrets Summary

### Firebase Functions Secrets (Required):

```bash
# Google AI
firebase functions:secrets:set GOOGLE_AI_API_KEY

# Twilio
firebase functions:secrets:set TWILIO_ACCOUNT_SID
firebase functions:secrets:set TWILIO_AUTH_TOKEN
firebase functions:secrets:set TWILIO_WHATSAPP_FROM

# Email Service (when implemented)
firebase functions:secrets:set SENDGRID_API_KEY  # or MAILGUN_API_KEY
firebase functions:secrets:set EMAIL_FROM
```

### Frontend Environment Variables (Optional):

Create `.env.local` for local development:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=travelplan-grav.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=travelplan-grav
VITE_FIREBASE_STORAGE_BUCKET=travelplan-grav.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
VITE_FUNCTIONS_URL=http://localhost:5001/travelplan-grav/us-central1/api
```

---

## 📊 Service Status Checklist

### ✅ Configured & Active:
- [x] Firebase (Hosting, Auth, Firestore, Functions)
- [x] Google AI API (configured, needs API key)
- [x] Twilio SDK (installed, needs credentials)

### ⚠️ Needs Configuration:
- [ ] Google AI API Key (set secret)
- [ ] Twilio Account SID (set secret)
- [ ] Twilio Auth Token (set secret)
- [ ] Twilio WhatsApp From Number (set secret)
- [ ] Email Service (choose and configure)

### ⚠️ Not Yet Implemented:
- [ ] Email sending functionality (welcome emails)
- [ ] Email sending functionality (notifications)

---

## 🚀 Quick Setup Guide

### 1. Google AI Setup (5 minutes):
```bash
# Get API key from https://aistudio.google.com/app/apikey
firebase functions:secrets:set GOOGLE_AI_API_KEY
```

### 2. Twilio Setup (15 minutes):
```bash
# 1. Create Twilio account
# 2. Get credentials from console
# 3. Set up WhatsApp sandbox
firebase functions:secrets:set TWILIO_ACCOUNT_SID
firebase functions:secrets:set TWILIO_AUTH_TOKEN
firebase functions:secrets:set TWILIO_WHATSAPP_FROM
```

### 3. Email Service Setup (20 minutes):
```bash
# 1. Choose service (SendGrid recommended)
# 2. Create account and verify sender
# 3. Get API key
firebase functions:secrets:set SENDGRID_API_KEY
firebase functions:secrets:set EMAIL_FROM
# 4. Implement email sending in functions
```

### 4. Deploy Functions:
```bash
cd functions
npm install  # Install new dependencies (SendGrid, etc.)
npm run build
cd ..
firebase deploy --only functions
```

---

## 💰 Estimated Monthly Costs

### Development/Testing:
- **Firebase**: Free tier (sufficient for testing)
- **Google AI**: Free tier (limited requests)
- **Twilio**: $15.50 free credit
- **SendGrid**: 100 emails/day free
- **Total**: ~$0/month (within free tiers)

### Production (Small Scale - 1000 users):
- **Firebase**: ~$25-50/month
- **Google AI**: ~$10-30/month (depending on usage)
- **Twilio**: ~$20-50/month (WhatsApp messages)
- **SendGrid**: $19.95/month (40K emails)
- **Total**: ~$75-150/month

### Production (Medium Scale - 10,000 users):
- **Firebase**: ~$100-200/month
- **Google AI**: ~$50-100/month
- **Twilio**: ~$100-200/month
- **SendGrid**: $89.95/month (100K emails)
- **Total**: ~$340-590/month

---

## 🔒 Security Best Practices

1. **Never commit secrets to Git**:
   - Use Firebase Functions secrets
   - Use environment variables for local dev
   - Add `.env.local` to `.gitignore`

2. **Rotate credentials regularly**:
   - Change API keys every 90 days
   - Monitor for unauthorized usage

3. **Limit API key permissions**:
   - Use least privilege principle
   - Restrict API key scopes

4. **Monitor usage**:
   - Set up billing alerts
   - Monitor API usage dashboards
   - Track costs regularly

---

## 📞 Support & Resources

### Firebase:
- **Documentation**: https://firebase.google.com/docs
- **Support**: https://firebase.google.com/support
- **Status**: https://status.firebase.google.com/

### Google AI:
- **Documentation**: https://ai.google.dev/docs
- **Support**: https://ai.google.dev/support
- **Community**: https://github.com/google/generative-ai-docs

### Twilio:
- **Documentation**: https://www.twilio.com/docs
- **Support**: https://support.twilio.com/
- **Status**: https://status.twilio.com/

### SendGrid:
- **Documentation**: https://docs.sendgrid.com/
- **Support**: https://support.sendgrid.com/
- **Status**: https://status.sendgrid.com/

---

## 📝 Notes

- All secrets should be stored in Firebase Functions secrets, not in code
- Test all integrations in development before deploying to production
- Monitor costs and set up billing alerts
- Keep dependencies updated for security patches
- Document any custom configurations or workarounds

---

**Last Updated**: December 2024  
**Maintained By**: Development Team  
**Project**: Travel Plans Application


