// API Configuration and utility functions
// Build a resilient base URL that won't throw in production if the env var is mis-set
const rawBase: string | undefined = (import.meta as any).env?.VITE_API_BASE_URL

function sanitizeBaseUrl(value: string | undefined): string {
  const trimmed = (value || '').trim()
  // If empty or missing protocol, fallback to current origin when available
  const hasProtocol = /^(https?:)\/\//i.test(trimmed)
  let candidate = trimmed
  if (!candidate || !hasProtocol) {
    // Prefer localhost API during development for Vite dev server
    const isDev = Boolean((import.meta as any).env?.DEV)
    if (isDev) {
      candidate = 'http://localhost:4000/api'
    } else if (typeof window !== 'undefined' && window.location?.origin) {
      candidate = `${window.location.origin}/api`
    } else {
      candidate = 'http://localhost:4000/api'
    }
  }
  // Normalize double slashes when concatenating later
  candidate = candidate.replace(/\/$/, '')
  try {
    // Validate with URL constructor; will throw for invalid strings
    // eslint-disable-next-line no-new
    new URL(candidate)
    return candidate
  } catch {
    // Last-resort fallback
    return 'http://localhost:4000/api'
  }
}

const API_BASE_URL = sanitizeBaseUrl(rawBase)

export const api = {
  // Base URL getter
  getBaseUrl: () => API_BASE_URL,
  
  // Full URL builder
  url: (endpoint: string) => `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`,
  
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
