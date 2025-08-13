export const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:5000' 
  : 'https://ahp-forpaper.onrender.com';

export const API_ENDPOINTS = {
  AUTH: '/api/auth',
  PROJECTS: '/api/projects',
  CRITERIA: '/api/criteria',
  ALTERNATIVES: '/api/alternatives',
  COMPARISONS: '/api/comparisons',
  USERS: '/api/users',
  HEALTH: '/api/health'
} as const;