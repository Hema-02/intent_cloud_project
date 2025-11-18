import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  // Add retry logic for network errors
  validateStatus: function (status) {
    return status < 500; // Resolve only if the status code is less than 500
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (email: string, password: string, name: string) => {
    const response = await api.post('/auth/register', { email, password, name });
    return response.data;
  },

  demoLogin: async (role: string = 'user') => {
    const response = await api.post('/auth/demo-login', { role });
    return response.data;
  },

  verifyToken: async () => {
    const response = await api.get('/auth/verify');
    return response.data;
  },
};

// Resources API
export const resourcesAPI = {
  getAll: async (provider: string, type?: string) => {
    const params = type ? { type } : {};
    const response = await api.get(`/resources/${provider}`, { params });
    return response.data;
  },

  getById: async (provider: string, type: string, id: string) => {
    const response = await api.get(`/resources/${provider}/${type}/${id}`);
    return response.data;
  },

  create: async (provider: string, type: string, data: any) => {
    const response = await api.post(`/resources/${provider}/${type}`, data);
    return response.data;
  },

  update: async (provider: string, type: string, id: string, data: any) => {
    const response = await api.put(`/resources/${provider}/${type}/${id}`, data);
    return response.data;
  },
export const healthAPI = {
  check: async () => {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (!response.ok) {
      throw new Error('Backend server not available');
    }
    
    return response.json();
  },
};

  delete: async (provider: string, type: string, id: string) => {
    const response = await api.delete(`/resources/${provider}/${type}/${id}`);
    return response.data;
  },
};

// Monitoring API
export const monitoringAPI = {
  getOverview: async (provider: string, timeRange?: string) => {
    const params = timeRange ? { timeRange } : {};
    const response = await api.get(`/monitoring/${provider}`, { params });
    return response.data;
  },

  getMetric: async (provider: string, metric: string, timeRange?: string, interval?: string) => {
    const params = { timeRange, interval };
    const response = await api.get(`/monitoring/${provider}/metrics/${metric}`, { params });
    return response.data;
  },

  getAlerts: async (provider: string, severity?: string, status?: string) => {
    const params = { severity, status };
    const response = await api.get(`/monitoring/${provider}/alerts`, { params });
    return response.data;
  },
};

// Billing API
export const billingAPI = {
  getOverview: async (provider: string, period?: string) => {
    const params = period ? { period } : {};
    const response = await api.get(`/billing/${provider}`, { params });
    return response.data;
  },

  getBreakdown: async (provider: string, groupBy?: string, period?: string) => {
    const params = { groupBy, period };
    const response = await api.get(`/billing/${provider}/breakdown`, { params });
    return response.data;
  },

  getAlerts: async (provider: string) => {
    const response = await api.get(`/billing/${provider}/alerts`);
    return response.data;
  },
};

// Security API
export const securityAPI = {
  getOverview: async (provider: string) => {
    const response = await api.get(`/security/${provider}`);
    return response.data;
  },

  getVulnerabilities: async (provider: string, severity?: string, status?: string) => {
    const params = { severity, status };
    const response = await api.get(`/security/${provider}/vulnerabilities`, { params });
    return response.data;
  },

  runScan: async (provider: string, scanType?: string) => {
    const response = await api.post(`/security/${provider}/scan`, { scanType });
    return response.data;
  },

  getCompliance: async (provider: string) => {
    const response = await api.get(`/security/${provider}/compliance`);
    return response.data;
  },
};

// Natural Language Processing API
export const nlpAPI = {
  process: async (input: string, provider: string) => {
    const response = await api.post('/nlp/process', { input, provider });
    return response.data;
  },

  getSuggestions: async (provider?: string, category?: string) => {
    const params = { provider, category };
    const response = await api.get('/nlp/suggestions', { params });
    return response.data;
  },

  getHistory: async (limit?: number) => {
    const params = limit ? { limit } : {};
    const response = await api.get('/nlp/history', { params });
    return response.data;
  },
};

// Health check
export const healthAPI = {
  check: async () => {
    const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'}/health`);
    return response.data;
  },
};

export default api;