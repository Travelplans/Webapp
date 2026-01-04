# Quick Guide: Seed Users for Testing
## Issue: Login fails because users don't exist in Firebase Auth

## 🚀 Quick Solution (Choose One)

### Option 1: Firebase Console (Easiest - 5 minutes)

1. **Go to Firebase Console**
   - URL: https://console.firebase.google.com
   - Select project: `travelplan-grav`

2. **Navigate to Authentication**
   - Click "Authentication" in left sidebar
   - Click "Users" tab

3. **Add Users Manually**
   Click "Add user" for each:

   **Admin User:**
   - Email: `mail@jsabu.com`
   - Password: `Admin123`
   - Click "Add user"

   **Agent User:**
   - Email: `agent@travelplans.fun`
   - Password: `Agent@123`
   - Click "Add user"

   **Customer User:**
   - Email: `customer@travelplans.fun`
   - Password: `Customer@123`
   - Click "Add user"

   **RM User:**
   - Email: `rm@travelplans.fun`
   - Password: `RM@123`
   - Click "Add user"

4. **Create Firestore Documents**
   After creating users, you need to create their Firestore documents:
   
   - Go to Firestore Database
   - Create collection: `users`
   - For each user, create a document with their UID:
     ```
     Document ID: [User's UID from Auth]
     Fields:
       - name: "Admin User" (or appropriate name)
       - email: "mail@jsabu.com" (or appropriate email)
       - roles: ["Admin"] (or appropriate role array)
     ```

---

### Option 2: Using Seed Script (Requires Setup)

**Prerequisites:**
- Node.js installed
- Firebase Admin SDK credentials

**Steps:**

1. **Get Service Account Key**
   - Go to Firebase Console → Project Settings → Service Accounts
   - Click "Generate new private key"
   - Save the JSON file

2. **Set Environment Variable**
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account-key.json"
   ```

3. **Run Seed Script**
   ```bash
   cd "/Users/apple/Desktop/Travel Plans/travelplans Source code /Travelplan1 -final/travelplans Source code /travelplans.fun"
   node scripts/seedAuth.js
   ```

4. **Verify**
   - Check Firebase Console → Authentication → Users
   - Check Firestore → users collection

---

### Option 3: Client-Side Script (Alternative)

1. **Open the HTML file**
   ```bash
   open scripts/createFirestoreUsers.html
   ```

2. **Follow instructions in the browser**
   - This will create users via Firebase Auth client SDK
   - Then create Firestore documents

---

## ✅ After Seeding Users

1. **Verify Users Exist**
   - Go to Firebase Console → Authentication → Users
   - You should see 4 users

2. **Verify Firestore Documents**
   - Go to Firestore Database → users collection
   - You should see 4 documents with user data

3. **Test Login**
   - Go to: https://travelplan-grav.web.app/login
   - Try logging in with:
     - Admin: `mail@jsabu.com` / `Admin123`
     - Agent: `agent@travelplans.fun` / `Agent@123`

---

## 📋 User Details Reference

| Role | Email | Password | Firestore Roles |
|------|-------|----------|-----------------|
| Admin | `mail@jsabu.com` | `Admin123` | `["Admin"]` |
| Agent | `agent@travelplans.fun` | `Agent@123` | `["Agent"]` |
| Customer | `customer@travelplans.fun` | `Customer@123` | `["Customer"]` |
| RM | `rm@travelplans.fun` | `RM@123` | `["Relationship Manager"]` |

---

## 🔍 Troubleshooting

### Issue: "User already exists"
- **Solution**: User is already created, skip this user

### Issue: "Permission denied" in Firestore
- **Solution**: Check Firestore security rules allow user creation

### Issue: Login still fails after seeding
- **Solution**: 
  1. Verify user exists in Authentication
  2. Verify Firestore document exists with correct UID
  3. Check browser console for specific error
  4. Clear browser cache and retry

---

## ✅ Success Criteria

After seeding, you should be able to:
- ✅ Login with any of the 4 test accounts
- ✅ See role-specific dashboard
- ✅ Access role-appropriate features
- ✅ No authentication errors in console

---

**Recommended**: Use Option 1 (Firebase Console) - it's the fastest and most reliable method.





