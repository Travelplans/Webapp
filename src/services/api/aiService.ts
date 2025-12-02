import { auth } from '../../config/firebase';

const API_BASE_URL = import.meta.env.VITE_FUNCTIONS_URL || 'https://us-central1-travelplan-grav.cloudfunctions.net/api';

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
 * Make authenticated API request
 */
const apiRequest = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('User not authenticated');
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `API request failed: ${response.statusText}`);
  }

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || 'Request failed');
  }

  return data.data;
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

