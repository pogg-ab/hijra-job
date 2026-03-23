export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:8000'

export const ADMIN_AUTH_STORAGE_KEY = 'hijra_admin_auth'

export type AuthPayload = {
  access_token: string
  token_type?: string
  expires_in?: number
}

export function saveAdminAuth(auth: AuthPayload) {
  if (typeof window === 'undefined') return
  localStorage.setItem(ADMIN_AUTH_STORAGE_KEY, JSON.stringify(auth))
}

export function clearAdminAuth() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(ADMIN_AUTH_STORAGE_KEY)
}

export function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(ADMIN_AUTH_STORAGE_KEY)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as AuthPayload
    return parsed.access_token ?? null
  } catch {
    return null
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  useAuth = true
): Promise<T> {
  const headers = new Headers(options.headers)

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  if (useAuth) {
    const token = getAdminToken()
    if (token) headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const message = (data as { message?: string }).message ?? 'Request failed'
    throw new Error(message)
  }

  return data as T
}

// Admin high-level wrappers
export const Auth = {
  login: (payload: any) => apiRequest('/api/login', { method: 'POST', body: JSON.stringify(payload) }, false),
  logout: () => apiRequest('/api/logout', { method: 'POST' }, true),
  me: () => apiRequest('/api/me', {}, true),
}

export const AdminApi: any = {
  stats: () => apiRequest('/api/admin/stats', {}, true),
  roles: () => apiRequest('/api/admin/roles', {}, true),
  users: () => apiRequest('/api/admin/users', {}, true),
  adminJobs: () => apiRequest('/api/admin/jobs', {}, true),
  createJob: (form: any) => apiRequest('/api/admin/jobs', { method: 'POST', body: JSON.stringify(form) }, true),
  updateJob: (id: string | number, form: any) => apiRequest(`/api/admin/jobs/${id}`, { method: 'PATCH', body: JSON.stringify(form) }, true),
  publishJob: (id: string | number) => apiRequest(`/api/admin/jobs/${id}/publish`, { method: 'PATCH' }, true),
  closeJob: (id: string | number) => apiRequest(`/api/admin/jobs/${id}/close`, { method: 'PATCH' }, true),

  applications: () => apiRequest('/api/admin/applications', {}, true),
  updateApplicationStatus: (id: string | number, payload: any) => apiRequest(`/api/admin/applications/${id}/status`, { method: 'PATCH', body: JSON.stringify(payload) }, true),

  documents: () => apiRequest('/api/admin/documents', {}, true),
  updateDocumentStatus: (id: string | number, payload: any) => apiRequest(`/api/admin/documents/${id}/status`, { method: 'PATCH', body: JSON.stringify(payload) }, true),
  downloadDocument: async (id: string | number) => {
    const token = getAdminToken()
    const headers = new Headers()
    if (token) headers.set('Authorization', `Bearer ${token}`)
    const res = await fetch(`${API_BASE_URL}/api/admin/documents/${id}/download`, { headers })
    if (!res.ok) throw new Error('Failed to download document')
    const blob = await res.blob()
    return { blob, disposition: res.headers.get('Content-Disposition') || '' }
  },
}

// Services management for admin panel
AdminApi.services = () => apiRequest('/api/admin/services', {}, true)
AdminApi.createService = (payload: any) => apiRequest('/api/admin/services', { method: 'POST', body: JSON.stringify(payload) }, true)
AdminApi.updateService = (id: string | number, payload: any) => apiRequest(`/api/admin/services/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }, true)
AdminApi.deleteService = (id: string | number) => apiRequest(`/api/admin/services/${id}`, { method: 'DELETE' }, true)
// Policies management for admin panel
AdminApi.policies = () => apiRequest('/api/admin/policies', {}, true)
AdminApi.createPolicy = (payload: any) => apiRequest('/api/admin/policies', { method: 'POST', body: JSON.stringify(payload) }, true)
// Accept FormData for file uploads
AdminApi.createPolicyForm = (form: FormData) => apiRequest('/api/admin/policies', { method: 'POST', body: form }, true)
AdminApi.updatePolicy = (id: string | number, payload: any) => apiRequest(`/api/admin/policies/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }, true)
AdminApi.deletePolicy = (id: string | number) => apiRequest(`/api/admin/policies/${id}`, { method: 'DELETE' }, true)
// Accept FormData for policy update with file
AdminApi.updatePolicyForm = (id: string | number, form: FormData) => apiRequest(`/api/admin/policies/${id}`, { method: 'PATCH', body: form }, true)

// Contacts / Messages
AdminApi.contacts = () => apiRequest('/api/admin/contacts', {}, true)
AdminApi.getContact = (id: string | number) => apiRequest(`/api/admin/contacts/${id}`, {}, true)
AdminApi.markContactRead = (id: string | number) => apiRequest(`/api/admin/contacts/${id}/read`, { method: 'PATCH' }, true)
AdminApi.replyContact = (id: string | number, payload: any) => apiRequest(`/api/admin/contacts/${id}/reply`, { method: 'POST', body: JSON.stringify(payload) }, true)

// FAQs (admin)
AdminApi.faqs = () => apiRequest('/api/admin/faqs', {}, true)
AdminApi.createFaq = (payload: any) => apiRequest('/api/admin/faqs', { method: 'POST', body: JSON.stringify(payload) }, true)
AdminApi.updateFaq = (id: string | number, payload: any) => apiRequest(`/api/admin/faqs/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }, true)
AdminApi.deleteFaq = (id: string | number) => apiRequest(`/api/admin/faqs/${id}`, { method: 'DELETE' }, true)

// Homepage content management (admin)
AdminApi.homepageSections = () => apiRequest('/api/admin/homepage/sections', {}, true)
AdminApi.updateHomepageSection = (key: string, payload: any) =>
  apiRequest(`/api/admin/homepage/sections/${key}`, { method: 'PUT', body: JSON.stringify(payload) }, true)

AdminApi.homepageCountries = () => apiRequest('/api/admin/homepage/countries', {}, true)
AdminApi.createHomepageCountry = (payload: any) =>
  apiRequest('/api/admin/homepage/countries', { method: 'POST', body: JSON.stringify(payload) }, true)
AdminApi.updateHomepageCountry = (id: string | number, payload: any) =>
  apiRequest(`/api/admin/homepage/countries/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }, true)
AdminApi.deleteHomepageCountry = (id: string | number) =>
  apiRequest(`/api/admin/homepage/countries/${id}`, { method: 'DELETE' }, true)

AdminApi.homepageTestimonials = () => apiRequest('/api/admin/homepage/testimonials', {}, true)
AdminApi.createHomepageTestimonial = (payload: any) =>
  apiRequest('/api/admin/homepage/testimonials', { method: 'POST', body: JSON.stringify(payload) }, true)
AdminApi.updateHomepageTestimonial = (id: string | number, payload: any) =>
  apiRequest(`/api/admin/homepage/testimonials/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }, true)
AdminApi.deleteHomepageTestimonial = (id: string | number) =>
  apiRequest(`/api/admin/homepage/testimonials/${id}`, { method: 'DELETE' }, true)

// About page content management (admin)
AdminApi.aboutPageSections = () => apiRequest('/api/admin/about-page/sections', {}, true)
AdminApi.updateAboutPageSection = (key: string, payload: any) =>
  apiRequest(`/api/admin/about-page/sections/${key}`, { method: 'PUT', body: JSON.stringify(payload) }, true)

export const SuperAdmin = {
  createStaff: (payload: any) => apiRequest('/api/super-admin/staff', { method: 'POST', body: JSON.stringify(payload) }, true),
  pendingAgencies: () => apiRequest('/api/super-admin/foreign-agencies/pending', {}, true),
  reviewAgency: (id: string | number, payload: any) => apiRequest(`/api/super-admin/foreign-agencies/${id}/review`, { method: 'PATCH', body: JSON.stringify(payload) }, true),
  downloadAgencyLicense: async (id: string | number) => {
    const token = getAdminToken()
    const headers = new Headers()
    if (token) headers.set('Authorization', `Bearer ${token}`)
    const res = await fetch(`${API_BASE_URL}/api/super-admin/foreign-agencies/${id}/license`, { headers })
    if (!res.ok) throw new Error('Failed to download license')
    const blob = await res.blob()
    return { blob, disposition: res.headers.get('Content-Disposition') || '' }
  },
}
