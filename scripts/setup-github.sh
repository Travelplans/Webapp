#!/bin/bash

# GitHub Repository Setup Script
# This script helps set up the GitHub repository and initial commit

set -e

echo "🚀 Setting up GitHub repository..."
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

# Get the repository URL
REPO_URL="https://github.com/Sabuanchuparayil/TravelplansProduction.git"

# Check if already a git repository
if [ -d ".git" ]; then
    echo "✅ Git repository already initialized"
else
    echo "📦 Initializing git repository..."
    git init
    echo "✅ Git repository initialized"
fi

# Check if remote is already set
if git remote get-url origin &> /dev/null; then
    echo "✅ Remote 'origin' already configured"
    CURRENT_URL=$(git remote get-url origin)
    echo "   Current URL: $CURRENT_URL"
    
    read -p "Do you want to update the remote URL? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git remote set-url origin "$REPO_URL"
        echo "✅ Remote URL updated to: $REPO_URL"
    fi
else
    echo "🔗 Adding remote repository..."
    git remote add origin "$REPO_URL"
    echo "✅ Remote 'origin' added: $REPO_URL"
fi

# Check git status
echo ""
echo "📊 Current git status:"
git status --short

echo ""
read -p "Do you want to add all files and create initial commit? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📝 Adding all files..."
    git add .
    
    echo "💾 Creating initial commit..."
    git commit -m "Initial commit: Travel Plans Production Application

- Enterprise code structure
- Firebase Functions backend
- Comprehensive testing (45+ tests)
- CI/CD pipeline configuration
- Security improvements
- Complete documentation

Features:
- Role-based access control (Admin, Agent, RM, Customer)
- AI-powered itinerary generation
- Customer and booking management
- Real-time data synchronization
- Responsive UI with Tailwind CSS

Tech Stack:
- React 19 + TypeScript
- Firebase (Hosting, Functions, Firestore, Auth)
- Vite build tool
- Jest + React Testing Library
- Zod validation"
    
    echo "✅ Initial commit created"
    echo ""
    echo "📤 Ready to push to GitHub!"
    echo ""
    echo "Next steps:"
    echo "1. Push to GitHub: git push -u origin main"
    echo "2. Set up GitHub Secrets (see GITHUB_SETUP.md)"
    echo "3. Configure Firebase Service Account"
    echo ""
    read -p "Do you want to push to GitHub now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Set default branch to main
        git branch -M main 2>/dev/null || true
        
        echo "📤 Pushing to GitHub..."
        git push -u origin main
        
        echo ""
        echo "✅ Successfully pushed to GitHub!"
        echo "🌐 Repository: $REPO_URL"
        echo ""
        echo "⚠️  IMPORTANT: Don't forget to:"
        echo "1. Set up GitHub Secrets (FIREBASE_SERVICE_ACCOUNT)"
        echo "2. Configure Firebase Service Account"
        echo "3. See GITHUB_SETUP.md for detailed instructions"
    fi
fi

echo ""
echo "✨ Setup complete!"
echo ""
echo "📚 Documentation:"
echo "   - GITHUB_SETUP.md - Complete setup guide"
echo "   - DEPLOYMENT.md - Deployment instructions"
echo "   - NEXT_STEPS.md - Next improvements"

