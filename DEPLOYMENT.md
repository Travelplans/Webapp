# Deployment Guide - Travel Plans Application

## Overview

This application has been restructured to enterprise standards with:
- **Backend API**: Firebase Functions for secure AI operations
- **Frontend**: React/TypeScript application
- **Database**: Firestore
- **Hosting**: Firebase Hosting
- **Authentication**: Firebase Auth

## Project Structure (Enterprise Standard)

```
travelplans.fun/
├── src/
│   ├── app/                    # Application entry point and routing
│   ├── config/                 # Configuration files (Firebase, etc.)
│   ├── features/               # Feature-based modules
│   │   ├── ai/                 # AI features (chatbot, itinerary generation)
│   │   ├── auth/               # Authentication
│   │   ├── itineraries/        # Itinerary management
│   │   ├── customers/          # Customer management
│   │   ├── bookings/           # Booking management
│   │   ├── users/              # User management
│   │   └── dashboard/          # Dashboard views
│   ├── services/               # Service layer
│   │   ├── api/                # API clients (AI service)
│   │   └── firestore/           # Firestore operations
│   ├── shared/                 # Shared code
│   │   ├── components/         # Reusable UI components
│   │   ├── hooks/              # Custom React hooks
│   │   ├── context/            # React contexts
│   │   ├── types/              # TypeScript types
│   │   └── utils/               # Utility functions
│   └── index.tsx               # Entry point
├── functions/                  # Firebase Functions (Backend)
│   ├── src/
│   │   └── index.ts            # Function definitions
│   ├── package.json
│   └── tsconfig.json
├── firebase.json               # Firebase configuration
├── .firebaserc                 # Firebase project configuration
└── firestore.rules             # Firestore security rules
```

## Prerequisites

1. **Node.js** (v20 or higher)
2. **Firebase CLI**: `npm install -g firebase-tools`
3. **Firebase Project**: Already configured (travelplan-grav)
4. **Google AI API Key**: Required for AI features

## Setup Instructions

### 1. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install Firebase Functions dependencies
cd functions
npm install
cd ..
```

### 2. Configure Google AI API Key

Set the Google AI API key in Firebase Functions config:

```bash
firebase functions:config:set googleai.api_key="YOUR_GOOGLE_AI_API_KEY"
```

### 3. Environment Variables (Optional)

Create `.env.local` for local development overrides:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=travelplan-grav
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
VITE_FUNCTIONS_URL=http://localhost:5001/travelplan-grav/us-central1/api  # For local emulator
```

**Note**: The application uses hardcoded production Firebase credentials as defaults, but environment variables will override them.

### 4. Local Development

```bash
# Start Firebase emulators (optional, for local testing)
firebase emulators:start

# Start frontend development server
npm run dev
```

### 5. Build for Production

```bash
npm run build
```

This creates the `dist/` directory with production-ready files.

## Deployment

### Deploy Everything

```bash
npm run deploy:all
```

### Deploy Individual Services

```bash
# Deploy only hosting
npm run deploy:hosting

# Deploy only functions
npm run deploy:functions

# Deploy Firestore rules
firebase deploy --only firestore:rules
```

### Manual Deployment Steps

1. **Build Frontend**:
   ```bash
   npm run build
   ```

2. **Build Functions**:
   ```bash
   cd functions
   npm install
   npm run build
   cd ..
   ```

3. **Deploy**:
   ```bash
   firebase deploy
   ```

## API Endpoints

All AI operations are handled through Firebase Functions:

- `POST /api/generateItinerary` - Generate travel itinerary
- `POST /api/generateImage` - Generate destination image
- `POST /api/chat` - Chat with AI assistant

All endpoints require Firebase Auth token in the `Authorization: Bearer <token>` header.

## Security Features

1. **API Keys**: Google AI API key stored server-side only
2. **Authentication**: All API endpoints require Firebase Auth
3. **Firestore Rules**: Role-based access control
4. **CORS**: Configured for secure cross-origin requests

## Migration Notes

### Removed Client-Side Dependencies

- `@google/genai` - Removed from client, now used only in Firebase Functions
- All AI operations now go through secure backend API

### New Structure Benefits

1. **Separation of Concerns**: Clear separation between frontend and backend
2. **Security**: API keys never exposed to client
3. **Scalability**: Backend functions can be scaled independently
4. **Maintainability**: Feature-based organization makes code easier to navigate
5. **Enterprise Standards**: Follows industry best practices for React applications

## Troubleshooting

### Functions Not Deploying

- Ensure Node.js version matches `functions/package.json` engines requirement (v20)
- Check that `functions/lib/` directory exists after build
- Verify Firebase project is set: `firebase use travelplan-grav`

### API Calls Failing

- Verify Google AI API key is set: `firebase functions:config:get`
- Check browser console for authentication errors
- Ensure user is logged in before making AI requests

### Build Errors

- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf node_modules/.vite`
- Check TypeScript errors: `npx tsc --noEmit`

## Next Steps

1. Complete migration of remaining components to new structure
2. Update all import paths to use new structure
3. Add comprehensive error handling
4. Implement rate limiting on Functions
5. Add monitoring and logging
6. Set up CI/CD pipeline

