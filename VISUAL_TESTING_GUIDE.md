# Visual Testing Guide - Complete Application Flow
## Production URL: https://travelplan-grav.web.app

## 🎯 Testing Overview

This guide provides a complete walkthrough of all application features with expected visual results.

---

## 📸 Test Flow 1: Login & Dashboard

### Step 1: Login Page
**URL**: https://travelplan-grav.web.app/login

**Visual Check**:
- ✅ White login card centered
- ✅ "Travelplans.fun" title in bold
- ✅ Email and Password fields visible
- ✅ "Sign In" button is blue and visible
- ✅ Amaranth font applied

**Test Credentials**:
- Agent: `agent@travelplans.fun` / `Agent@123`

**Expected Result**: Redirect to Agent Dashboard

---

### Step 2: Agent Dashboard
**URL**: https://travelplan-grav.web.app/

**Visual Check**:
- ✅ Sidebar visible on left (desktop) or hamburger menu (mobile)
- ✅ Header with user profile and logout
- ✅ Dashboard content loads immediately
- ✅ Summary cards visible
- ✅ Navigation links in sidebar

**Menu Items for Agent**:
- Dashboard
- Customers
- Itineraries
- Bookings

---

## 📸 Test Flow 2: Create New Itinerary

### Step 1: Navigate to Itineraries
1. Click "Itineraries" in sidebar
2. **URL**: https://travelplan-grav.web.app/itineraries

**Visual Check**:
- ✅ Page loads immediately (no blank screen)
- ✅ "Manage Itineraries" heading visible
- ✅ "Create New Itinerary" button visible and clickable
- ✅ Search box visible
- ✅ Itinerary grid or empty state visible

### Step 2: Open Create Modal
1. Click "Create New Itinerary" button

**Visual Check**:
- ✅ Modal opens immediately (no delay)
- ✅ Modal backdrop is light gray (30% opacity, not dark)
- ✅ "Create New Itinerary" title visible
- ✅ Form is fully visible (not cut off)
- ✅ Form is scrollable if content is long

### Step 3: Fill Itinerary Form
**Form Fields to Fill**:
```
Title: "Dubai Adventure"
Destination: "Dubai, UAE"
Duration: 7
Price: 5000
Description: "Experience luxury and culture"
```

**Visual Check**:
- ✅ All input fields visible and accessible
- ✅ Image upload section visible
- ✅ "Upload Image" and "Generate with AI" tabs visible
- ✅ Agent dropdown visible (if agents exist)
- ✅ Collateral section visible
- ✅ Cancel and Create buttons visible at bottom

### Step 4: Upload Image
1. Click "Upload Image" tab
2. Click "Upload an image" button
3. Select an image file

**Visual Check**:
- ✅ Image preview appears
- ✅ Remove image button visible
- ✅ Image displays correctly

### Step 5: Submit Form
1. Fill all required fields
2. Click "Create Itinerary"

**Expected Result**:
- ✅ Toast notification: "Itinerary created successfully!"
- ✅ Modal closes
- ✅ New itinerary appears in grid
- ✅ Itinerary card shows image, title, destination, price

---

## 📸 Test Flow 3: Create New User (Admin)

### Step 1: Login as Admin
1. Logout if logged in
2. Login with: `mail@jsabu.com` / `Admin123`

### Step 2: Navigate to User Management
1. Click "User Management" in sidebar
2. **URL**: https://travelplan-grav.web.app/users

**Visual Check**:
- ✅ Page loads immediately
- ✅ "User Management" heading visible
- ✅ "Create New User" button visible
- ✅ Search box and role filter visible
- ✅ User table visible (or empty state)

### Step 3: Open Create User Modal
1. Click "Create New User"

**Visual Check**:
- ✅ Modal opens immediately
- ✅ Backdrop is light (30% opacity)
- ✅ "Create New User" title visible
- ✅ Form fully visible and scrollable

### Step 4: Fill User Form
**Form Fields**:
```
Name: "Test Agent"
Email: "testagent@example.com"
System Roles: [✓] Agent
```

**Visual Check**:
- ✅ Name field visible
- ✅ Email field visible
- ✅ System Roles checkboxes visible (Admin, Agent, Customer, Relationship Manager)
- ✅ Custom Roles section (if any exist)
- ✅ Cancel and Create User buttons visible

### Step 5: Submit Form
1. Click "Create User"

**Expected Result**:
- ✅ Toast: "User created successfully!"
- ✅ Modal closes
- ✅ User appears in table
- ✅ User shows correct roles

---

## 📸 Test Flow 4: Create New Role (Admin)

### Step 1: Navigate to Role Management
1. Click "Role Management" in sidebar
2. **URL**: https://travelplan-grav.web.app/roles

**Visual Check**:
- ✅ Page loads immediately
- ✅ "Role Management" heading visible
- ✅ "Create New Role" button visible
- ✅ Roles table visible (or empty state message)

### Step 2: Open Create Role Modal
1. Click "Create New Role"

**Visual Check**:
- ✅ Modal opens immediately
- ✅ Backdrop is light (30% opacity)
- ✅ "Create New Role" title visible
- ✅ Form fully visible

### Step 3: Fill Role Form
**Form Fields**:
```
Role Name: "Senior Agent"
Description: "Senior level agent with extended permissions"
```

**Permissions to Select**:
- ITINERARY group: Select all
- CUSTOMER group: Select all
- BOOKING group: Select all

**Visual Check**:
- ✅ Role name field visible
- ✅ Description textarea visible
- ✅ Permission groups visible:
  - ITINERARY
  - CUSTOMER
  - BOOKING
  - USER_MANAGEMENT
  - ROLE_MANAGEMENT
  - AI_FEATURES
  - DASHBOARD
  - DOCUMENTS
- ✅ "Select All" buttons for each group
- ✅ Individual permission checkboxes
- ✅ Selected count visible: "Permissions * (X selected)"

### Step 4: Submit Form
1. Click "Create Role"

**Expected Result**:
- ✅ Toast: "Role created successfully!"
- ✅ Modal closes
- ✅ Role appears in table
- ✅ Shows permission count

---

## 📸 Test Flow 5: Customer Management

### Step 1: Navigate to Customers
1. Click "Customers" in sidebar
2. **URL**: https://travelplan-grav.web.app/customers

**Visual Check**:
- ✅ Page loads immediately
- ✅ Customer list or empty state
- ✅ "Create New Customer" button visible

### Step 2: Create Customer
1. Click "Create New Customer"
2. Fill customer form
3. Submit

**Expected Result**:
- ✅ Customer created
- ✅ Appears in customer list

### Step 3: View Customer Details
1. Click on customer card/row

**Visual Check**:
- ✅ Customer detail modal opens
- ✅ Customer information visible
- ✅ Documents section visible
- ✅ "AI Summary" button visible
- ✅ Booking history visible

---

## 📸 Test Flow 6: Booking Management

### Step 1: Navigate to Bookings
1. Click "Bookings" in sidebar
2. **URL**: https://travelplan-grav.web.app/bookings

**Visual Check**:
- ✅ Page loads immediately
- ✅ Calendar view or list view
- ✅ "Create New Booking" button visible
- ✅ Bookings displayed by date

### Step 2: Create Booking
1. Click "Create New Booking"
2. Select customer and itinerary
3. Set booking date and status
4. Submit

**Expected Result**:
- ✅ Booking created
- ✅ Appears in calendar/list

---

## 📸 Test Flow 7: Mobile Responsiveness

### Test on Mobile Viewport (< 640px)

#### Navigation
1. Resize browser to mobile size
2. **Visual Check**:
   - ✅ Hamburger menu icon appears in header
   - ✅ Sidebar hidden by default
   - ✅ Click hamburger opens sidebar
   - ✅ Sidebar slides in from left
   - ✅ Overlay appears behind sidebar
   - ✅ Close button (X) in sidebar

#### Forms on Mobile
1. Open any create form
2. **Visual Check**:
   - ✅ Modal takes full width
   - ✅ Form fields are full-width
   - ✅ Buttons are full-width
   - ✅ Form is scrollable
   - ✅ Close button (X) in modal header

#### Tables on Mobile
1. View User Management
2. **Visual Check**:
   - ✅ Table is horizontally scrollable
   - ✅ Email column hidden (shown in name cell)
   - ✅ Action buttons accessible
   - ✅ Touch-friendly button sizes

---

## 📸 Test Flow 8: AI Features

### AI Chatbot
1. Login as Agent or Customer
2. Look for chatbot icon (bottom right corner)
3. Click to open

**Visual Check**:
- ✅ Chatbot window opens
- ✅ Welcome message visible
- ✅ Input field at bottom
- ✅ Send button visible
- ✅ Close button (X) visible

### AI Itinerary Generator
1. Navigate to: https://travelplan-grav.web.app/generate-itinerary
2. Fill form and generate

**Visual Check**:
- ✅ Form visible
- ✅ Loading animation during generation
- ✅ Generated itinerary displayed
- ✅ Daily plan visible
- ✅ Save button visible

---

## ✅ Visual Checklist

### Modal Functionality
- [ ] Modals open immediately (no blank screen)
- [ ] Backdrop is light gray (30% opacity, not dark)
- [ ] Forms are fully visible (not cut off)
- [ ] Forms are scrollable
- [ ] Close button works (X in header on mobile)
- [ ] Clicking backdrop closes modal

### Page Loading
- [ ] Pages load immediately (no dark background)
- [ ] No double-click required
- [ ] Content appears right away
- [ ] Loading spinners only for async operations

### Button Visibility
- [ ] All buttons are visible
- [ ] Buttons have proper colors (blue primary)
- [ ] Buttons are clickable
- [ ] Hover states work

### Typography
- [ ] Amaranth font applied throughout
- [ ] Text is readable
- [ ] Headings are properly sized
- [ ] Responsive text sizing

### Mobile Experience
- [ ] Hamburger menu appears on mobile
- [ ] Sidebar slides in smoothly
- [ ] Forms are mobile-friendly
- [ ] Tables are scrollable
- [ ] Touch targets are adequate size

---

## 🎬 Complete Test Sequence

### As Admin User
1. ✅ Login → Dashboard
2. ✅ Create New User → Verify in table
3. ✅ Create New Role → Verify permissions
4. ✅ Create New Itinerary → Verify in grid
5. ✅ View Itinerary Details
6. ✅ Edit Itinerary
7. ✅ Create Customer
8. ✅ View Customer Details
9. ✅ Create Booking
10. ✅ Test Compliance page

### As Agent User
1. ✅ Login → Dashboard
2. ✅ Create Customer
3. ✅ Create Itinerary
4. ✅ Create Booking
5. ✅ Use AI Chatbot
6. ✅ View Customers
7. ✅ View Itineraries

### As Customer User
1. ✅ Login → Dashboard
2. ✅ View Itineraries
3. ✅ View Bookings
4. ✅ Upload Documents
5. ✅ Use AI Chatbot

---

## 📊 Expected Results Matrix

| Feature | Admin | Agent | Customer | RM |
|---------|-------|-------|----------|-----|
| Login | ✅ | ✅ | ✅ | ✅ |
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| User Management | ✅ | ❌ | ❌ | ❌ |
| Role Management | ✅ | ❌ | ❌ | ❌ |
| Create Itinerary | ✅ | ✅ | ❌ | ❌ |
| View Itineraries | ✅ | ✅ | ✅ | ✅ |
| Create Customer | ✅ | ✅ | ❌ | ❌ |
| View Customers | ✅ | ✅ | ❌ | ✅ |
| Create Booking | ✅ | ✅ | ❌ | ❌ |
| View Bookings | ✅ | ✅ | ✅ | ✅ |
| AI Chatbot | ❌ | ✅ | ✅ | ❌ |
| AI Generator | ✅ | ✅ | ❌ | ❌ |
| Compliance | ✅ | ❌ | ❌ | ❌ |

---

## 🐛 Common Issues & Solutions

### Issue: Login Fails
**Solution**: Ensure users are seeded in Firebase Auth
```bash
node scripts/seedAuth.js
```

### Issue: Blank Modal Screen
**Status**: ✅ Fixed - Modals now load immediately

### Issue: Dark Background
**Status**: ✅ Fixed - Backdrop is now 30% opacity

### Issue: Buttons Not Visible
**Status**: ✅ Fixed - Using explicit colors

### Issue: Forms Not Loading
**Status**: ✅ Fixed - Forms render immediately

---

## 📝 Testing Notes

- All modals should open within 100ms
- Forms should be fully visible without scrolling initially
- Mobile sidebar should slide in smoothly
- All CRUD operations should show toast notifications
- Error messages should be user-friendly

---

**Last Updated**: $(date)
**Status**: ✅ Ready for Visual Testing
**Production URL**: https://travelplan-grav.web.app
