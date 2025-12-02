# Setup Instructions

## Quick Start

### 1. Install Dependencies

```bash
npm install
cd functions && npm install && cd ..
```

### 2. Set Google AI API Key

The API key is already configured in the code with a fallback, but for production, set it in Firebase Functions config:

```bash
# Option 1: Use the provided script
./scripts/setApiKey.sh

# Option 2: Manual setup
firebase functions:config:set googleai.api_key="AIzaSyB3KV5eVIeZIcASF0IpR0r958MOnvisHdc"
```

### 3. Update Vite Config

Update `vite.config.ts` to point to the new entry point:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
  },
})
```

### 4. Update index.html

Update `index.html` to point to the new entry:

```html
<script type="module" src="/src/index.tsx"></script>
```

### 5. Development

```bash
npm run dev
```

### 6. Build & Deploy

```bash
# Build
npm run build

# Deploy everything
npm run deploy:all

# Or deploy individually
npm run deploy:hosting
npm run deploy:functions
```

## Migration Status

Files have been copied to the new structure, but import paths still need to be updated. See `MIGRATION_STATUS.md` for details.

## Important Notes

1. **Old files still exist** - The original files in `pages/`, `components/`, `context/`, `hooks/` are still present. They can be removed after verifying the new structure works.

2. **Import paths need updating** - All files in `src/` need their import paths updated to match the new structure.

3. **API Key** - The Google AI API key is hardcoded as a fallback in `functions/src/index.ts`. For production, use Firebase Functions config.

4. **Firebase Credentials** - Already configured in `src/config/firebase.ts` with production defaults.

## Next Steps

1. Update all import paths in migrated files
2. Test the application
3. Remove old files once verified
4. Deploy to Firebase

