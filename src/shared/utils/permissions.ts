/**
 * Permission and RBAC utilities
 */

import { User, UserRole, Permission, CustomRole } from '../types';

// Default system role to permission mapping (fallback if not in Firestore)
export const DEFAULT_SYSTEM_ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: Object.values(Permission), // Admin has all permissions
  [UserRole.AGENT]: [
    Permission.VIEW_ITINERARY,
    // Removed CREATE_ITINERARY - only admins can create
    Permission.EDIT_ITINERARY, // Only for assigned itineraries (enforced by Firestore rules)
    Permission.VIEW_CUSTOMER,
    Permission.CREATE_CUSTOMER,
    Permission.EDIT_CUSTOMER,
    Permission.VIEW_BOOKING,
    Permission.CREATE_BOOKING,
    Permission.EDIT_BOOKING,
    Permission.VIEW_DASHBOARD,
    Permission.USE_AI_CHAT,
    Permission.GENERATE_ITINERARY,
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

// Cache for system roles loaded from Firestore
let systemRolesCache: Map<UserRole, Permission[]> | null = null;
let systemRolesCacheTimestamp: number = 0;
// Keep this short so permission changes in Firestore reflect quickly in the UI.
const CACHE_DURATION = 10 * 1000; // 10 seconds

/**
 * Get system role permissions from Firestore or fallback to defaults
 */
export const getSystemRolePermissions = async (role: UserRole): Promise<Permission[]> => {
  // Try to load from Firestore if cache is expired or doesn't exist
  if (!systemRolesCache || Date.now() - systemRolesCacheTimestamp > CACHE_DURATION) {
    try {
      const { collection, getDocs } = await import('firebase/firestore');
      const { db } = await import('../../config/firebase');
      
      const systemRolesSnapshot = await getDocs(collection(db, 'systemRoles'));
      const rolesMap = new Map<UserRole, Permission[]>();
      
      systemRolesSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const roleName = data.name as UserRole;
        if (roleName && data.permissions && Array.isArray(data.permissions)) {
          rolesMap.set(roleName, data.permissions as Permission[]);
        }
      });
      
      // If we found system roles in Firestore, use them; otherwise use defaults
      if (rolesMap.size > 0) {
        systemRolesCache = rolesMap;
      } else {
        // Initialize Firestore with defaults if empty
        systemRolesCache = new Map(Object.entries(DEFAULT_SYSTEM_ROLE_PERMISSIONS) as [UserRole, Permission[]][]);
      }
      
      systemRolesCacheTimestamp = Date.now();
    } catch (error) {
      console.warn('[getSystemRolePermissions] Error loading from Firestore, using defaults:', error);
      // Use defaults on error
      systemRolesCache = new Map(Object.entries(DEFAULT_SYSTEM_ROLE_PERMISSIONS) as [UserRole, Permission[]][]);
    }
  }
  
  // Return from cache or defaults
  return systemRolesCache?.get(role) || DEFAULT_SYSTEM_ROLE_PERMISSIONS[role] || [];
};

/**
 * Clear the system roles cache (call after updating system roles)
 */
export const clearSystemRolesCache = () => {
  systemRolesCache = null;
  systemRolesCacheTimestamp = 0;
};

/**
 * Get all permissions for a user (from system roles + custom roles)
 * Note: This is async now to support loading system roles from Firestore
 */
export const getUserPermissions = async (
  user: User | null,
  customRoles: CustomRole[] = []
): Promise<Permission[]> => {
  if (!user) return [];

  const permissions = new Set<Permission>();

  // Add permissions from system roles (load from Firestore or use defaults)
  for (const role of user.roles) {
    const rolePermissions = await getSystemRolePermissions(role);
    rolePermissions.forEach((perm) => permissions.add(perm));
  }

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
 * Synchronous version that uses defaults (for backwards compatibility)
 */
export const getUserPermissionsSync = (
  user: User | null,
  customRoles: CustomRole[] = []
): Permission[] => {
  if (!user) return [];

  const permissions = new Set<Permission>();

  // Add permissions from system roles (use defaults)
  user.roles.forEach((role) => {
    DEFAULT_SYSTEM_ROLE_PERMISSIONS[role]?.forEach((perm) => permissions.add(perm));
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
 * Check if user has a specific permission (async version)
 */
export const hasPermission = async (
  user: User | null,
  permission: Permission,
  customRoles: CustomRole[] = []
): Promise<boolean> => {
  if (!user) return false;

  // Admin always has all permissions
  if (user.roles.includes(UserRole.ADMIN)) {
    return true;
  }

  const userPermissions = await getUserPermissions(user, customRoles);
  return userPermissions.includes(permission);
};

/**
 * Synchronous version for backwards compatibility
 */
export const hasPermissionSync = (
  user: User | null,
  permission: Permission,
  customRoles: CustomRole[] = []
): boolean => {
  if (!user) return false;

  // Admin always has all permissions
  if (user.roles.includes(UserRole.ADMIN)) {
    return true;
  }

  const userPermissions = getUserPermissionsSync(user, customRoles);
  return userPermissions.includes(permission);
};

/**
 * Check if user has any of the specified permissions (async version)
 */
export const hasAnyPermission = async (
  user: User | null,
  permissions: Permission[],
  customRoles: CustomRole[] = []
): Promise<boolean> => {
  if (!user) return false;
  if (user.roles.includes(UserRole.ADMIN)) return true;

  const userPermissions = await getUserPermissions(user, customRoles);
  return permissions.some((perm) => userPermissions.includes(perm));
};

/**
 * Check if user has all of the specified permissions (async version)
 */
export const hasAllPermissions = async (
  user: User | null,
  permissions: Permission[],
  customRoles: CustomRole[] = []
): Promise<boolean> => {
  if (!user) return false;
  if (user.roles.includes(UserRole.ADMIN)) return true;

  const userPermissions = await getUserPermissions(user, customRoles);
  return permissions.every((perm) => userPermissions.includes(perm));
};

/**
 * Synchronous versions for backwards compatibility
 */
export const hasAnyPermissionSync = (
  user: User | null,
  permissions: Permission[],
  customRoles: CustomRole[] = []
): boolean => {
  if (!user) return false;
  if (user.roles.includes(UserRole.ADMIN)) return true;

  const userPermissions = getUserPermissionsSync(user, customRoles);
  return permissions.some((perm) => userPermissions.includes(perm));
};

export const hasAllPermissionsSync = (
  user: User | null,
  permissions: Permission[],
  customRoles: CustomRole[] = []
): boolean => {
  if (!user) return false;
  if (user.roles.includes(UserRole.ADMIN)) return true;

  const userPermissions = getUserPermissionsSync(user, customRoles);
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

