import axios from 'axios';

// Smart Base URL resolver: seamlessly handles local dev, tunnels, and production
function getApiBaseUrl() {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5000/api';
    }
    if (hostname.includes('loca.lt')) {
      return 'https://fine-ghosts-write.loca.lt/api';
    }
  }
  return process.env.NEXT_PUBLIC_API_URL || 'https://api.hemasagar.ai/api';
}

const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
    'Bypass-Tunnel-Reminder': 'true'
  },
  timeout: 30000,
});

// Dynamically ensure request uses the appropriate host
api.interceptors.request.use(
  (config) => {
    config.baseURL = getApiBaseUrl();
    config.headers['Bypass-Tunnel-Reminder'] = 'true';
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('sagaragent_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept responses to handle auth expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
        localStorage.removeItem('sagaragent_token');
        localStorage.removeItem('sagaragent_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
