#!/bin/bash

# Firebase Deployment Script
# This script builds and deploys the application to Firebase

set -e

echo "🚀 Firebase Deployment Script"
echo "=============================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Firebase CLI is available
if ! command -v firebase &> /dev/null && ! command -v npx &> /dev/null; then
    echo -e "${RED}❌ Firebase CLI not found. Installing...${NC}"
    npm install -g firebase-tools
fi

# Use npx if firebase command not available
FIREBASE_CMD="firebase"
if ! command -v firebase &> /dev/null; then
    FIREBASE_CMD="npx firebase-tools"
fi

echo -e "${GREEN}✅ Step 1: Building Frontend...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Frontend build failed!${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Step 2: Checking Firebase Authentication...${NC}"

# Check if user is logged in
if ! $FIREBASE_CMD projects:list &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not authenticated with Firebase${NC}"
    echo ""
    echo "Please authenticate with Firebase:"
    echo "  $FIREBASE_CMD login"
    echo ""
    echo "Or if using npx:"
    echo "  npx firebase-tools login"
    echo ""
    read -p "Do you want to login now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        $FIREBASE_CMD login
    else
        echo -e "${RED}❌ Authentication required. Exiting.${NC}"
        exit 1
    fi
fi

echo ""
echo -e "${GREEN}✅ Step 3: Setting Firebase Project...${NC}"
$FIREBASE_CMD use travelplan-grav

echo ""
echo -e "${GREEN}✅ Step 4: Deploying to Firebase...${NC}"
echo ""
echo "Deploying:"
echo "  📦 Firebase Hosting (Frontend)"
echo "  🔒 Firestore Rules (Security)"
echo ""

# Deploy hosting and firestore rules
$FIREBASE_CMD deploy --only hosting,firestore:rules

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Deployment Successful!${NC}"
    echo ""
    echo "🌐 Your application is live at:"
    echo "   https://travelplan-grav.firebaseapp.com"
    echo ""
    echo "📊 Firebase Console:"
    echo "   https://console.firebase.google.com/project/travelplan-grav"
    echo ""
else
    echo -e "${RED}❌ Deployment failed!${NC}"
    exit 1
fi

# Ask about functions deployment
echo ""
read -p "Do you want to deploy Firebase Functions? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${GREEN}✅ Step 5: Building Functions...${NC}"
    cd functions
    npm install
    npm run build
    cd ..
    
    echo ""
    echo -e "${GREEN}✅ Deploying Functions...${NC}"
    $FIREBASE_CMD deploy --only functions
    
    if [ $? -eq 0 ]; then
        echo ""
        echo -e "${GREEN}✅ Functions deployed successfully!${NC}"
    else
        echo -e "${YELLOW}⚠️  Functions deployment had issues. Check the errors above.${NC}"
    fi
fi

echo ""
echo -e "${GREEN}✨ Deployment Complete!${NC}"

