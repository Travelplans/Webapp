# 🚀 Deploy Firebase Cloud Functions

## Quick Deploy Commands

### Option 1: Using npm script (Recommended)
```bash
npm run deploy:functions
```

### Option 2: Manual deployment
```bash
cd functions
npm install
npm run build
firebase deploy --only functions
```

## Prerequisites

1. **Firebase CLI installed and authenticated:**
   ```bash
   npx firebase-tools login
   npx firebase-tools use travelplan-grav
   ```

2. **Required secrets configured:**
   The Cloud Functions require the following secrets to be set:
   ```bash
   # Google AI API Key (required for AI features)
   firebase functions:secrets:set GOOGLE_AI_API_KEY
   
   # Twilio credentials (required for WhatsApp features)
   firebase functions:secrets:set TWILIO_ACCOUNT_SID
   firebase functions:secrets:set TWILIO_AUTH_TOKEN
   firebase functions:secrets:set TWILIO_WHATSAPP_FROM
   ```

## Step-by-Step Deployment

### Step 1: Navigate to project directory
```bash
cd "/Users/apple/Desktop/Travel Plans/travelplans Source code /Travelplan1 -final/travelplans Source code /travelplans.fun"
```

### Step 2: Install dependencies
```bash
cd functions
npm install
cd ..
```

### Step 3: Build functions
```bash
cd functions
npm run build
cd ..
```

### Step 4: Deploy functions
```bash
firebase deploy --only functions --project travelplan-grav
```

## Verify Deployment

1. **Check Firebase Console:**
   - Visit: https://console.firebase.google.com/project/travelplan-grav/functions
   - Verify all functions are listed and active

2. **Check function logs:**
   ```bash
   firebase functions:log --project travelplan-grav
   ```

3. **Test the endpoint:**
   - The function should be available at:
   - `https://us-central1-travelplan-grav.cloudfunctions.net/api/generateItinerary`

## Troubleshooting

### Error: "Function failed to deploy"
- Check that all secrets are set
- Verify Node.js version (should be 20)
- Check function logs for errors

### Error: "Cannot connect to Cloud Function"
- Verify the function is deployed in Firebase Console
- Check that the function URL is correct
- Ensure CORS is properly configured

### Error: "Google AI API key not configured"
- Set the secret: `firebase functions:secrets:set GOOGLE_AI_API_KEY`
- Redeploy the functions after setting secrets

## Required Secrets

Before deploying, ensure these secrets are set:

```bash
# Set Google AI API Key
firebase functions:secrets:set GOOGLE_AI_API_KEY

# Set Twilio credentials (if using WhatsApp features)
firebase functions:secrets:set TWILIO_ACCOUNT_SID
firebase functions:secrets:set TWILIO_AUTH_TOKEN
firebase functions:secrets:set TWILIO_WHATSAPP_FROM
```

## Functions Deployed

The following Cloud Functions will be deployed:

- ✅ `/api/generateItinerary` - Generate travel itineraries using AI
- ✅ `/api/generateImage` - Generate images using AI
- ✅ `/api/chat` - Chat with AI assistant
- ✅ `/api/createUser` - Create new users
- ✅ `/api/updateUserPassword` - Update user passwords
- ✅ `/api/sendWhatsApp` - Send WhatsApp messages

## After Deployment

Once deployed, the AI itinerary generation feature should work. Test it by:
1. Going to the "Generate Itinerary" page
2. Filling in the form (destination, duration, etc.)
3. Clicking "Generate Itinerary"
4. The function should now connect successfully





