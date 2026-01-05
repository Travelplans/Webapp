import { auth } from '../../config/firebase';

// Detect if we're using emulators (development mode)
const isEmulator = import.meta.env.DEV && !import.meta.env.VITE_FUNCTIONS_URL;
const API_BASE_URL = import.meta.env.VITE_FUNCTIONS_URL || 
  (isEmulator 
    ? 'http://localhost:5001/travelplans-web-b43c6/us-central1/api'
    : 'https://us-central1-travelplans-web-b43c6.cloudfunctions.net/api');

/**
 * Get authentication token for API requests
 */
const getAuthToken = async (): Promise<string | null> => {
  const user = auth.currentUser;
  if (!user) {
    return null;
  }
  return await user.getIdToken();
};

/**
 * Wait for auth to be ready
 */
const waitForAuth = async (): Promise<void> => {
  // Wait a bit for auth to initialize if needed
  if (!auth.currentUser) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
};

/**
 * Make authenticated API request with 401 error handling
 */
const apiRequest = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  // Wait for auth to be ready
  await waitForAuth();
  
  let token = await getAuthToken();
  if (!token) {
    // Redirect to login if no token
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('User not authenticated');
  }

  const url = `${API_BASE_URL}${endpoint}`;
  console.log('[apiRequest] Making request to:', url);
  console.log('[apiRequest] API_BASE_URL:', API_BASE_URL);

  const makeRequest = async (isRetry: boolean = false): Promise<T> => {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...options.headers,
        },
      });

      console.log('[apiRequest] Response status:', response.status, response.statusText);

      // Handle 401 Unauthorized - try refreshing token once
      if (response.status === 401 && !isRetry) {
        console.log('[apiRequest] 401 Unauthorized, refreshing token and retrying...');
        
        // Refresh token
        token = await getAuthToken(true);
        if (token) {
          // Retry request with new token
          return makeRequest(true);
        } else {
          // No token available, redirect to login
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          throw new Error('Unauthorized: Please login again');
        }
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('[apiRequest] Error response:', error);
        
        // Handle 401 even on retry
        if (response.status === 401) {
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          throw new Error('Unauthorized: Please login again');
        }
        
        throw new Error(error.error || `API request failed: ${response.statusText} (${response.status})`);
      }

      const data = await response.json();
      console.log('[apiRequest] Response data:', data);
      
      if (!data.success) {
        console.error('[apiRequest] Request failed - success is false:', data);
        throw new Error(data.error || 'Request failed');
      }

      return data.data;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('[apiRequest] Network error - Cloud Function may not be deployed or accessible:', error);
        throw new Error(`Cannot connect to Cloud Function. Please ensure it is deployed. URL: ${url}`);
      }
      throw error;
    }
  };

  return makeRequest();
};

/**
 * Generate travel itinerary using AI
 */
export interface GenerateItineraryParams {
  destination: string;
  duration: string;
  travelerType: string;
  budget: string;
}

export interface GeneratedItinerary {
  title: string;
  price: number;
  description: string;
  dailyPlan: {
    day: number;
    title: string;
    activities: string;
  }[];
}

export const generateItinerary = async (params: GenerateItineraryParams): Promise<GeneratedItinerary> => {
  return apiRequest<GeneratedItinerary>('/generateItinerary', {
    method: 'POST',
    body: JSON.stringify(params),
  });
};

/**
 * Generate image using AI
 */
export interface GenerateImageParams {
  prompt?: string;
  destination?: string;
}

export interface GeneratedImage {
  imageUrl: string;
}

export const generateImage = async (params: GenerateImageParams): Promise<GeneratedImage> => {
  return apiRequest<GeneratedImage>('/generateImage', {
    method: 'POST',
    body: JSON.stringify(params),
  });
};

/**
 * Chat with AI assistant
 */
export interface ChatParams {
  message: string;
  itineraryContext?: string;
}

export interface ChatResponse {
  text: string;
}

export const chatWithAI = async (params: ChatParams): Promise<ChatResponse> => {
  return apiRequest<ChatResponse>('/chat', {
    method: 'POST',
    body: JSON.stringify(params),
  });
};

/**
 * Create a new user with Firebase Auth
 */
export interface CreateUserParams {
  email: string;
  password: string;
  name: string;
  countryCode: string;
  contactNumber: string;
  roles: string[];
  customRoles?: string[];
}

export interface CreateUserResponse {
  uid: string;
  email: string;
  name: string;
  roles: string[];
}

export const createUser = async (params: CreateUserParams): Promise<CreateUserResponse> => {
  return apiRequest<CreateUserResponse>('/createUser', {
    method: 'POST',
    body: JSON.stringify(params),
  });
};

/**
 * Update user password (Admin only)
 */
export interface UpdateUserPasswordParams {
  userId: string;
  password: string;
}

export interface UpdateUserPasswordResponse {
  uid: string;
  email: string;
}

export const updateUserPassword = async (params: UpdateUserPasswordParams): Promise<UpdateUserPasswordResponse> => {
  return apiRequest<UpdateUserPasswordResponse>('/updateUserPassword', {
    method: 'POST',
    body: JSON.stringify(params),
  });
};

/**
 * Send WhatsApp message to users (Admin only)
 */
export interface SendWhatsAppParams {
  userIds: string[];
  message: string;
}

export interface SendWhatsAppResult {
  userId: string;
  email: string;
  phoneNumber?: string;
  messageSid?: string;
  status: string;
}

export interface SendWhatsAppError {
  userId: string;
  email: string;
  phoneNumber?: string;
  error: string;
}

export interface SendWhatsAppResponse {
  sent: number;
  failed: number;
  results: SendWhatsAppResult[];
  errors?: SendWhatsAppError[];
}

export const sendWhatsApp = async (params: SendWhatsAppParams): Promise<SendWhatsAppResponse> => {
  return apiRequest<SendWhatsAppResponse>('/sendWhatsApp', {
    method: 'POST',
    body: JSON.stringify(params),
  });
};

