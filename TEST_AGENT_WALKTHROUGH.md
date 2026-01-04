# Test Agent for Walkthrough Testing

## Quick Access - Use Existing Agent Account

**Login URL:** https://travelplan-grav.web.app/login

**Test Agent Credentials:**
- **Email:** `agent@travelplans.fun`
- **Password:** `Agent@123`

This account already exists and can be used immediately for testing.

---

## Create New Test Agent with Sample Data

If you want to create a dedicated test agent with pre-populated sample data:

### Option 1: Using HTML Script (Recommended)

1. Open `scripts/createTestAgent.html` in your browser
2. Login with admin credentials:
   - Email: `mail@jsabu.com`
   - Password: `Admin123`
3. Click "Create Test Agent & Data"
4. The script will create:
   - Test agent user: `testagent@travelplans.fun` / `TestAgent@123`
   - 3 Sample Itineraries (with full day-by-day plans)
   - 3 Sample Customers
   - 3 Sample Bookings

### Option 2: Using Admin UI

1. Login to https://travelplan-grav.web.app/login as admin:
   - Email: `mail@jsabu.com`
   - Password: `Admin123`
2. Navigate to **User Management**
3. Click **Create New User**
4. Fill in the form:
   - Name: `Test Agent (Walkthrough)`
   - Email: `testagent@travelplans.fun`
   - Password: `TestAgent@123`
   - Country Code: `+971`
   - Contact Number: `501234567`
   - Roles: Select **Agent**
5. Click **Create User**
6. Then create sample itineraries and assign them to this agent

---

## Test Agent Features to Test

Once logged in as an agent, you can test:

### ✅ Itinerary Management
- View only itineraries assigned to you
- Edit assigned itineraries
- View full day-by-day plans (for AI-generated itineraries)
- Cannot create new itineraries (Admin only)

### ✅ Customer Management
- View customers registered by you
- Create new customers
- Edit customer details
- View customer documents

### ✅ Booking Management
- View bookings for your customers
- Create bookings
- Update booking status
- Track payment status

### ✅ Dashboard
- View agent-specific dashboard
- See assigned itineraries
- View booking statistics
- Track customer registrations

### ✅ Real-time Updates
- All data updates appear immediately
- No page refresh needed
- See new assignments in real-time

---

## Sample Data Structure

If you use the HTML script, it creates:

### Itineraries (3)
1. **Dubai Luxury Experience** (5 days, AED 15,000)
   - Full day-by-day plan included
   - Assigned to test agent

2. **Paris Romantic Getaway** (7 days, AED 25,000)
   - Full day-by-day plan included
   - Assigned to test agent

3. **Bali Tropical Paradise** (10 days, AED 18,000)
   - Full day-by-day plan included
   - Assigned to test agent

### Customers (3)
1. **John Smith** - Status: Confirmed
2. **Sarah Johnson** - Status: Pending
3. **Michael Brown** - Status: Completed

### Bookings (3)
- One confirmed booking (Paid)
- One pending booking (Unpaid)
- One completed booking (Paid)

---

## Walkthrough Testing Checklist

- [ ] Login as test agent
- [ ] Verify only assigned itineraries are visible
- [ ] View itinerary details with full day-by-day plan
- [ ] Edit an assigned itinerary
- [ ] View customers registered by agent
- [ ] Create a new customer
- [ ] View bookings for agent's customers
- [ ] Create a new booking
- [ ] Update booking status
- [ ] Verify real-time updates (open in two browsers)
- [ ] Test agent dashboard
- [ ] Verify cannot access other agents' data
- [ ] Verify cannot create new itineraries

---

## Admin Account (for creating test data)

**Email:** `mail@jsabu.com`  
**Password:** `Admin123`

Use this account to:
- Create test agents
- Create and assign itineraries
- Manage all users and roles
- Configure permissions

---

## Troubleshooting

### Agent cannot see itineraries
- Verify itineraries are assigned to the agent (check `assignedAgentIds` field)
- Check Firestore rules are deployed
- Verify agent role is correctly set

### Real-time updates not working
- Check browser console for errors
- Verify Firestore subscription is active
- Check network connectivity

### Cannot edit itineraries
- Verify itinerary is assigned to the agent
- Check agent has `EDIT_ITINERARY` permission
- Verify Firestore rules allow agent updates

---

## Support

For issues or questions:
1. Check browser console for errors
2. Verify Firebase Console for data
3. Check Cloud Functions logs
4. Review Firestore security rules



