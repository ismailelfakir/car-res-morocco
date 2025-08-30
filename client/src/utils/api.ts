// API Configuration and utility functions
const API_BASE_URL =
  (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:4000/api'

// Helper to safely join base + endpoint
const join = (base: string, endpoint: string) =>
  `${base.replace(/\/+$/, '')}/${endpoint.replace(/^\/+/, '')}`

type Json = Record<string, unknown> | unknown[] | null

// Core fetch wrapper with JSON parsing + credentials
async function fetchJson<T = Json>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = join(API_BASE_URL, endpoint)

  const resp = await fetch(url, {
    ...options,
    credentials: 'include', // ✅ always send cookies (for Railway ↔ Vercel auth)
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  })

  const isJson =
    resp.headers.get('content-type')?.includes('application/json') ?? false
  const payload = isJson ? await resp.json().catch(() => undefined) : undefined

  if (!resp.ok) {
    const msg =
      (payload as any)?.message ||
      `HTTP ${resp.status} ${resp.statusText} at ${endpoint}`
    const error = new Error(msg) as Error & { status?: number; data?: unknown }
    error.status = resp.status
    error.data = payload
    throw error
  }

  return (payload as T) ?? ({} as T)
}

export const api = {
  // Base URL getter
  getBaseUrl: () => API_BASE_URL,

  // Full URL builder
  url: (endpoint: string) => join(API_BASE_URL, endpoint),

  // Low-level fetch
  fetch: fetchJson,

  // Shorthands
  get: <T = Json>(endpoint: string, options: RequestInit = {}) =>
    fetchJson<T>(endpoint, { ...options, method: 'GET' }),

  post: <T = Json>(
    endpoint: string,
    data?: unknown,
    options: RequestInit = {}
  ) =>
    fetchJson<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data != null ? JSON.stringify(data) : undefined
    }),

  put: <T = Json>(
    endpoint: string,
    data?: unknown,
    options: RequestInit = {}
  ) =>
    fetchJson<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data != null ? JSON.stringify(data) : undefined
    }),

  delete: <T = Json>(endpoint: string, options: RequestInit = {}) =>
    fetchJson<T>(endpoint, { ...options, method: 'DELETE' })
}

// Specific API endpoints
export const endpoints = {
  // Auth
  auth: {
    login: '/auth/login',
    logout: '/auth/logout'
  },

  // Appointments
  appointments: {
    create: '/appointments',
    getByReference: (reference: string) => `/appointments/${reference}`,
    admin: '/appointments/admin',
    confirm: (id: string) => `/appointments/${id}/confirm`,
    reject: (id: string) => `/appointments/${id}/reject`,
    cancel: (id: string) => `/appointments/${id}/cancel`
  },

  // Services
  services: {
    list: '/services',
    get: (id: string) => `/services/${id}`,
    create: '/services',
    update: (id: string) => `/services/${id}`,
    delete: (id: string) => `/services/${id}`
  },

  // Magazins (Technical Centers)
  magazins: {
    list: '/magazins',
    get: (id: string) => `/magazins/${id}`,
    admin: '/magazins/admin',
    create: '/magazins',
    update: (id: string) => `/magazins/${id}`,
    delete: (id: string) => `/magazins/${id}`,
    availability: (id: string) => `/magazins/${id}/availability`
  },

  // Reports
  reports: {
    daily: (date: string) => `/reports/daily?date=${date}`,
    dailyByMagazin: (magazinId: string, date: string) =>
      `/reports/daily/${magazinId}.pdf?date=${date}`,
    dailyAll: (date: string) => `/reports/daily/all.pdf?date=${date}`
  }
}

export default api