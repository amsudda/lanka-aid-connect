import { API_BASE_URL } from '@/config/api';

// Admin API endpoints
const ADMIN_ENDPOINTS = {
  LOGIN: '/admin/login',
  DASHBOARD_STATS: '/admin/dashboard/stats',
  POSTS: '/admin/posts',
  POST_STATUS: (id: string) => `/admin/posts/${id}/status`,
  DELETE_POST: (id: string) => `/admin/posts/${id}`,
  FLAGS: '/admin/flags',
  RESOLVE_FLAG: (id: string) => `/admin/flags/${id}/resolve`,
  USERS: '/admin/users',
  VERIFY_USER: (id: string) => `/admin/users/${id}/verify`,
};

// Helper function to create headers
function createHeaders(includeAuth: boolean = true): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = localStorage.getItem('admin_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
}

// Helper function to handle responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || 'An error occurred');
  }
  return response.json();
}

// Admin API
export const adminAPI = {
  // Login
  async login(email: string, password: string): Promise<{
    success: boolean;
    token: string;
    admin: {
      id: string;
      email: string;
      full_name: string;
      role: string;
    };
  }> {
    const url = `${API_BASE_URL}${ADMIN_ENDPOINTS.LOGIN}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: createHeaders(false),
      body: JSON.stringify({ email, password }),
    });
    const result = await handleResponse<any>(response);
    // Store token
    if (result.token) {
      localStorage.setItem('admin_token', result.token);
    }
    return result;
  },

  // Logout
  logout() {
    localStorage.removeItem('admin_token');
  },

  // Check if admin is logged in
  isLoggedIn(): boolean {
    return !!localStorage.getItem('admin_token');
  },

  // Get dashboard stats
  async getDashboardStats(): Promise<{
    stats: {
      posts: { total: number; active: number; fulfilled: number; pending: number };
      users: { total: number; donors: number; requesters: number };
      flags: { pending: number };
      donations: { total: number; items: number };
    };
    recentActivity: {
      posts: any[];
      flags: any[];
    };
  }> {
    const url = `${API_BASE_URL}${ADMIN_ENDPOINTS.DASHBOARD_STATS}`;
    const response = await fetch(url, {
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  // Get all posts
  async getPosts(status: string = 'all', page: number = 1): Promise<{
    success: boolean;
    count: number;
    totalPages: number;
    currentPage: number;
    posts: any[];
  }> {
    const url = `${API_BASE_URL}${ADMIN_ENDPOINTS.POSTS}?status=${status}&page=${page}`;
    const response = await fetch(url, {
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  // Update post status
  async updatePostStatus(id: string, status?: string, is_verified?: boolean): Promise<any> {
    const url = `${API_BASE_URL}${ADMIN_ENDPOINTS.POST_STATUS(id)}`;
    const body: any = {};
    if (status !== undefined) body.status = status;
    if (is_verified !== undefined) body.is_verified = is_verified;

    const response = await fetch(url, {
      method: 'PUT',
      headers: createHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse(response);
  },

  // Delete post
  async deletePost(id: string): Promise<any> {
    const url = `${API_BASE_URL}${ADMIN_ENDPOINTS.DELETE_POST(id)}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  // Get flags
  async getFlags(resolved: boolean = false): Promise<{
    success: boolean;
    count: number;
    flags: any[];
  }> {
    const url = `${API_BASE_URL}${ADMIN_ENDPOINTS.FLAGS}?resolved=${resolved}`;
    const response = await fetch(url, {
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  // Resolve flag
  async resolveFlag(id: string, action: 'approve' | 'dismiss'): Promise<any> {
    const url = `${API_BASE_URL}${ADMIN_ENDPOINTS.RESOLVE_FLAG(id)}`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: createHeaders(),
      body: JSON.stringify({ action }),
    });
    return handleResponse(response);
  },

  // Get users
  async getUsers(userType: string = 'all', page: number = 1): Promise<{
    success: boolean;
    count: number;
    totalPages: number;
    currentPage: number;
    users: any[];
  }> {
    const url = `${API_BASE_URL}${ADMIN_ENDPOINTS.USERS}?user_type=${userType}&page=${page}`;
    const response = await fetch(url, {
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  // Verify/unverify user
  async verifyUser(id: string, isVerified: boolean): Promise<any> {
    const url = `${API_BASE_URL}${ADMIN_ENDPOINTS.VERIFY_USER(id)}`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: createHeaders(),
      body: JSON.stringify({ is_verified: isVerified }),
    });
    return handleResponse(response);
  },
};
