# Browser Login Test Documentation

## Test URL
**Login Page**: https://travelplan-grav.web.app/login

## Test Credentials
- **Email**: `mail@jsabu.com`
- **Password**: `Admin123`

## Test Scenario: Login with Admin Credentials

### Steps Performed
1. Navigated to: https://travelplan-grav.web.app/login
2. Entered email: `mail@jsabu.com`
3. Entered password: `Admin123`
4. Clicked "Sign In" button

### Expected Result
- User should be successfully authenticated
- Should redirect to dashboard or appropriate page based on user role (Admin)
- No error messages should appear

### Actual Result (Last Test)
- Error encountered: `Firebase: Error (auth/invalid-email)`
- Login page remained visible
- Authentication failed

### Notes
- The error suggests there may be an issue with:
  - Email format validation in Firebase
  - User account not existing in Firebase Auth
  - Email domain validation rules

### Next Steps for Testing
1. Verify user exists in Firebase Authentication console
2. Check if email format is correct (should be valid)
3. Verify Firebase project configuration
4. Test with different credentials if available
5. Check browser console for additional error details

## Agent Assignment Test

### Prerequisites
- Must be logged in as Admin user
- Must have at least one agent user in the system
- Must have at least one itinerary to assign

### Test Steps
1. Login as Admin (mail@jsabu.com / Admin123)
2. Navigate to Itineraries page
3. Create or edit an itinerary
4. Select an agent from "Assigned Agent" dropdown
5. Save the itinerary
6. Verify agent assignment is saved

### Expected Result
- Agent dropdown should show available agents
- Selected agent should be saved with the itinerary
- Itinerary should display assigned agent in the list





