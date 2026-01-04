export enum UserRole {
  ADMIN = 'Admin',
  AGENT = 'Agent',
  CUSTOMER = 'Customer',
  RELATIONSHIP_MANAGER = 'Relationship Manager',
}

// Permission system for RBAC
export enum Permission {
  // Itinerary permissions
  CREATE_ITINERARY = 'create_itinerary',
  EDIT_ITINERARY = 'edit_itinerary',
  DELETE_ITINERARY = 'delete_itinerary',
  VIEW_ITINERARY = 'view_itinerary',
  
  // Customer permissions
  CREATE_CUSTOMER = 'create_customer',
  EDIT_CUSTOMER = 'edit_customer',
  DELETE_CUSTOMER = 'delete_customer',
  VIEW_CUSTOMER = 'view_customer',
  
  // Booking permissions
  CREATE_BOOKING = 'create_booking',
  EDIT_BOOKING = 'edit_booking',
  DELETE_BOOKING = 'delete_booking',
  VIEW_BOOKING = 'view_booking',
  
  // User management permissions
  CREATE_USER = 'create_user',
  EDIT_USER = 'edit_user',
  DELETE_USER = 'delete_user',
  VIEW_USER = 'view_user',
  
  // Role management permissions
  CREATE_ROLE = 'create_role',
  EDIT_ROLE = 'edit_role',
  DELETE_ROLE = 'delete_role',
  VIEW_ROLE = 'view_role',
  
  // AI permissions
  USE_AI_CHAT = 'use_ai_chat',
  GENERATE_ITINERARY = 'generate_itinerary',
  GENERATE_IMAGE = 'generate_image',
  
  // Dashboard permissions
  VIEW_DASHBOARD = 'view_dashboard',
  VIEW_ANALYTICS = 'view_analytics',
  
  // Document permissions
  UPLOAD_DOCUMENT = 'upload_document',
  VIEW_DOCUMENT = 'view_document',
  DELETE_DOCUMENT = 'delete_document',
}

// Custom Role interface for RBAC
export interface CustomRole {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isSystemRole: boolean; // System roles (Admin, Agent, etc.) cannot be deleted
  createdAt: string;
  updatedAt: string;
}

// Permission groups for easier management
export const PermissionGroups = {
  ITINERARY: [
    Permission.CREATE_ITINERARY,
    Permission.EDIT_ITINERARY,
    Permission.DELETE_ITINERARY,
    Permission.VIEW_ITINERARY,
  ],
  CUSTOMER: [
    Permission.CREATE_CUSTOMER,
    Permission.EDIT_CUSTOMER,
    Permission.DELETE_CUSTOMER,
    Permission.VIEW_CUSTOMER,
  ],
  BOOKING: [
    Permission.CREATE_BOOKING,
    Permission.EDIT_BOOKING,
    Permission.DELETE_BOOKING,
    Permission.VIEW_BOOKING,
  ],
  USER_MANAGEMENT: [
    Permission.CREATE_USER,
    Permission.EDIT_USER,
    Permission.DELETE_USER,
    Permission.VIEW_USER,
  ],
  ROLE_MANAGEMENT: [
    Permission.CREATE_ROLE,
    Permission.EDIT_ROLE,
    Permission.DELETE_ROLE,
    Permission.VIEW_ROLE,
  ],
  AI_FEATURES: [
    Permission.USE_AI_CHAT,
    Permission.GENERATE_ITINERARY,
    Permission.GENERATE_IMAGE,
  ],
  DASHBOARD: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_ANALYTICS,
  ],
  DOCUMENTS: [
    Permission.UPLOAD_DOCUMENT,
    Permission.VIEW_DOCUMENT,
    Permission.DELETE_DOCUMENT,
  ],
};

export interface User {
  id: string;
  name: string;
  email: string;
  countryCode: string; // Country code (e.g., "+971", "+1")
  contactNumber: string; // Contact number without country code
  useSameAsContact?: boolean; // If true, WhatsApp uses same number as contact
  whatsappCountryCode?: string; // WhatsApp country code (if different from contact)
  whatsappNumber?: string; // WhatsApp number without country code (if different from contact)
  roles: UserRole[];
  customRoles?: string[]; // IDs of custom roles
  permissions?: Permission[]; // Direct permissions (for flexibility)
}

export interface DailyPlan {
  day: number;
  title: string;
  activities: string;
}

export interface Itinerary {
  id:string;
  title: string;
  destination: string;
  duration: number; // in days
  price: number;
  description?: string;
  dailyPlan?: DailyPlan[]; // Day-by-day breakdown for AI-generated itineraries
  assignedAgentId?: string; // Deprecated: kept for backward compatibility
  assignedAgentIds?: string[]; // New: supports multiple agents
  collaterals: ItineraryCollateral[];
  imageUrl: string;
}

export interface RecommendedItinerary {
    itinerary: Itinerary;
    reason: string;
}

export enum CollateralType {
    PDF = 'PDF',
    DOCX = 'DOCX',
    PPTX = 'PPTX',
    IMAGE = 'Image',
    VIDEO = 'Video',
}

export interface ItineraryCollateral {
    id: string;
    name: string;
    type: CollateralType;
    url: string;
    approved: boolean;
    aiFeedback?: {
      issuesFound: boolean;
      feedback: string;
    };
}

export interface CustomerDocument {
    id: string;
    name: string;
    type: 'PDF' | 'DOCX' | 'JPG' | 'PNG';
    url: string;
    uploadDate: string;
    verifiedStatus?: 'Verified' | 'Rejected' | 'Pending' | 'Error';
    aiFeedback?: string;
}

export interface Customer {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    dob: string;
    registrationDate: string;
    registeredByAgentId: string;
    assignedRmId?: string;
    bookingStatus: 'Pending' | 'Confirmed' | 'Completed';
    documents: CustomerDocument[];
}

export interface Booking {
  id: string;
  customerId: string;
  itineraryId: string;
  bookingDate: string;
  status: 'Pending' | 'Confirmed' | 'Completed';
  paymentStatus: 'Paid' | 'Unpaid';
}

