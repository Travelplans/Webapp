# Travel Plans Production Application

A scalable, secure, role-based portal for Travelplans.fun to manage itineraries, customers, and agents, with AI-powered features for itinerary generation and customer assistance.

[![CI/CD Pipeline](https://github.com/Sabuanchuparayil/TravelplansProduction/actions/workflows/ci.yml/badge.svg)](https://github.com/Sabuanchuparayil/TravelplansProduction/actions/workflows/ci.yml)
[![Firebase](https://img.shields.io/badge/Firebase-Hosted-orange)](https://travelplan-grav.firebaseapp.com)

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Firebase CLI (`npm install -g firebase-tools`)
- Google AI API Key

### Installation

```bash
# Install dependencies
npm install

# Install Firebase Functions dependencies
cd functions && npm install && cd ..
```

### Configuration

1. **Set Google AI API Key** (Required for AI features):
   ```bash
   firebase functions:config:set googleai.api_key="YOUR_GOOGLE_AI_API_KEY"
   ```

2. **Optional**: Create `.env.local` for local development overrides

### Development

```bash
# Start development server
npm run dev

# Start Firebase emulators (optional)
firebase emulators:start
```

### Build & Deploy

```bash
# Build for production
npm run build

# Deploy everything
npm run deploy:all

# Or deploy individually
npm run deploy:hosting    # Frontend only
npm run deploy:functions # Backend only
```

## 📁 Project Structure

```
src/
├── app/              # Application entry & routing
├── config/           # Configuration (Firebase)
├── features/         # Feature modules
│   ├── ai/          # AI features
│   ├── auth/        # Authentication
│   ├── itineraries/ # Itinerary management
│   └── ...
├── services/        # Service layer
│   ├── api/         # API clients
│   └── firestore/   # Database operations
└── shared/          # Shared code
    ├── components/  # Reusable UI
    ├── hooks/       # React hooks
    └── types/       # TypeScript types

functions/           # Firebase Functions (Backend)
└── src/
    └── index.ts     # API endpoints
```

## 🔐 Security

- ✅ API keys stored server-side only
- ✅ All AI operations authenticated
- ✅ Role-based access control
- ✅ Firestore security rules
- ✅ Rate limiting on API endpoints

## 🧪 Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

**Test Coverage:**
- 45+ unit tests
- 5 business flow integration tests
- Component testing
- Utility function testing
- API service testing

## 🚢 Deployment

### Automated Deployment (CI/CD)

The application uses GitHub Actions for automated deployment:

- **On Push to Main**: Automatically runs tests and deploys to Firebase
- **On Pull Request**: Runs tests and builds (no deployment)
- **Manual Deployment**: Available via GitHub Actions workflow

See [GITHUB_SETUP.md](./GITHUB_SETUP.md) for setup instructions.

### Manual Deployment

```bash
# Deploy everything
npm run deploy:all

# Deploy specific services
npm run deploy:hosting
npm run deploy:functions
firebase deploy --only firestore:rules
```

## 📚 Documentation

- [GITHUB_SETUP.md](./GITHUB_SETUP.md) - GitHub repository setup
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide
- [TESTING.md](./TESTING.md) - Testing guide
- [NEXT_STEPS.md](./NEXT_STEPS.md) - Production readiness roadmap
- [BUSINESS_FLOW_TESTS.md](./BUSINESS_FLOW_TESTS.md) - Business flow testing

## 🌐 Live Application

- **Production URL**: https://travelplan-grav.firebaseapp.com
- **Firebase Console**: https://console.firebase.google.com/project/travelplan-grav
- **GitHub Repository**: https://github.com/Sabuanchuparayil/TravelplansProduction

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS
- **Backend**: Firebase Functions (Node.js)
- **Database**: Firestore
- **Authentication**: Firebase Auth
- **Hosting**: Firebase Hosting
- **AI**: Google Gemini API
- **Testing**: Jest, React Testing Library
- **CI/CD**: GitHub Actions

## 👥 User Roles

- **Admin**: Full system access, user management
- **Agent**: Customer and booking management
- **Relationship Manager**: Assigned customer management
- **Customer**: Personal dashboard and documents

## 🔧 Available Scripts

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run test             # Run tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report
npm run lint             # Run linter
npm run type-check       # TypeScript type checking
npm run deploy:all       # Deploy everything
npm run deploy:hosting   # Deploy frontend only
npm run deploy:functions # Deploy backend only
```

## 📝 License

This project is proprietary software for Travelplans.fun

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run tests: `npm test`
4. Submit a pull request

## 📞 Support

For issues or questions:
- Check [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment issues
- Review [TESTING.md](./TESTING.md) for testing questions
- See [NEXT_STEPS.md](./NEXT_STEPS.md) for improvements

---

**Built with ❤️ for Travelplans.fun**
