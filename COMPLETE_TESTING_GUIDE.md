# Complete Application Testing Guide
## Production URL: https://travelplan-grav.web.app

## 🔐 Step 1: User Setup (If Needed)

Before testing, ensure users are created in Firebase Auth. Run the seed script if needed:

```bash
node scripts/seedAuth.js
```

This creates:
- Admin: mail@jsabu.com / Admin123
- Agent: agent@travelplans.fun / Agent@123
- Customer: customer@travelplans.fun / Customer@123
- RM: rm@travelplans.fun / RM@123

---

## 📋 Complete Testing Flow

### Phase 1: Authentication & Navigation

#### Test 1.1: Login as Admin
1. Navigate to: https://travelplan-grav.web.app/login
2. Enter: `mail@jsabu.com` / `Admin123`
3. Click "Sign In"
4. **Expected**: Redirect to Admin Dashboard
5. **Verify**: Sidebar shows all admin menu items

#### Test 1.2: Verify Dashboard
- **URL**: https://travelplan-grav.web.app/
- **Check**:
  - Total Users count
  - Total Itineraries count
  - Recent Users table
  - Recent Itineraries list
  - All navigation links visible

---

### Phase 2: User Management

#### Test 2.1: Create New User
1. Navigate to: `/users`
2. Click "Create New User"
3. **Fill Form**:
   ```
   Name: Test Agent
   Email: testagent@example.com
   Roles: [✓] Agent
   ```
4. Click "Create User"
5. **Expected**: 
   - Modal opens immediately (no blank screen)
   - Form fully visible
   - User created successfully
   - Toast notification appears
   - User appears in table

#### Test 2.2: Edit User
1. Find created user in table
2. Click edit icon
3. Modify name or roles
4. Save changes
5. **Verify**: Changes reflected in table

#### Test 2.3: Search & Filter
1. Use search box: Type "Test"
2. **Verify**: Only matching users shown
3. Use role filter: Select "Agent"
4. **Verify**: Only agents shown

#### Test 2.4: Delete User
1. Click delete icon on test user
2. Confirm deletion
3. **Verify**: User removed from table

---

### Phase 3: Role Management (RBAC)

#### Test 3.1: Create Custom Role
1. Navigate to: `/roles`
2. Click "Create New Role"
3. **Fill Form**:
   ```
   Role Name: Senior Agent
   Description: Senior level agent with extended permissions
   Permissions:
     - [✓] CREATE_ITINERARY
     - [✓] EDIT_ITINERARY
     - [✓] DELETE_ITINERARY
     - [✓] VIEW_CUSTOMERS
     - [✓] CREATE_CUSTOMER
   ```
4. Click "Create Role"
5. **Expected**:
   - Modal opens immediately
   - Permission groups visible
   - Role created successfully
   - Role appears in table

#### Test 3.2: Assign Custom Role to User
1. Go to User Management
2. Edit a user
3. Select the custom role created
4. Save
5. **Verify**: User has custom role assigned

#### Test 3.3: Edit Role Permissions
1. Click edit on custom role
2. Add/remove permissions
3. Save
4. **Verify**: Changes reflected

---

### Phase 4: Itinerary Management

#### Test 4.1: Create Itinerary
1. Navigate to: `/itineraries`
2. Click "Create New Itinerary"
3. **Fill Form**:
   ```
   Title: Dubai Adventure
   Destination: Dubai, UAE
   Duration: 7 days
   Price: 5000 AED
   Description: Experience the luxury and culture of Dubai
   Image: Upload or Generate with AI
   Assigned Agent: Select from dropdown
   ```
4. Click "Create Itinerary"
5. **Expected**:
   - Modal opens immediately
   - Form fully visible and scrollable
   - Image upload works
   - Itinerary created successfully
   - Appears in grid view

#### Test 4.2: View Itinerary Details
1. Click on itinerary card
2. **Verify**: 
   - Full details page loads
   - Image displays
   - All information visible
   - Collateral materials section

#### Test 4.3: Edit Itinerary
1. Hover over itinerary card
2. Click edit icon
3. Modify details
4. Save
5. **Verify**: Changes reflected

#### Test 4.4: Search Itineraries
1. Use search box
2. Type "Dubai"
3. **Verify**: Only matching itineraries shown

---

### Phase 5: Customer Management

#### Test 5.1: Create Customer
1. Navigate to: `/customers`
2. Click "Create New Customer"
3. **Fill Form**:
   ```
   First Name: John
   Last Name: Doe
   Email: john@example.com
   Phone: +971501234567
   Date of Birth: 1990-01-15
   Address: Dubai, UAE
   ```
4. Submit
5. **Verify**: Customer created and appears in list

#### Test 5.2: View Customer Details
1. Click on customer
2. **Verify**: 
   - Full customer profile
   - Documents section
   - Booking history
   - AI Summary button

#### Test 5.3: Upload Document
1. Open customer details
2. Click "Upload Document"
3. Select file
4. **Verify**: Document uploaded and visible

#### Test 5.4: Generate AI Summary
1. Click "AI Summary" button
2. **Verify**: 
   - Loading state shown
   - Summary generated
   - Displayed in green box

---

### Phase 6: Booking Management

#### Test 6.1: Create Booking
1. Navigate to: `/bookings`
2. Click "Create New Booking"
3. **Fill Form**:
   ```
   Customer: Select from dropdown
   Itinerary: Select from dropdown
   Booking Date: Today's date
   Status: Pending
   Payment Status: Pending
   ```
4. Submit
5. **Verify**: Booking created and appears in calendar/list

#### Test 6.2: Update Booking Status
1. Find booking in list
2. Click status dropdown
3. Change to "Confirmed"
4. **Verify**: Status updated, confirmation modal appears

#### Test 6.3: Calendar View
1. Navigate to bookings
2. **Verify**: 
   - Calendar displays
   - Bookings shown on dates
   - Click date shows bookings for that day

---

### Phase 7: AI Features

#### Test 7.1: AI Itinerary Generator
1. Navigate to: `/generate-itinerary`
2. **Fill Form**:
   ```
   Destination: Paris, France
   Duration: 5 days
   Traveler Type: Family
   Budget: 10000 AED
   ```
3. Click "Generate Itinerary"
4. **Verify**:
   - Loading animation
   - Itinerary generated
   - Daily plan displayed
   - Option to save

#### Test 7.2: AI Chatbot
1. Login as Agent or Customer
2. Look for chatbot icon (bottom right)
3. Click to open
4. Send message: "What are the best itineraries?"
5. **Verify**:
   - Chatbot opens
   - Message sent
   - AI response received
   - Context-aware responses

#### Test 7.3: AI Image Generation
1. In Create Itinerary form
2. Select "Generate with AI" tab
3. Enter prompt: "Beautiful beach in Maldives"
4. Click "Generate Image"
5. **Verify**: Image generated and set as cover

---

### Phase 8: Compliance

#### Test 8.1: View Pending Collaterals
1. Navigate to: `/compliance`
2. **Verify**: 
   - List of pending collaterals
   - Itinerary association
   - Type and status

#### Test 8.2: Get AI Feedback
1. Click "Get Feedback" on collateral
2. **Verify**:
   - Loading state
   - AI feedback displayed
   - Issues highlighted (if any)

#### Test 8.3: Approve/Reject
1. Review AI feedback
2. Click "Approve" or "Reject"
3. **Verify**: Status updated

---

### Phase 9: Mobile Responsiveness

#### Test 9.1: Mobile Navigation
1. Resize browser to mobile size (< 640px)
2. **Verify**:
   - Hamburger menu appears
   - Sidebar hidden by default
   - Click menu opens sidebar
   - Sidebar slides in smoothly

#### Test 9.2: Mobile Forms
1. Open any create form on mobile
2. **Verify**:
   - Form is full-width
   - All fields accessible
   - Buttons are touch-friendly
   - Modal is scrollable

#### Test 9.3: Mobile Tables
1. View User Management on mobile
2. **Verify**:
   - Table is horizontally scrollable
   - Email shown in name cell
   - Action buttons accessible

---

### Phase 10: Role-Based Access Control

#### Test 10.1: Agent Permissions
1. Logout
2. Login as Agent: `agent@travelplans.fun` / `Agent@123`
3. **Verify**:
   - Can access Customers
   - Can create Itineraries
   - Can manage Bookings
   - Cannot access User Management
   - Cannot access Role Management

#### Test 10.2: Customer Permissions
1. Logout
2. Login as Customer: `customer@travelplans.fun` / `Customer@123`
3. **Verify**:
   - Can view Itineraries
   - Can view Bookings
   - Can upload Documents
   - Cannot create Itineraries
   - Cannot access Admin features

---

## 🎯 Key Features to Verify

### ✅ Modal Functionality
- [ ] Modals open immediately (no blank screen)
- [ ] Forms are fully visible
- [ ] Backdrop is lighter (30% opacity)
- [ ] Close button works
- [ ] Forms are scrollable

### ✅ Data Operations
- [ ] Create operations work
- [ ] Read operations work
- [ ] Update operations work
- [ ] Delete operations work
- [ ] Search works
- [ ] Filters work

### ✅ UI/UX
- [ ] All buttons visible
- [ ] Amaranth font applied
- [ ] Colors correct (primary blue)
- [ ] Loading states work
- [ ] Error messages display
- [ ] Toast notifications appear

### ✅ Mobile Experience
- [ ] Hamburger menu works
- [ ] Sidebar responsive
- [ ] Tables scrollable
- [ ] Forms mobile-friendly
- [ ] Touch targets adequate

---

## 📊 Expected Results Summary

| Feature | Status | Notes |
|---------|--------|-------|
| Login | ✅ | All roles can login |
| Dashboard | ✅ | Role-specific dashboards |
| User Management | ✅ | Full CRUD operations |
| Role Management | ✅ | RBAC system working |
| Itinerary Management | ✅ | Create/Edit/Delete |
| Customer Management | ✅ | Full customer lifecycle |
| Booking Management | ✅ | Status updates work |
| AI Features | ✅ | Chatbot & Generator |
| Compliance | ✅ | Collateral review |
| Mobile | ✅ | Fully responsive |

---

## 🐛 Troubleshooting

### Login Issues
- **Problem**: "Invalid email" error
- **Solution**: Verify user exists in Firebase Auth
- **Fix**: Run `node scripts/seedAuth.js`

### Permission Errors
- **Problem**: "Permission denied" in console
- **Solution**: Check Firestore rules
- **Fix**: Rules are deployed, verify user has correct roles

### Forms Not Loading
- **Problem**: Blank modal screen
- **Solution**: Check browser console
- **Fix**: Already fixed - modals should load immediately

### Data Not Appearing
- **Problem**: Empty lists
- **Solution**: Seed test data
- **Fix**: Run `node scripts/seedData.ts`

---

## ✅ Production Checklist

- [x] Application deployed to Firebase
- [x] Firestore rules deployed
- [x] All fixes committed to Git
- [x] Mobile responsiveness verified
- [x] Forms loading properly
- [x] Modal backdrop fixed
- [x] Button visibility fixed
- [x] Font restored

---

**Status**: ✅ Ready for Production Testing
**URL**: https://travelplan-grav.web.app
**Last Deployed**: $(date)
