# Firebase Emulators Setup Guide

This guide explains how to set up and use Firebase Emulators for local development.

## Prerequisites

1. **Node.js** (v20 or higher recommended)
2. **Firebase CLI**: `npm install -g firebase-tools`
3. **Firebase project**: Already configured (travelplan-grav)

## Quick Start

### 1. Install Dependencies

```bash
npm install
cd functions && npm install && cd ..
```

### 2. Start Emulators

```bash
# Start emulators only
npm run emulators

# Start emulators + dev server together
npm run dev:emulators
```

The emulators will start on:
- **Auth Emulator**: http://localhost:9099
- **Firestore Emulator**: http://localhost:8080
- **Functions Emulator**: http://localhost:5001
- **Storage Emulator**: http://localhost:9199
- **Emulator UI**: http://localhost:4000

### 3. Configure Environment Variables (Optional)

Create `.env.local` in the project root:

```env
# Use emulators (set to 'false' to use production)
VITE_USE_EMULATORS=true

# Override Functions URL if needed
VITE_FUNCTIONS_URL=http://localhost:5001/travelplan-grav/us-central1/api
```

## Running Tests

### Integration Tests

```bash
# Run integration tests against emulators
npm run test:integration
```

### Manual Testing

1. Start emulators: `npm run emulators`
2. In another terminal, start dev server: `npm run dev`
3. The app will automatically connect to emulators in development mode

## Emulator Data

Emulator data is stored in `.firebase/` directory (gitignored). To reset:

```bash
# Stop emulators and delete .firebase directory
rm -rf .firebase
```

## Seeding Test Data

You can seed test data using the scripts in `scripts/`:

```bash
# Create test users
node scripts/createUsers.js

# Seed sample data
node scripts/seedData.ts
```

## Troubleshooting

### Emulators won't start

- Check if ports are already in use
- Ensure Firebase CLI is installed: `firebase --version`
- Try: `firebase emulators:start --only firestore,auth,functions`

### App not connecting to emulators

- Check browser console for connection errors
- Verify `VITE_USE_EMULATORS` is not set to 'false'
- Ensure emulators are running before starting the dev server

### CORS errors

- Emulators handle CORS automatically
- If using production API, ensure CORS is configured in Firebase Functions

## Production vs Emulators

- **Development**: Automatically uses emulators if `VITE_USE_EMULATORS !== 'false'`
- **Production**: Uses production Firebase services
- **Override**: Set `VITE_FUNCTIONS_URL` to force a specific endpoint

## Benefits of Using Emulators

1. ✅ No CORS issues
2. ✅ Fast local development
3. ✅ Safe testing (no production data)
4. ✅ Offline development
5. ✅ Predictable test data




