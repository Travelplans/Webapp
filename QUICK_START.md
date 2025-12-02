# Quick Start Guide - GitHub & Firebase Deployment

## 🚀 Fast Setup (5 Minutes)

### Step 1: Initialize Git Repository

```bash
cd "/Users/apple/Desktop/Travel Plans/travelplans Source code /Travelplan1 -final/travelplans Source code /travelplans.fun"

# Option A: Use the setup script (Recommended)
./scripts/setup-github.sh

# Option B: Manual setup
git init
git add .
git commit -m "Initial commit: Travel Plans Production Application"
git branch -M main
git remote add origin https://github.com/Sabuanchuparayil/TravelplansProduction.git
git push -u origin main
```

### Step 2: Get Firebase Service Account

**Method 1: Firebase Console (Recommended)**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **travelplan-grav**
3. Click ⚙️ **Project Settings**
4. Go to **Service Accounts** tab
5. Click **Generate New Private Key**
6. Save the JSON file (keep it secure!)

**Method 2: Firebase CLI Token (Alternative)**

```bash
firebase login
firebase login:ci
# Copy the token that appears
```

### Step 3: Configure GitHub Secrets

1. Go to: https://github.com/Sabuanchuparayil/TravelplansProduction/settings/secrets/actions
2. Click **New repository secret**
3. Add these secrets:

   **Secret 1: FIREBASE_SERVICE_ACCOUNT**
   - Name: `FIREBASE_SERVICE_ACCOUNT`
   - Value: Paste entire contents of the JSON file from Step 2

   **Secret 2: FIREBASE_TOKEN** (if using token method)
   - Name: `FIREBASE_TOKEN`
   - Value: Token from `firebase login:ci`

### Step 4: Verify Deployment

1. Go to: https://github.com/Sabuanchuparayil/TravelplansProduction/actions
2. You should see the CI/CD pipeline running
3. Once complete, visit: https://travelplan-grav.firebaseapp.com

## ✅ Verification Checklist

- [ ] Code pushed to GitHub
- [ ] GitHub Secrets configured
- [ ] CI/CD pipeline running
- [ ] Application deployed to Firebase
- [ ] Application accessible at Firebase URL

## 🎯 What Happens Next?

### Automatic Deployment

Every time you push to the `main` branch:
1. ✅ Tests run automatically
2. ✅ Application builds
3. ✅ Deploys to Firebase automatically

### Manual Deployment

You can also deploy manually:
- Via GitHub Actions: Go to Actions → Deploy to Firebase → Run workflow
- Via CLI: `npm run deploy:all`

## 🔧 Troubleshooting

### "Firebase authentication failed"
- ✅ Verify `FIREBASE_SERVICE_ACCOUNT` secret is set correctly
- ✅ Check that JSON is valid (no extra spaces)
- ✅ Ensure service account has proper permissions

### "Build failed"
- ✅ Check GitHub Actions logs
- ✅ Verify Node.js version (should be 20+)
- ✅ Run tests locally: `npm test`

### "Deployment failed"
- ✅ Verify Firebase project ID: `travelplan-grav`
- ✅ Check Firebase Console for errors
- ✅ Review GitHub Actions logs

## 📚 More Information

- **Detailed Setup**: See [GITHUB_SETUP.md](./GITHUB_SETUP.md)
- **Deployment Guide**: See [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Next Steps**: See [NEXT_STEPS.md](./NEXT_STEPS.md)

## 🎉 Success!

Once deployed, your application will be available at:
- **Production URL**: https://travelplan-grav.firebaseapp.com
- **Firebase Console**: https://console.firebase.google.com/project/travelplan-grav

---

**Need Help?** Check the documentation files or review GitHub Actions logs for detailed error messages.

