# GitHub Repository Setup Guide

## Repository: [TravelplansProduction](https://github.com/Sabuanchuparayil/TravelplansProduction)

This guide will help you set up the GitHub repository and configure automated Firebase deployment.

## Prerequisites

1. GitHub account with access to the repository
2. Firebase project: `travelplan-grav`
3. Firebase CLI installed locally
4. Node.js 20+ installed

## Step 1: Initialize Git Repository

If the repository is not already initialized:

```bash
cd "/Users/apple/Desktop/Travel Plans/travelplans Source code /Travelplan1 -final/travelplans Source code /travelplans.fun"

# Initialize git (if not already done)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Travel Plans Production Application

- Enterprise code structure
- Firebase Functions backend
- Comprehensive testing (45+ tests)
- CI/CD pipeline configuration
- Security improvements
- Complete documentation"
```

## Step 2: Connect to GitHub Repository

```bash
# Add remote repository
git remote add origin https://github.com/Sabuanchuparayil/TravelplansProduction.git

# Verify remote
git remote -v

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 3: Set Up Firebase Service Account

### Option A: Using Firebase CLI (Recommended)

1. **Get Firebase Service Account Key:**
   ```bash
   # Login to Firebase
   firebase login
   
   # Generate service account key
   firebase projects:list
   firebase projects:get travelplan-grav
   ```

2. **Download Service Account JSON:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select project: `travelplan-grav`
   - Go to Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Save the JSON file securely

### Option B: Using Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select project: `travelplan-grav`
3. Go to IAM & Admin → Service Accounts
4. Create or select service account
5. Add roles:
   - Firebase Admin
   - Cloud Functions Admin
   - Firestore Admin
6. Create key (JSON format)

## Step 4: Configure GitHub Secrets

1. Go to your GitHub repository: https://github.com/Sabuanchuparayil/TravelplansProduction
2. Navigate to: **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add the following secrets:

### Required Secrets:

**`FIREBASE_SERVICE_ACCOUNT`**
- Name: `FIREBASE_SERVICE_ACCOUNT`
- Value: Paste the entire contents of your Firebase service account JSON file
- This is used for Firebase authentication in CI/CD

**`FIREBASE_TOKEN`** (Alternative method)
- Name: `FIREBASE_TOKEN`
- Value: Get by running `firebase login:ci` locally
- This is an alternative authentication method

**Optional (if using environment variables):**
- `GOOGLE_AI_API_KEY` - For AI features (if not using Firebase config)
- `FIREBASE_API_KEY` - If needed for specific configurations

### Getting Firebase Token (Alternative Method)

If you prefer using Firebase token instead of service account:

```bash
# Login to Firebase
firebase login

# Get CI token
firebase login:ci

# Copy the token and add it as FIREBASE_TOKEN secret
```

## Step 5: Verify GitHub Actions Workflow

The CI/CD pipeline is configured in:
- `.github/workflows/ci.yml` - Automated testing and deployment
- `.github/workflows/deploy.yml` - Manual deployment workflow

### Workflow Features:

1. **Automated Testing:**
   - Runs on every push and PR
   - Executes linting, type checking, and tests
   - Generates coverage reports

2. **Automated Deployment:**
   - Deploys to Firebase on push to `main` branch
   - Deploys hosting, functions, and Firestore rules
   - Only runs after tests pass

3. **Manual Deployment:**
   - Can be triggered manually via GitHub Actions
   - Supports staging and production environments

## Step 6: First Deployment

### Automatic Deployment (After Push)

Once you push to the `main` branch, the CI/CD pipeline will:
1. Run all tests
2. Build the application
3. Deploy to Firebase automatically

### Manual Deployment

You can also deploy manually:

```bash
# Build and deploy locally
npm run deploy:all

# Or use GitHub Actions
# Go to Actions tab → Deploy to Firebase → Run workflow
```

## Step 7: Verify Deployment

After deployment, verify:

1. **Hosting:**
   - Visit: https://travelplan-grav.firebaseapp.com
   - Check if the application loads correctly

2. **Functions:**
   - Check Firebase Console → Functions
   - Verify all functions are deployed

3. **Firestore Rules:**
   - Check Firebase Console → Firestore → Rules
   - Verify rules are deployed

## Step 8: Set Up Branch Protection (Optional but Recommended)

1. Go to **Settings** → **Branches**
2. Add rule for `main` branch:
   - ✅ Require pull request reviews
   - ✅ Require status checks to pass
   - ✅ Require branches to be up to date
   - ✅ Include administrators

## Troubleshooting

### Issue: "Firebase authentication failed"

**Solution:**
- Verify `FIREBASE_SERVICE_ACCOUNT` secret is correctly set
- Ensure the service account has proper permissions
- Check that the JSON is valid

### Issue: "Build failed"

**Solution:**
- Check GitHub Actions logs
- Verify Node.js version (should be 20+)
- Ensure all dependencies are installed

### Issue: "Deployment failed"

**Solution:**
- Verify Firebase project ID is correct (`travelplan-grav`)
- Check Firebase service account permissions
- Review Firebase Console for error messages

### Issue: "Tests failing"

**Solution:**
- Run tests locally: `npm test`
- Check test coverage: `npm run test:coverage`
- Review test logs in GitHub Actions

## Repository Structure

```
TravelplansProduction/
├── .github/
│   └── workflows/
│       ├── ci.yml          # CI/CD pipeline
│       └── deploy.yml      # Manual deployment
├── src/                    # Application source code
├── functions/              # Firebase Functions
├── firebase.json          # Firebase configuration
├── .firebaserc           # Firebase project config
├── firestore.rules       # Firestore security rules
└── package.json          # Dependencies
```

## Next Steps

1. ✅ Push code to GitHub
2. ✅ Configure GitHub Secrets
3. ✅ Verify CI/CD pipeline works
4. ✅ Test deployment
5. ✅ Set up monitoring
6. ✅ Configure domain (if needed)

## Useful Commands

```bash
# Check git status
git status

# Add changes
git add .

# Commit changes
git commit -m "Your commit message"

# Push to GitHub
git push origin main

# View GitHub Actions
# Go to: https://github.com/Sabuanchuparayil/TravelplansProduction/actions

# Check deployment status
firebase hosting:channel:list
```

## Support

For issues or questions:
- Check GitHub Actions logs
- Review Firebase Console
- See `DEPLOYMENT.md` for deployment details
- See `NEXT_STEPS.md` for additional improvements

---

**Repository URL:** https://github.com/Sabuanchuparayil/TravelplansProduction

**Firebase Project:** travelplan-grav

**Application URL:** https://travelplan-grav.firebaseapp.com

