# Manual Testing Guide
## Quick 15-Minute Test Execution
## Production URL: https://travelplan-grav.web.app

---

## 🎯 Test Overview

This guide provides step-by-step instructions for manually testing the application. Each step includes what to do and what to verify.

**Total Time**: ~15 minutes
**Test Agent**: You (Manual Testing)

---

## ✅ Step 1: Test Login (2 minutes)

### Instructions:
1. **Open**: https://travelplan-grav.web.app/login
2. **Enter Email**: `agent@travelplans.fun`
3. **Enter Password**: `Agent@123`
4. **Click**: "Sign In" button

### What to Verify:
- [ ] ✅ Login successful (no error messages)
- [ ] ✅ Redirects to Agent Dashboard
- [ ] ✅ Sidebar visible on left with navigation:
  - Dashboard
  - Customers
  - Itineraries
  - Bookings
- [ ] ✅ Header shows: "Welcome, Travel Agent" with Agent badge
- [ ] ✅ AI Chatbot icon visible (bottom right corner)
- [ ] ✅ No console errors (press F12 → Console tab)

**✅ Step 1 Complete** - Proceed to Step 2

---

## ✅ Step 2: Create Itinerary (3 minutes)

### Instructions:
1. **Click**: "Itineraries" in sidebar
2. **Click**: "Create New Itinerary" button (top right)
3. **Verify Modal Opens**:
   - [ ] Modal appears immediately (no blank screen)
   - [ ] Backdrop is light gray (30% opacity, not dark)
   - [ ] "Create New Itinerary" title visible
   - [ ] Form is fully visible (not cut off)
4. **Fill Form**:
   - Title: `Dubai Adventure`
   - Destination: `Dubai, UAE`
   - Duration: `7`
   - Price: `5000`
   - Description: `Experience the luxury and culture of Dubai with our premium 7-day package`
5. **Upload Image**:
   - Click "Upload Image" tab
   - Click "Upload an image" button
   - Select an image file from your computer
   - Verify image preview appears
6. **Click**: "Create Itinerary" button (bottom of form)

### What to Verify:
- [ ] ✅ Toast notification appears: "Itinerary created successfully!"
- [ ] ✅ Modal closes automatically
- [ ] ✅ New itinerary appears in the grid
- [ ] ✅ Itinerary card shows:
  - Image
  - Title: "Dubai Adventure"
  - Destination: "Dubai, UAE"
  - Price: "AED 5,000"
  - Duration: "7 days"

**✅ Step 2 Complete** - Proceed to Step 3

---

## ✅ Step 3: Create Customer (3 minutes)

### Instructions:
1. **Click**: "Customers" in sidebar
2. **Click**: "Create New Customer" button
3. **Verify Modal Opens**:
   - [ ] Modal appears immediately
   - [ ] Backdrop is light gray (30% opacity)
   - [ ] Form fully visible and scrollable
4. **Fill Form**:
   - First Name: `John`
   - Last Name: `Doe`
   - Email: `john.doe@example.com`
   - Phone: `+971501234567`
   - Date of Birth: `1990-01-15` (or use date picker)
   - Address: `Dubai, UAE`
5. **Click**: "Create Customer" or "Submit" button

### What to Verify:
- [ ] ✅ Toast notification: "Customer created successfully!"
- [ ] ✅ Modal closes
- [ ] ✅ Customer appears in customer list
- [ ] ✅ Customer card/row shows all information

**✅ Step 3 Complete** - Proceed to Step 4

---

## ✅ Step 4: Create Booking (3 minutes)

### Instructions:
1. **Click**: "Bookings" in sidebar
2. **Click**: "Create New Booking" button
3. **Verify Modal Opens**:
   - [ ] Modal appears immediately
   - [ ] Form fully visible
4. **Fill Form**:
   - Customer: Select `John Doe` (created in Step 3)
   - Itinerary: Select `Dubai Adventure` (created in Step 2)
   - Booking Date: Select today's date or a future date
   - Status: `Pending` (default)
   - Payment Status: `Pending` (default)
5. **Click**: "Create Booking" or "Submit" button

### What to Verify:
- [ ] ✅ Toast notification: "Booking created successfully!"
- [ ] ✅ Modal closes
- [ ] ✅ Booking appears in calendar/list
- [ ] ✅ Shows customer name: "John Doe"
- [ ] ✅ Shows itinerary: "Dubai Adventure"
- [ ] ✅ Booking date displayed correctly

**✅ Step 4 Complete** - Proceed to Step 5

---

## ✅ Step 5: Test Admin Features (4 minutes)

### Part 5.1: Logout and Login as Admin

**Instructions:**
1. **Click**: Logout button (top right, next to user profile)
2. **Verify**: Redirected to login page
3. **Login as Admin**:
   - Email: `mail@jsabu.com`
   - Password: `Admin123`
   - Click "Sign In"

**What to Verify:**
- [ ] ✅ Login successful
- [ ] ✅ Admin Dashboard loads
- [ ] ✅ Sidebar shows additional options:
  - Dashboard
  - User Management
  - Role Management
  - All Customers
  - Itineraries
  - Bookings
  - AI Itinerary Generator
  - Compliance

---

### Part 5.2: User Management

**Instructions:**
1. **Click**: "User Management" in sidebar
2. **Click**: "Create New User" button
3. **Verify Modal Opens**:
   - [ ] Modal appears immediately
   - [ ] Backdrop is light (30% opacity)
   - [ ] "Create New User" title visible
   - [ ] Form fully visible and scrollable
4. **Fill Form**:
   - Name: `Test Agent User`
   - Email: `testagent@example.com`
   - System Roles: Check `Agent` checkbox
5. **Click**: "Create User" button

**What to Verify:**
- [ ] ✅ Toast: "User created successfully!"
- [ ] ✅ Modal closes
- [ ] ✅ User appears in table
- [ ] ✅ User shows Agent role badge

---

### Part 5.3: Role Management

**Instructions:**
1. **Click**: "Role Management" in sidebar
2. **Click**: "Create New Role" button
3. **Verify Modal Opens**:
   - [ ] Modal appears immediately
   - [ ] Permission groups visible:
     - ITINERARY
     - CUSTOMER
     - BOOKING
     - USER_MANAGEMENT
     - ROLE_MANAGEMENT
     - AI_FEATURES
     - DASHBOARD
     - DOCUMENTS
4. **Fill Form**:
   - Role Name: `Senior Agent`
   - Description: `Senior level agent with extended permissions`
5. **Select Permissions**:
   - Click "Select All" for ITINERARY group
   - Click "Select All" for CUSTOMER group
   - Click "Select All" for BOOKING group
6. **Verify**:
   - [ ] Permission count shows: "Permissions * (X selected)"
   - [ ] All selected permissions visible
7. **Click**: "Create Role" button

**What to Verify:**
- [ ] ✅ Toast: "Role created successfully!"
- [ ] ✅ Modal closes
- [ ] ✅ Role appears in table
- [ ] ✅ Shows permission count

**✅ Step 5 Complete** - All Tests Done!

---

## 📊 Test Results Checklist

### UI/UX Verification
- [ ] Modals open immediately (no blank screen)
- [ ] Backdrop is light gray (30% opacity, not dark)
- [ ] Forms are fully visible (not cut off)
- [ ] Forms are scrollable
- [ ] Pages load immediately (no dark background)
- [ ] All buttons are visible and clickable
- [ ] Amaranth font applied throughout
- [ ] Mobile navigation works (hamburger menu on mobile)

### Functionality Verification
- [ ] Login works for all roles
- [ ] CRUD operations work (Create, Read, Update, Delete)
- [ ] Search and filter work
- [ ] AI features functional
- [ ] Role-based access enforced
- [ ] No console errors

---

## 🐛 Common Issues & Solutions

### Issue: Login fails
**Check:**
- User exists in Firebase Auth (✅ Confirmed)
- Firestore document exists for user
- Browser console for specific error

### Issue: Modal blank screen
**Status**: ✅ Fixed - Should open immediately
**If persists**: Check browser console, clear cache

### Issue: Forms not loading
**Status**: ✅ Fixed - Should load immediately
**If persists**: Clear browser cache, check console

### Issue: Buttons not visible
**Status**: ✅ Fixed - All buttons should be visible
**If persists**: Check browser console, try different browser

---

## 📝 Test Data Summary

After completing all tests, you should have created:
- ✅ 1+ Itinerary: "Dubai Adventure"
- ✅ 1+ Customer: "John Doe"
- ✅ 1+ Booking: Linking customer to itinerary
- ✅ 1+ User: "Test Agent User" (if testing as Admin)
- ✅ 1+ Role: "Senior Agent" (if testing as Admin)

---

## ✅ Test Completion

**All Steps Completed**: ✅
**Total Time**: ~15 minutes
**Status**: Ready for production use

---

## 📄 Related Documentation

- **START_TESTING.md** - Quick reference
- **COMPREHENSIVE_TEST_PLAN.md** - Full test sequence
- **TEST_EXECUTION_REPORT.md** - Detailed execution log

---

**Status**: ✅ Ready for Manual Testing
**Production URL**: https://travelplan-grav.web.app
**Test Credentials**: See START_TESTING.md





