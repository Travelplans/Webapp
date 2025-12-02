# Admin Credentials

## Admin User

**Email**: `mail@jsabu.com`  
**Password**: `Admin123`

## Access

- **Login URL**: https://travelplan-grav.web.app/login
- **Role**: Admin (full access)
- **Permissions**: All permissions including Role Management

## Features Available to Admin

- ✅ User Management
- ✅ Role Management (Create/Edit/Delete custom roles)
- ✅ Itinerary Creation (Only Admin can create)
- ✅ Customer Management
- ✅ Booking Management
- ✅ AI Itinerary Generator
- ✅ Compliance Dashboard
- ✅ All Analytics and Reports

## Creating Admin User

If the admin user doesn't exist, you can create it using the seed script:

```bash
node scripts/seedAuth.js
```

Or manually in Firebase Console:
1. Go to Firebase Console → Authentication
2. Click "Add User"
3. Email: `mail@jsabu.com`
4. Password: `Admin123`
5. Then create Firestore document in `users` collection:
   - Document ID: (same as Auth UID)
   - Data:
     ```json
     {
       "name": "Admin User",
       "email": "mail@jsabu.com",
       "roles": ["Admin"]
     }
     ```

## Security Notes

- ⚠️ Change the default password in production
- ⚠️ Use strong, unique passwords
- ⚠️ Enable 2FA for admin accounts
- ⚠️ Regularly audit admin access

## Other Test Users

From `scripts/seedAuth.js`:

- **Agent**: `agent@travelplans.fun` / `Agent@123`
- **Customer**: `customer@travelplans.fun` / `Customer@123`
- **Relationship Manager**: `rm@travelplans.fun` / `RM@123`

