# User Creation Guide

## Users to Create

The following users are configured in the seed scripts:

1. **Admin User**
   - Email: `mail@jsabu.com`
   - Password: `Admin123`
   - Role: Admin

2. **Travel Agent**
   - Email: `agent@travelplans.fun`
   - Password: `Agent@123`
   - Role: Agent

3. **Customer User**
   - Email: `customer@travelplans.fun`
   - Password: `Customer@123`
   - Role: Customer

4. **Relationship Manager**
   - Email: `rm@travelplans.fun`
   - Password: `RM@123`
   - Role: Relationship Manager

## Methods to Create Users

### Method 1: Using HTML Script (Easiest - Recommended)

1. Open `scripts/createUsers.html` in your browser
2. Click the "Create Users" button
3. The script will create all users automatically

**Note:** Make sure Email/Password authentication is enabled in Firebase Console:
- Go to Firebase Console → Authentication → Sign-in method
- Enable "Email/Password"

### Method 2: Using Node.js Script

```bash
# Make sure you're in the project root
node scripts/createUsers.js
```

**Note:** This requires the script to be run in an environment that supports ES modules.

### Method 3: Using Firebase Admin SDK (Requires Service Account)

If you have Firebase Admin credentials set up:

```bash
node scripts/seedAuth.js
```

This requires:
- `GOOGLE_APPLICATION_CREDENTIALS` environment variable set, OR
- Service account key file

### Method 4: Manual Creation via Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select project: `travelplan-grav`
3. Navigate to **Authentication** → **Users**
4. Click **Add user** for each user
5. After creating in Auth, go to **Firestore** → **users** collection
6. Create a document with the Auth UID and add:
   ```json
   {
     "id": "<auth-uid>",
     "name": "Admin User",
     "email": "mail@jsabu.com",
     "roles": ["Admin"]
   }
   ```

## After Creating Users

Once users are created, you can:
1. Log in to the application at http://localhost:5173
2. Use the admin account to create more users via the UI
3. Test all features with different role permissions

## Troubleshooting

- **"Email already in use"**: User already exists, skip or use different email
- **"Permission denied"**: Check Firestore security rules
- **"Auth method not enabled"**: Enable Email/Password in Firebase Console

