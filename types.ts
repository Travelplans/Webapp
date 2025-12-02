export enum UserRole {
  ADMIN = 'Admin',
  AGENT = 'Agent',
  CUSTOMER = 'Customer',
  RELATIONSHIP_MANAGER = 'Relationship Manager',
}

export interface User {
  id: string;
  name: string;
  email: string;
  roles: UserRole[];
}

export interface Itinerary {
  id:string;
  title: string;
  destination: string;
  duration: number; // in days
  price: number;
  description?: string;
  assignedAgentId?: string;
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