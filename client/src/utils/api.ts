// API Configuration and utility functions
const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:4000/api'

export const api = {
  // Base URL getter
  getBaseUrl: () => API_BASE_URL,
  
  // Full URL builder
  url: (endpoint: string) => `${API_BASE_URL}${endpoint}`,
  
  // Common fetch wrapper with error handling
  fetch: async (endpoint: string, options: RequestInit = {}) => {
    const url = api.url(endpoint)
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return response
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error)
      throw error
    }
  },
  
  // GET request
  get: (endpoint: string, options: RequestInit = {}) => 
    api.fetch(endpoint, { ...options, method: 'GET' }),
  
  // POST request
  post: (endpoint: string, data?: any, options: RequestInit = {}) => 
    api.fetch(endpoint, { 
      ...options, 
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),
  
  // PUT request
  put: (endpoint: string, data?: any, options: RequestInit = {}) => 
    api.fetch(endpoint, { 
      ...options, 
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),
  
  // DELETE request
  delete: (endpoint: string, options: RequestInit = {}) => 
    api.fetch(endpoint, { ...options, method: 'DELETE' }),
  
  // With credentials (for admin routes)
  withCredentials: (options: RequestInit = {}) => ({
    ...options,
    credentials: 'include' as const,
  }),
}

// Specific API endpoints
export const endpoints = {
  // Auth
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
  },
  
  // Appointments
  appointments: {
    create: '/appointments',
    getByReference: (reference: string) => `/appointments/${reference}`,
    admin: '/appointments/admin',
    confirm: (id: string) => `/appointments/${id}/confirm`,
    reject: (id: string) => `/appointments/${id}/reject`,
    cancel: (id: string) => `/appointments/${id}/cancel`,
  },
  
  // Services
  services: {
    list: '/services',
    get: (id: string) => `/services/${id}`,
    create: '/services',
    update: (id: string) => `/services/${id}`,
    delete: (id: string) => `/services/${id}`,
  },
  
  // Magazins (Technical Centers)
  magazins: {
    list: '/magazins',
    get: (id: string) => `/magazins/${id}`,
    admin: '/magazins/admin',
    create: '/magazins',
    update: (id: string) => `/magazins/${id}`,
    delete: (id: string) => `/magazins/${id}`,
    availability: (id: string) => `/magazins/${id}/availability`,
  },
  
  // Reports
  reports: {
    daily: (date: string) => `/reports/daily?date=${date}`,
    dailyByMagazin: (magazinId: string, date: string) => `/reports/daily/${magazinId}.pdf?date=${date}`,
    dailyAll: (date: string) => `/reports/daily/all.pdf?date=${date}`,
  },
}

export default api
