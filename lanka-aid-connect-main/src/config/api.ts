// Backend API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const API_ENDPOINTS = {
  // Need Posts
  POSTS: '/posts',
  POST_BY_ID: (id: string) => `/posts/${id}`,
  POSTS_STATS: '/posts/stats',
  MY_POSTS: '/posts/my-posts',

  // Donations
  DONATE: (id: string) => `/posts/${id}/donate`,
  POST_DONATIONS: (id: string) => `/posts/${id}/donations`,
  USER_DONATIONS: '/posts/user/donations',

  // Emergency Centers
  CENTERS: '/centers',
  CENTER_BY_ID: (id: string) => `/centers/${id}`,

  // Authentication
  AUTH_GOOGLE: '/auth/google',
  AUTH_ME: '/auth/me',
  AUTH_LOGOUT: '/auth/logout',
  AUTH_UPDATE_PROFILE: '/auth/profile',

  // Profiles
  PROFILES_LEADERBOARD: '/profiles/leaderboard',
  PROFILE_ME: '/profiles/me',
  PROFILE_BY_ID: (id: string) => `/profiles/${id}`,

  // Flags
  FLAG_POST: (id: string) => `/posts/${id}/flag`,
  FLAGGED_POSTS: '/posts/flagged',
  RESOLVE_FLAG: (id: string) => `/posts/${id}/resolve`,

  // Saved Posts
  SAVED_POSTS: '/posts/saved',
  SAVE_POST: (id: string) => `/posts/${id}/save`,
  UNSAVE_POST: (id: string) => `/posts/${id}/unsave`,

  // Notifications
  NOTIFICATIONS: '/notifications',
  NOTIFICATIONS_UNREAD_COUNT: '/notifications/unread-count',
  NOTIFICATION_MARK_READ: (id: string) => `/notifications/${id}/read`,
  NOTIFICATIONS_MARK_ALL_READ: '/notifications/read-all',
  NOTIFICATION_DELETE: (id: string) => `/notifications/${id}`,

  // Health
  HEALTH: '/health'
};
