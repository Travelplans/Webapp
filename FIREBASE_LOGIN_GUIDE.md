# Firebase Login Guide

## 🔐 Running Firebase Login

When you run `npx firebase-tools login` in your terminal, here's what happens:

### Step-by-Step Process

1. **Command Execution:**
   ```bash
   npx firebase-tools login
   ```

2. **Browser Opens:**
   - A browser window will automatically open
   - You'll see a Firebase authorization page

3. **Sign In:**
   - Sign in with your Google account
   - **Important**: Use the Google account that has access to the `travelplan-grav` Firebase project

4. **Grant Permissions:**
   - Click "Allow" to grant Firebase CLI permissions
   - This allows the CLI to manage your Firebase projects

5. **Success Message:**
   - You'll see: `✅ Success! Logged in as your-email@gmail.com`
   - The terminal will show your authentication status

### What to Expect

**Terminal Output:**
```
? Allow Firebase to collect anonymous CLI usage and error reporting information? (Y/n)
```

You can type `Y` or `n` (recommended: `Y` for better support)

Then you'll see:
```
Visit this URL on this device to log in:
https://accounts.google.com/o/oauth2/auth?...
```

After completing browser authentication:
```
✅ Success! Logged in as your-email@gmail.com
```

## ✅ After Successful Login

### Verify Authentication

```bash
npx firebase-tools projects:list
```

You should see:
```
✔ Preparing the list of your Firebase projects
┌─────────────────────┬──────────────────────────────┐
│ Project Display Name │ Project ID                   │
├─────────────────────┼──────────────────────────────┤
│ Travel Plans         │ travelplan-grav              │
└─────────────────────┴──────────────────────────────┘
```

### Set Active Project

```bash
npx firebase-tools use travelplan-grav
```

Output:
```
✔ Now using project travelplan-grav
```

### Deploy to Firebase

Now you can deploy:

```bash
# Deploy hosting and Firestore rules
npx firebase-tools deploy --only hosting,firestore:rules
```

Or use the deployment script:
```bash
./scripts/deploy-firebase.sh
```

## 🔧 Troubleshooting

### Browser Doesn't Open

If the browser doesn't open automatically:

1. **Copy the URL** shown in the terminal
2. **Paste it** into your browser manually
3. Complete the authentication

### Wrong Google Account

If you signed in with the wrong account:

```bash
# Logout
npx firebase-tools logout

# Login again
npx firebase-tools login
```

### "Permission Denied" Error

If you get permission errors:

1. Check Firebase Console: https://console.firebase.google.com
2. Go to Project Settings → Users and permissions
3. Verify your account has Editor or Owner role
4. If not, ask project owner to add you

### "Project Not Found"

If `travelplan-grav` doesn't appear in projects list:

1. Verify you have access to the project
2. Check Firebase Console
3. Make sure you're using the correct Google account

## 🚀 Quick Deployment After Login

Once logged in, run these commands:

```bash
# 1. Set project
npx firebase-tools use travelplan-grav

# 2. Deploy
npx firebase-tools deploy --only hosting,firestore:rules
```

## 📝 Alternative: CI Token (For Automation)

If you want to automate deployments without interactive login:

```bash
# Generate CI token
npx firebase-tools login:ci

# This will:
# 1. Open browser for authentication
# 2. Generate a token
# 3. Display the token in terminal

# Save the token securely
# Use it in scripts or CI/CD pipelines
```

## ✅ Verification Checklist

After login, verify:

- [ ] `npx firebase-tools projects:list` shows `travelplan-grav`
- [ ] `npx firebase-tools use travelplan-grav` succeeds
- [ ] Ready to deploy

## 🎯 Next Steps

1. ✅ Complete Firebase login (in your terminal)
2. ✅ Verify authentication
3. ✅ Set project: `npx firebase-tools use travelplan-grav`
4. ✅ Deploy: `npx firebase-tools deploy --only hosting,firestore:rules`

---

**Run the login command in your terminal now:**
```bash
npx firebase-tools login
```

Then follow the browser prompts to complete authentication! 🚀





