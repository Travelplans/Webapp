# Deploy to Firebase Now 🚀

## Quick Deployment Guide

### Option 1: Automated Script (Recommended)

```bash
cd "/Users/apple/Desktop/Travel Plans/travelplans Source code /Travelplan1 -final/travelplans Source code /travelplans.fun"
./scripts/deploy-firebase.sh
```

The script will:
1. ✅ Build the frontend
2. ✅ Check Firebase authentication
3. ✅ Deploy hosting and Firestore rules
4. ✅ Optionally deploy functions

### Option 2: Manual Deployment

#### Step 1: Authenticate with Firebase

```bash
# Login to Firebase
npx firebase-tools login

# Or if firebase-tools is installed globally
firebase login
```

This will open a browser window for authentication.

#### Step 2: Build the Application

```bash
# Build frontend
npm run build
```

#### Step 3: Deploy

```bash
# Deploy hosting and Firestore rules
npx firebase-tools deploy --only hosting,firestore:rules --project travelplan-grav

# Or deploy everything (including functions)
npx firebase-tools deploy --project travelplan-grav
```

### Option 3: Using npm Scripts

```bash
# Deploy everything
npm run deploy:all

# Deploy only hosting
npm run deploy:hosting

# Deploy only functions
npm run deploy:functions
```

## 🔐 Firebase Authentication

If you see "Failed to authenticate" error:

1. **Login to Firebase:**
   ```bash
   npx firebase-tools login
   ```

2. **Verify login:**
   ```bash
   npx firebase-tools projects:list
   ```

3. **Set project:**
   ```bash
   npx firebase-tools use travelplan-grav
   ```

## 📦 What Gets Deployed

- **Firebase Hosting**: Frontend application (React app)
- **Firestore Rules**: Database security rules
- **Firebase Functions**: Backend API (optional, if functions build succeeds)

## ✅ Verification

After deployment:

1. **Check Hosting:**
   - Visit: https://travelplan-grav.firebaseapp.com
   - Should see your application

2. **Check Firebase Console:**
   - Go to: https://console.firebase.google.com/project/travelplan-grav
   - Check Hosting, Firestore, and Functions sections

3. **Check Deployment Status:**
   ```bash
   npx firebase-tools hosting:channel:list
   ```

## 🐛 Troubleshooting

### "Failed to authenticate"
- Run: `npx firebase-tools login`
- Make sure you're logged into the correct Google account
- Check that you have access to the `travelplan-grav` project

### "Build failed"
- Check Node.js version: `node --version` (should be 20+)
- Clear cache: `rm -rf node_modules/.vite`
- Reinstall: `rm -rf node_modules && npm install`

### "Functions build errors"
- Functions have TypeScript errors that need fixing
- You can deploy without functions: `--only hosting,firestore:rules`
- Fix TypeScript errors in `functions/src/` and rebuild

### "Permission denied"
- Make sure you have Editor or Owner role in Firebase project
- Check Firebase Console → Project Settings → Users and permissions

## 🎯 Quick Commands Reference

```bash
# Login
npx firebase-tools login

# List projects
npx firebase-tools projects:list

# Set project
npx firebase-tools use travelplan-grav

# Deploy hosting only
npx firebase-tools deploy --only hosting

# Deploy everything
npx firebase-tools deploy

# View deployment history
npx firebase-tools hosting:channel:list
```

## 📚 More Information

- **Detailed Setup**: See [GITHUB_SETUP.md](./GITHUB_SETUP.md)
- **Deployment Guide**: See [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Troubleshooting**: See [DEPLOYMENT.md](./DEPLOYMENT.md#troubleshooting)

---

**Ready to deploy?** Run: `./scripts/deploy-firebase.sh`

