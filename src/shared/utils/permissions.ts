/**
 * Permission and RBAC utilities
 */

import { User, UserRole, Permission, CustomRole } from '../types';

// System role to permission mapping
const SYSTEM_ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: Object.values(Permission), // Admin has all permissions
  [UserRole.AGENT]: [
    Permission.VIEW_ITINERARY,
    Permission.VIEW_CUSTOMER,
    Permission.CREATE_CUSTOMER,
    Permission.EDIT_CUSTOMER,
    Permission.VIEW_BOOKING,
    Permission.CREATE_BOOKING,
    Permission.EDIT_BOOKING,
    Permission.VIEW_DASHBOARD,
    Permission.USE_AI_CHAT,
    Permission.VIEW_DOCUMENT,
    Permission.UPLOAD_DOCUMENT,
  ],
  [UserRole.RELATIONSHIP_MANAGER]: [
    Permission.VIEW_ITINERARY,
    Permission.VIEW_CUSTOMER,
    Permission.EDIT_CUSTOMER,
    Permission.VIEW_BOOKING,
    Permission.VIEW_DASHBOARD,
    Permission.USE_AI_CHAT,
    Permission.VIEW_DOCUMENT,
  ],
  [UserRole.CUSTOMER]: [
    Permission.VIEW_ITINERARY,
    Permission.VIEW_BOOKING,
    Permission.VIEW_DASHBOARD,
    Permission.USE_AI_CHAT,
    Permission.VIEW_DOCUMENT,
    Permission.UPLOAD_DOCUMENT,
  ],
};

/**
 * Get all permissions for a user (from system roles + custom roles)
 */
export const getUserPermissions = (
  user: User | null,
  customRoles: CustomRole[] = []
): Permission[] => {
  if (!user) return [];

  const permissions = new Set<Permission>();

  // Add permissions from system roles
  user.roles.forEach((role) => {
    SYSTEM_ROLE_PERMISSIONS[role]?.forEach((perm) => permissions.add(perm));
  });

  // Add permissions from custom roles
  if (user.customRoles) {
    user.customRoles.forEach((roleId) => {
      const customRole = customRoles.find((r) => r.id === roleId);
      customRole?.permissions.forEach((perm) => permissions.add(perm));
    });
  }

  // Add direct permissions
  if (user.permissions) {
    user.permissions.forEach((perm) => permissions.add(perm));
  }

  return Array.from(permissions);
};

/**
 * Check if user has a specific permission
 */
export const hasPermission = (
  user: User | null,
  permission: Permission,
  customRoles: CustomRole[] = []
): boolean => {
  if (!user) return false;

  // Admin always has all permissions
  if (user.roles.includes(UserRole.ADMIN)) {
    return true;
  }

  const userPermissions = getUserPermissions(user, customRoles);
  return userPermissions.includes(permission);
};

/**
 * Check if user has any of the specified permissions
 */
export const hasAnyPermission = (
  user: User | null,
  permissions: Permission[],
  customRoles: CustomRole[] = []
): boolean => {
  if (!user) return false;
  if (user.roles.includes(UserRole.ADMIN)) return true;

  const userPermissions = getUserPermissions(user, customRoles);
  return permissions.some((perm) => userPermissions.includes(perm));
};

/**
 * Check if user has all of the specified permissions
 */
export const hasAllPermissions = (
  user: User | null,
  permissions: Permission[],
  customRoles: CustomRole[] = []
): boolean => {
  if (!user) return false;
  if (user.roles.includes(UserRole.ADMIN)) return true;

  const userPermissions = getUserPermissions(user, customRoles);
  return permissions.every((perm) => userPermissions.includes(perm));
};

/**
 * Check if user is Admin
 */
export const isAdmin = (user: User | null): boolean => {
  return user?.roles.includes(UserRole.ADMIN) ?? false;
};

/**
 * Get permission display name
 */
export const getPermissionDisplayName = (permission: Permission): string => {
  const names: Record<Permission, string> = {
    [Permission.CREATE_ITINERARY]: 'Create Itinerary',
    [Permission.EDIT_ITINERARY]: 'Edit Itinerary',
    [Permission.DELETE_ITINERARY]: 'Delete Itinerary',
    [Permission.VIEW_ITINERARY]: 'View Itinerary',
    [Permission.CREATE_CUSTOMER]: 'Create Customer',
    [Permission.EDIT_CUSTOMER]: 'Edit Customer',
    [Permission.DELETE_CUSTOMER]: 'Delete Customer',
    [Permission.VIEW_CUSTOMER]: 'View Customer',
    [Permission.CREATE_BOOKING]: 'Create Booking',
    [Permission.EDIT_BOOKING]: 'Edit Booking',
    [Permission.DELETE_BOOKING]: 'Delete Booking',
    [Permission.VIEW_BOOKING]: 'View Booking',
    [Permission.CREATE_USER]: 'Create User',
    [Permission.EDIT_USER]: 'Edit User',
    [Permission.DELETE_USER]: 'Delete User',
    [Permission.VIEW_USER]: 'View User',
    [Permission.CREATE_ROLE]: 'Create Role',
    [Permission.EDIT_ROLE]: 'Edit Role',
    [Permission.DELETE_ROLE]: 'Delete Role',
    [Permission.VIEW_ROLE]: 'View Role',
    [Permission.USE_AI_CHAT]: 'Use AI Chat',
    [Permission.GENERATE_ITINERARY]: 'Generate Itinerary (AI)',
    [Permission.GENERATE_IMAGE]: 'Generate Image (AI)',
    [Permission.VIEW_DASHBOARD]: 'View Dashboard',
    [Permission.VIEW_ANALYTICS]: 'View Analytics',
    [Permission.UPLOAD_DOCUMENT]: 'Upload Document',
    [Permission.VIEW_DOCUMENT]: 'View Document',
    [Permission.DELETE_DOCUMENT]: 'Delete Document',
  };
  return names[permission] || permission;
};

