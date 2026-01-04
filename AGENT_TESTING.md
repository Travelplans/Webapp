# Agent Testing Guide

## Quick Start

1. **Open Localhost**: http://localhost:5173
2. **Login as Agent**:
   - Email: `agent@travelplans.fun`
   - Password: `Agent@123`

## Agent Menu Access

After login, agents should see these menu items in the sidebar:

1. **Dashboard** (`/`) - Agent-specific dashboard
2. **Customers** (`/customers`) - View and manage customers
3. **Itineraries** (`/itineraries`) - View itineraries (can create if permission allows)
4. **Bookings** (`/bookings`) - View and manage bookings

## Agent Permissions

Agents have the following permissions:
- ✅ View Dashboard
- ✅ View Itineraries
- ✅ **Create Itineraries** (newly added)
- ✅ Edit Itineraries
- ✅ View Customers
- ✅ Create Customers
- ✅ Edit Customers
- ✅ View Bookings
- ✅ Create Bookings
- ✅ Edit Bookings
- ✅ Use AI Chat
- ✅ Generate AI Itineraries
- ✅ View Documents
- ✅ Upload Documents

## Testing Checklist

### ✅ Dashboard
- [ ] Dashboard loads immediately
- [ ] Shows agent-specific content
- [ ] No loading spinner blocking

### ✅ Customers Page
- [ ] Page loads immediately
- [ ] Can view customer list
- [ ] Can create new customers
- [ ] Can edit existing customers

### ✅ Itineraries Page
- [ ] Page loads immediately
- [ ] Can view itinerary list
- [ ] Can create new itineraries (if permission allows)
- [ ] Can edit existing itineraries
- [ ] Can delete itineraries (if permission allows)

### ✅ Bookings Page
- [ ] Page loads immediately
- [ ] Can view booking list
- [ ] Can create new bookings
- [ ] Can edit booking status

### ✅ AI Chat
- [ ] Chatbot appears for agents
- [ ] Can send messages
- [ ] Receives AI responses

## Common Issues Fixed

1. **Pages Not Loading**: Fixed by removing `dataLoading` blocking in App routes
2. **Dark Background**: Fixed by ensuring pages render immediately
3. **Double-Click Required**: Fixed by improving loading state management
4. **Agent Can't Create Itineraries**: Fixed by adding CREATE_ITINERARY permission

## Next Steps

If you encounter any issues:
1. Check browser console for errors
2. Verify Firestore permissions
3. Check network tab for failed requests
4. Ensure user document exists in Firestore with correct roles





