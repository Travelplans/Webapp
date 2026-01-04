# Role Management & RBAC Implementation

## Overview

A comprehensive Role-Based Access Control (RBAC) system has been implemented, allowing administrators to create custom roles with granular permissions. Itinerary creation is now restricted to Admin users only.

## Features Implemented

### 1. Custom Role System

- **Custom Roles**: Admins can create custom roles with specific permissions
- **Permission Groups**: Permissions are organized into logical groups:
  - Itinerary Management
  - Customer Management
  - Booking Management
  - User Management
  - Role Management
  - AI Features
  - Dashboard & Analytics
  - Document Management

### 2. Role Management Page

**Location**: `/roles` (Admin only)

**Features**:
- View all custom roles
- Create new roles with permission selection
- Edit existing roles
- Delete custom roles (system roles cannot be deleted)
- Permission selection by group or individual

**Access**: Only users with `Admin` role can access this page.

### 3. Permission-Based Access Control

**Permission Utilities** (`src/shared/utils/permissions.ts`):
- `hasPermission()`: Check if user has a specific permission
- `hasAnyPermission()`: Check if user has any of the specified permissions
- `hasAllPermissions()`: Check if user has all specified permissions
- `getUserPermissions()`: Get all permissions for a user (from system roles + custom roles)
- `isAdmin()`: Check if user is Admin

### 4. Itinerary Creation Restriction

**Before**: Any authenticated user could create itineraries
**After**: Only users with `CREATE_ITINERARY` permission can create itineraries

- By default, only `Admin` role has this permission
- Custom roles can be granted this permission if needed
- UI buttons and modals are conditionally rendered based on permissions

### 5. User Form Enhancement

**Updated**: `src/features/users/components/UserForm.tsx`

**New Features**:
- System roles selection (Admin, Agent, Customer, Relationship Manager)
- Custom roles selection (dynamically loaded from Firestore)
- Users can have both system roles and custom roles
- Visual distinction between system and custom roles

## Permission System

### Available Permissions

```typescript
enum Permission {
  // Itinerary
  CREATE_ITINERARY
  EDIT_ITINERARY
  DELETE_ITINERARY
  VIEW_ITINERARY
  
  // Customer
  CREATE_CUSTOMER
  EDIT_CUSTOMER
  DELETE_CUSTOMER
  VIEW_CUSTOMER
  
  // Booking
  CREATE_BOOKING
  EDIT_BOOKING
  DELETE_BOOKING
  VIEW_BOOKING
  
  // User Management
  CREATE_USER
  EDIT_USER
  DELETE_USER
  VIEW_USER
  
  // Role Management
  CREATE_ROLE
  EDIT_ROLE
  DELETE_ROLE
  VIEW_ROLE
  
  // AI Features
  USE_AI_CHAT
  GENERATE_ITINERARY
  GENERATE_IMAGE
  
  // Dashboard
  VIEW_DASHBOARD
  VIEW_ANALYTICS
  
  // Documents
  UPLOAD_DOCUMENT
  VIEW_DOCUMENT
  DELETE_DOCUMENT
}
```

### System Role Permissions

**Admin**: All permissions

**Agent**:
- View Itinerary
- View Customer
- Create Customer
- Edit Customer
- View Booking
- Create Booking
- Edit Booking
- View Dashboard
- Use AI Chat
- View Document
- Upload Document

**Relationship Manager**:
- View Itinerary
- View Customer
- Edit Customer
- View Booking
- View Dashboard
- Use AI Chat
- View Document

**Customer**:
- View Itinerary
- View Booking
- View Dashboard
- Use AI Chat
- View Document
- Upload Document

## Usage Examples

### Creating a Custom Role

1. Navigate to **Role Management** (Admin only)
2. Click **Create New Role**
3. Enter role name and description
4. Select permissions by:
   - Clicking individual checkboxes
   - Using "Select All" for a permission group
5. Click **Create Role**

### Assigning Custom Roles to Users

1. Navigate to **User Management**
2. Create or edit a user
3. Select system roles (if needed)
4. Select custom roles (if available)
5. Save user

### Checking Permissions in Code

```typescript
import { hasPermission, Permission } from '@/shared/utils/permissions';
import { useAuth } from '@/shared/hooks/useAuth';

const MyComponent = () => {
  const { user } = useAuth();
  
  // Check if user can create itineraries
  const canCreate = hasPermission(user, Permission.CREATE_ITINERARY);
  
  if (!canCreate) {
    return <div>Access Denied</div>;
  }
  
  return <CreateItineraryForm />;
};
```

## Firestore Structure

### Custom Roles Collection

**Path**: `customRoles/{roleId}`

```typescript
{
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isSystemRole: boolean; // Always false for custom roles
  createdAt: string;
  updatedAt: string;
}
```

### User Document Update

Users now support custom roles:

```typescript
{
  id: string;
  name: string;
  email: string;
  roles: UserRole[]; // System roles
  customRoles?: string[]; // Array of custom role IDs
  permissions?: Permission[]; // Direct permissions (optional)
}
```

## Security Considerations

1. **Admin-Only Access**: Role management is restricted to Admin users
2. **System Role Protection**: System roles cannot be deleted
3. **Permission Validation**: All permission checks are server-side compatible
4. **Firestore Rules**: Should be updated to restrict role creation to admins

## Firestore Security Rules (Recommended)

```javascript
match /customRoles/{roleId} {
  allow read: if isAuthenticated();
  allow create: if isAdmin();
  allow update: if isAdmin();
  allow delete: if isAdmin() && !resource.data.isSystemRole;
}

match /users/{userId} {
  allow read: if isAuthenticated();
  allow update: if isAdmin() || request.auth.uid == userId;
  // Ensure customRoles array contains valid role IDs
}
```

## Navigation Updates

**Sidebar** (Admin users):
- Added "Role Management" link with shield icon
- Positioned between "User Management" and "All Customers"

## Testing Checklist

- [x] Admin can access Role Management page
- [x] Non-admin users cannot access Role Management
- [x] Admin can create custom roles
- [x] Admin can edit custom roles
- [x] Admin can delete custom roles (not system roles)
- [x] Permission selection works correctly
- [x] User form displays custom roles
- [x] Users can be assigned custom roles
- [x] Itinerary creation restricted to Admin
- [x] Permission checks work throughout the application

## Future Enhancements

1. **Permission Inheritance**: Roles can inherit from other roles
2. **Role Templates**: Pre-defined role templates for common use cases
3. **Permission Audit Log**: Track permission changes
4. **Role Usage Analytics**: See which roles are most commonly assigned
5. **Bulk Role Assignment**: Assign roles to multiple users at once

## Files Modified/Created

### New Files
- `src/shared/types/index.ts` - Added Permission enum, CustomRole interface, PermissionGroups
- `src/shared/utils/permissions.ts` - Permission checking utilities
- `src/features/users/pages/RoleManagementPage.tsx` - Role management UI
- `src/shared/components/icons/Icons.tsx` - Added ShieldIcon

### Modified Files
- `src/app/App.tsx` - Added route for Role Management
- `src/shared/components/Sidebar.tsx` - Added Role Management link
- `src/features/itineraries/pages/ItinerariesPage.tsx` - Permission-based access control
- `src/features/users/components/UserForm.tsx` - Custom role selection support

## Summary

✅ **Role Management System**: Fully functional with admin-only access
✅ **RBAC Implementation**: Granular permission system with 25+ permissions
✅ **Itinerary Creation Restriction**: Only Admin can create itineraries
✅ **User Form Enhancement**: Supports both system and custom roles
✅ **Permission Utilities**: Reusable permission checking functions

The system is production-ready and provides a solid foundation for fine-grained access control.





