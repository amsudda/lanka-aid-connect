import { API_BASE_URL, API_ENDPOINTS } from '@/config/api';

// Types
export interface NeedPost {
  id: string;
  victim_name: string;
  title: string;
  description: string;
  category: string;
  location_district: string;
  location_city?: string;
  location_lat?: number;
  location_lng?: number;
  quantity_needed: number;
  quantity_donated: number;
  phone_number: string;
  whatsapp_link?: string;
  status: 'active' | 'fulfilled' | 'flagged' | 'hidden';
  flag_count: number;
  edit_pin: string;
  voice_note_url?: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  images?: PostImage[];
  donations?: Donation[];
}

export interface PostImage {
  id: string;
  post_id: string;
  image_url: string;
  created_at: string;
}

export interface Donation {
  id: string;
  post_id: string;
  donor_id: string;
  quantity: number;
  created_at: string;
  donor?: {
    full_name: string;
    avatar_url?: string;
  };
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'donation_received' | 'post_fulfilled' | 'post_updated' | 'new_comment' | 'milestone_reached';
  title: string;
  message: string;
  link?: string;
  related_post_id?: string;
  related_donation_id?: string;
  is_read: boolean;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  relatedPost?: {
    id: string;
    title: string;
    category: string;
  };
  relatedDonation?: {
    id: string;
    donor_name: string;
    quantity: number;
  };
}

export interface EmergencyCenter {
  id: string;
  name: string;
  address: string;
  district: string;
  phone?: string;
  location_lat?: number;
  location_lng?: number;
  needs_list: string[];
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface DonorProfile {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url?: string;
  families_helped: number;
  items_donated: number;
  districts_active: number;
  badges: string[];
  created_at: string;
  updated_at: string;
}

export interface CreatePostData {
  victim_name: string;
  phone_number: string;
  title: string;
  description: string;
  category: string;
  location_district: string;
  location_city?: string;
  location_lat?: number;
  location_lng?: number;
  quantity_needed: number;
  num_adults?: number;
  num_children?: number;
  num_infants?: number;
  infant_ages?: number[];
  is_group_request?: boolean;
  group_size?: number;
  images?: File[];
  voiceNote?: Blob;
}

export interface CreateDonationData {
  quantity: number;
}

// API Error Class
export class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'APIError';
  }
}

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    // Handle express-validator errors array
    if (error.errors && Array.isArray(error.errors)) {
      const errorMessages = error.errors.map((e: any) => e.msg).join(', ');
      throw new APIError(response.status, errorMessages);
    }
    throw new APIError(response.status, error.message || 'An error occurred');
  }
  return response.json();
}

// Helper function to get auth token (if using JWT)
function getAuthToken(): string | null {
  return localStorage.getItem('auth_token');
}

// Helper function to create headers
function createHeaders(includeAuth = false, isFormData = false): HeadersInit {
  const headers: HeadersInit = {};

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
}

// Posts API
export const postsAPI = {
  // Get all posts
  async getAll(params?: {
    category?: string;
    district?: string;
    status?: string;
    search?: string;
  }): Promise<{ posts: NeedPost[]; total: number }> {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append('category', params.category);
    if (params?.district) queryParams.append('district', params.district);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);

    const url = `${API_BASE_URL}${API_ENDPOINTS.POSTS}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await fetch(url);
    const result = await handleResponse<{ success: boolean; data: NeedPost[]; count: number }>(response);
    return { posts: result.data, total: result.count };
  },

  // Get post by ID
  async getById(id: string): Promise<NeedPost> {
    const url = `${API_BASE_URL}${API_ENDPOINTS.POST_BY_ID(id)}`;
    const response = await fetch(url);
    const result = await handleResponse<{ success: boolean; data: NeedPost }>(response);
    return result.data;
  },

  // Create new post
  async create(data: CreatePostData): Promise<NeedPost> {
    const formData = new FormData();

    // Append text fields
    formData.append('victim_name', data.victim_name);
    formData.append('phone_number', data.phone_number);
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('category', data.category);
    formData.append('location_district', data.location_district);
    if (data.location_city) formData.append('location_city', data.location_city);
    if (data.location_lat) formData.append('location_lat', data.location_lat.toString());
    if (data.location_lng) formData.append('location_lng', data.location_lng.toString());
    formData.append('quantity_needed', data.quantity_needed.toString());

    // Append family composition fields
    if (data.num_adults !== undefined) formData.append('num_adults', data.num_adults.toString());
    if (data.num_children !== undefined) formData.append('num_children', data.num_children.toString());
    if (data.num_infants !== undefined) formData.append('num_infants', data.num_infants.toString());
    if (data.infant_ages && data.infant_ages.length > 0) formData.append('infant_ages', JSON.stringify(data.infant_ages));
    if (data.is_group_request !== undefined) formData.append('is_group_request', data.is_group_request.toString());
    if (data.group_size !== undefined) formData.append('group_size', data.group_size.toString());

    // Append images
    if (data.images && data.images.length > 0) {
      data.images.forEach((image) => {
        formData.append('images', image);
      });
    }

    // Append voice note
    if (data.voiceNote) {
      formData.append('voice_note', data.voiceNote, 'voice-note.webm');
    }

    const url = `${API_BASE_URL}${API_ENDPOINTS.POSTS}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: createHeaders(true, true), // Changed to true to include auth token
      body: formData,
    });
    const result = await handleResponse<{ success: boolean; data: NeedPost; pin: string }>(response);
    return result.data;
  },

  // Get posts stats
  async getStats(): Promise<{
    total: number;
    active: number;
    fulfilled: number;
    totalQuantityNeeded: number;
    totalQuantityDonated: number;
  }> {
    const url = `${API_BASE_URL}${API_ENDPOINTS.POSTS_STATS}`;
    const response = await fetch(url);
    return handleResponse(response);
  },

  // Flag a post
  async flag(id: string, reason: string): Promise<{ message: string }> {
    const url = `${API_BASE_URL}${API_ENDPOINTS.FLAG_POST(id)}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: createHeaders(true),
      body: JSON.stringify({ reason }),
    });
    return handleResponse(response);
  },

  // Get user's own posts
  async getMyPosts(): Promise<NeedPost[]> {
    const url = `${API_BASE_URL}${API_ENDPOINTS.MY_POSTS}`;
    const response = await fetch(url, {
      headers: createHeaders(true),
    });
    const result = await handleResponse<{ success: boolean; data: NeedPost[] }>(response);
    return result.data;
  },

  // Save a post (localStorage fallback)
  async savePost(postId: string): Promise<void> {
    try {
      const url = `${API_BASE_URL}${API_ENDPOINTS.SAVE_POST(postId)}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: createHeaders(true),
      });
      await handleResponse(response);
    } catch (error) {
      // Fallback to localStorage if API not available
      const saved = JSON.parse(localStorage.getItem('saved_posts') || '[]');
      if (!saved.includes(postId)) {
        saved.push(postId);
        localStorage.setItem('saved_posts', JSON.stringify(saved));
      }
    }
  },

  // Unsave a post (localStorage fallback)
  async unsavePost(postId: string): Promise<void> {
    try {
      const url = `${API_BASE_URL}${API_ENDPOINTS.UNSAVE_POST(postId)}`;
      const response = await fetch(url, {
        method: 'DELETE',
        headers: createHeaders(true),
      });
      await handleResponse(response);
    } catch (error) {
      // Fallback to localStorage if API not available
      const saved = JSON.parse(localStorage.getItem('saved_posts') || '[]');
      const filtered = saved.filter((id: string) => id !== postId);
      localStorage.setItem('saved_posts', JSON.stringify(filtered));
    }
  },

  // Get saved posts (localStorage fallback)
  async getSavedPosts(): Promise<NeedPost[]> {
    try {
      const url = `${API_BASE_URL}${API_ENDPOINTS.SAVED_POSTS}`;
      const response = await fetch(url, {
        headers: createHeaders(true),
      });
      const result = await handleResponse<{ success: boolean; data: NeedPost[] }>(response);
      return result.data;
    } catch (error) {
      // Fallback to localStorage if API not available
      const savedIds = JSON.parse(localStorage.getItem('saved_posts') || '[]');
      if (savedIds.length === 0) return [];

      // Fetch all posts and filter by saved IDs
      const { posts } = await this.getAll();
      return posts.filter(post => savedIds.includes(post.id));
    }
  },

  // Check if post is saved (localStorage)
  isPostSaved(postId: string): boolean {
    const saved = JSON.parse(localStorage.getItem('saved_posts') || '[]');
    return saved.includes(postId);
  },

  // Delete a post
  async deletePost(postId: string): Promise<{ success: boolean; message: string }> {
    const url = `${API_BASE_URL}${API_ENDPOINTS.POSTS}/${postId}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: createHeaders(true),
    });
    return handleResponse(response);
  },
};

// Donations API
export const donationsAPI = {
  // Create donation
  async create(postId: string, data: CreateDonationData): Promise<Donation> {
    const url = `${API_BASE_URL}${API_ENDPOINTS.DONATE(postId)}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: createHeaders(true),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // Get donations for a post
  async getByPost(postId: string): Promise<Donation[]> {
    const url = `${API_BASE_URL}${API_ENDPOINTS.POST_DONATIONS(postId)}`;
    const response = await fetch(url);
    return handleResponse(response);
  },

  // Get user's donations
  async getMyDonations(): Promise<Donation[]> {
    const url = `${API_BASE_URL}${API_ENDPOINTS.USER_DONATIONS}`;
    const response = await fetch(url, {
      headers: createHeaders(true),
    });
    return handleResponse(response);
  },
};

// Emergency Centers API
export const centersAPI = {
  // Get all centers
  async getAll(district?: string): Promise<EmergencyCenter[]> {
    const url = `${API_BASE_URL}${API_ENDPOINTS.CENTERS}${district ? '?district=' + district : ''}`;
    const response = await fetch(url);
    const result = await handleResponse<{ success: boolean; data: EmergencyCenter[] }>(response);
    return result.data;
  },

  // Get center by ID
  async getById(id: string): Promise<EmergencyCenter> {
    const url = `${API_BASE_URL}${API_ENDPOINTS.CENTER_BY_ID(id)}`;
    const response = await fetch(url);
    const result = await handleResponse<{ success: boolean; data: EmergencyCenter }>(response);
    return result.data;
  },

  // Create new center
  async create(data: {
    name: string;
    address: string;
    district: string;
    phone?: string;
    location_lat?: number;
    location_lng?: number;
    needs_list?: string[];
  }): Promise<EmergencyCenter> {
    const url = `${API_BASE_URL}${API_ENDPOINTS.CENTERS}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: createHeaders(false),
      body: JSON.stringify(data),
    });
    const result = await handleResponse<{ success: boolean; data: EmergencyCenter }>(response);
    return result.data;
  },
};

// Profiles API
export const profilesAPI = {
  // Get leaderboard
  async getLeaderboard(limit?: number): Promise<DonorProfile[]> {
    const url = `${API_BASE_URL}${API_ENDPOINTS.PROFILES_LEADERBOARD}${limit ? '?limit=' + limit : ''}`;
    const response = await fetch(url);
    return handleResponse(response);
  },

  // Get my profile
  async getMyProfile(): Promise<DonorProfile> {
    const url = `${API_BASE_URL}${API_ENDPOINTS.PROFILE_ME}`;
    const response = await fetch(url, {
      headers: createHeaders(true),
    });
    return handleResponse(response);
  },

  // Get profile by ID
  async getById(id: string): Promise<DonorProfile> {
    const url = `${API_BASE_URL}${API_ENDPOINTS.PROFILE_BY_ID(id)}`;
    const response = await fetch(url);
    return handleResponse(response);
  },
};

// Auth API
export const authAPI = {
  // Google OAuth login
  getGoogleAuthUrl(userType?: string): string {
    const baseUrl = `${API_BASE_URL}${API_ENDPOINTS.AUTH_GOOGLE}`;
    if (userType) {
      return `${baseUrl}?userType=${userType}`;
    }
    return baseUrl;
  },

  // Get current user
  async getMe(): Promise<any> {
    const url = `${API_BASE_URL}${API_ENDPOINTS.AUTH_ME}`;
    const response = await fetch(url, {
      headers: createHeaders(true),
    });
    return handleResponse(response);
  },

  // Logout
  async logout(): Promise<{ message: string }> {
    const url = `${API_BASE_URL}${API_ENDPOINTS.AUTH_LOGOUT}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: createHeaders(true),
    });
    return handleResponse(response);
  },

  // Update profile
  async updateProfile(data: Partial<DonorProfile>): Promise<DonorProfile> {
    const url = `${API_BASE_URL}${API_ENDPOINTS.AUTH_UPDATE_PROFILE}`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: createHeaders(true),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
};

// Notifications API
export const notificationsAPI = {
  // Get all notifications
  async getAll(unreadOnly: boolean = false, limit: number = 20, offset: number = 0): Promise<{
    notifications: Notification[];
    count: number;
    unreadCount: number;
  }> {
    const url = `${API_BASE_URL}${API_ENDPOINTS.NOTIFICATIONS}?unread_only=${unreadOnly}&limit=${limit}&offset=${offset}`;
    const response = await fetch(url, {
      headers: createHeaders(true),
    });
    const result = await handleResponse<{ success: boolean; data: Notification[]; count: number; unreadCount: number }>(response);
    return {
      notifications: result.data,
      count: result.count,
      unreadCount: result.unreadCount
    };
  },

  // Get unread count
  async getUnreadCount(): Promise<number> {
    const url = `${API_BASE_URL}${API_ENDPOINTS.NOTIFICATIONS_UNREAD_COUNT}`;
    const response = await fetch(url, {
      headers: createHeaders(true),
    });
    const result = await handleResponse<{ success: boolean; count: number }>(response);
    return result.count;
  },

  // Mark as read
  async markAsRead(id: string): Promise<Notification> {
    const url = `${API_BASE_URL}${API_ENDPOINTS.NOTIFICATION_MARK_READ(id)}`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: createHeaders(true),
    });
    const result = await handleResponse<{ success: boolean; data: Notification }>(response);
    return result.data;
  },

  // Mark all as read
  async markAllAsRead(): Promise<void> {
    const url = `${API_BASE_URL}${API_ENDPOINTS.NOTIFICATIONS_MARK_ALL_READ}`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: createHeaders(true),
    });
    await handleResponse(response);
  },

  // Delete notification
  async delete(id: string): Promise<void> {
    const url = `${API_BASE_URL}${API_ENDPOINTS.NOTIFICATION_DELETE(id)}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: createHeaders(true),
    });
    await handleResponse(response);
  },
};

// Health check
export const healthAPI = {
  async check(): Promise<{ status: string; timestamp: string }> {
    const url = `${API_BASE_URL}${API_ENDPOINTS.HEALTH}`;
    const response = await fetch(url);
    return handleResponse(response);
  },
};
