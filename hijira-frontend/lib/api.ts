export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:8000'

export const AUTH_STORAGE_KEY = 'hijra_auth'

export type AuthPayload = {
  access_token: string
  token_type?: string
  expires_in?: number
}

export function saveAuth(auth: AuthPayload) {
  if (typeof window === 'undefined') return
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth))
}

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(AUTH_STORAGE_KEY)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as AuthPayload
    return parsed.access_token ?? null
  } catch {
    return null
  }
}

export function clearAuth() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(AUTH_STORAGE_KEY)
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  useAuth = false
): Promise<T> {
  const headers = new Headers(options.headers)
  // Ensure the server returns JSON error responses for API requests
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json')
  }

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  if (useAuth) {
    const token = getAccessToken()
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
  }

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    })
  } catch (fetchErr: any) {
    throw new Error(fetchErr?.message ?? 'Network request failed')
  }

  let data: any = {}
  try {
    data = await response.json()
  } catch {
    data = {}
  }

  if (!response.ok) {
    const message = (data as { message?: string }).message ?? 'Request failed'
    throw new Error(message)
  }

  return data as T
}

// High-level API wrappers
export const Auth = {
  login: (payload: any) => apiRequest('/api/login', { method: 'POST', body: JSON.stringify(payload) }),
  register: (payload: any) => apiRequest('/api/register', { method: 'POST', body: JSON.stringify(payload) }),
  registerPartner: (formData: FormData) => apiRequest('/api/partner/register', { method: 'POST', body: formData }),
  refresh: () => apiRequest('/api/refresh', { method: 'POST' }),
  logout: () => apiRequest('/api/logout', { method: 'POST' }, true),
  me: () => apiRequest('/api/me', {}, true),
}

export const Jobs = {
  list: async () => {
    const res = await apiRequest<any>('/api/jobs')
    return (res && (res.data ?? res)) as any[]
  },
  show: (id: string | number) => apiRequest(`/api/jobs/${id}`),
  apply: (jobId: string | number, payload: any) => apiRequest(`/api/jobs/${jobId}/apply`, { method: 'POST', body: JSON.stringify(payload) }, true),
  partnerCreate: (form: any) => apiRequest('/api/partner/jobs', { method: 'POST', body: JSON.stringify(form) }, true),
  adminCreate: (form: any) => apiRequest('/api/admin/jobs', { method: 'POST', body: JSON.stringify(form) }, true),
  adminUpdate: (id: string | number, form: any) => apiRequest(`/api/admin/jobs/${id}`, { method: 'PATCH', body: JSON.stringify(form) }, true),
  adminPublish: (id: string | number) => apiRequest(`/api/admin/jobs/${id}/publish`, { method: 'PATCH' }, true),
  adminClose: (id: string | number) => apiRequest(`/api/admin/jobs/${id}/close`, { method: 'PATCH' }, true),
}

export const Profile = {
  get: () => apiRequest('/api/profile', {}, true),
  update: (payload: any) => apiRequest('/api/profile', { method: 'PUT', body: JSON.stringify(payload) }, true),
}

export const Documents = {
  upload: (formData: FormData) => apiRequest('/api/documents/upload', { method: 'POST', body: formData }, true),
  update: (id: number | string, payload: any) => apiRequest(`/api/documents/${id}`, { method: 'PUT', body: JSON.stringify(payload) }, true),
  destroy: (id: number | string) => apiRequest(`/api/documents/${id}`, { method: 'DELETE' }, true),
}

export const Applications = {
  myApplications: () => apiRequest('/api/my-applications', {}, true),
  respond: (id: string | number, payload: any) => apiRequest(`/api/applications/${id}/respond`, { method: 'POST', body: JSON.stringify(payload) }, true),
}

export const Admin = {
  stats: () => apiRequest('/api/admin/stats', {}, true),
  roles: () => apiRequest('/api/admin/roles', {}, true),
  users: () => apiRequest('/api/admin/users', {}, true),
  adminApplications: () => apiRequest('/api/admin/applications', {}, true),
  updateApplicationStatus: (id: string | number, payload: any) => apiRequest(`/api/admin/applications/${id}/status`, { method: 'PATCH', body: JSON.stringify(payload) }, true),
  documents: () => apiRequest('/api/admin/documents', {}, true),
  updateDocumentStatus: (id: string | number, payload: any) => apiRequest(`/api/admin/documents/${id}/status`, { method: 'PATCH', body: JSON.stringify(payload) }, true),
  services: () => apiRequest('/api/admin/services', {}, true),
  createService: (payload: any) => apiRequest('/api/admin/services', { method: 'POST', body: JSON.stringify(payload) }, true),
  updateService: (id: string | number, payload: any) => apiRequest(`/api/admin/services/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }, true),
  deleteService: (id: string | number) => apiRequest(`/api/admin/services/${id}`, { method: 'DELETE' }, true),
  policies: () => apiRequest('/api/admin/policies', {}, true),
  createPolicy: (payload: any) => apiRequest('/api/admin/policies', { method: 'POST', body: JSON.stringify(payload) }, true),
  updatePolicy: (id: string | number, payload: any) => apiRequest(`/api/admin/policies/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }, true),
  deletePolicy: (id: string | number) => apiRequest(`/api/admin/policies/${id}`, { method: 'DELETE' }, true),
}

export const Partner = {
  shortlisted: () => apiRequest('/api/partner/applications/shortlisted', {}, true),
  action: (id: string | number, payload: any) => apiRequest(`/api/partner/applications/${id}/action`, { method: 'PATCH', body: JSON.stringify(payload) }, true),
}

export const Services = {
  list: () => apiRequest('/api/services'),
}

export const Policies = {
  list: () => apiRequest('/api/policies'),
  getByType: (type: string) => apiRequest(`/api/policies/${type}`),
}

export const Faqs = {
  list: () => apiRequest('/api/faqs'),
  ask: (payload: any) => apiRequest('/api/faqs', { method: 'POST', body: JSON.stringify(payload) }),
}

export const Messages = {
  my: () => apiRequest('/api/my-contacts', {}, true),
}

// Download helper for binary endpoints (document download, agency license)
export async function downloadFile(path: string, useAuth = true) {
  const headers = new Headers()
  if (useAuth) {
    const token = getAccessToken()
    if (token) headers.set('Authorization', `Bearer ${token}`)
  }

  const res = await fetch(`${API_BASE_URL}${path}`, { headers })
  if (!res.ok) throw new Error('Failed to download file')
  const blob = await res.blob()
  const disposition = res.headers.get('Content-Disposition') || ''
  return { blob, disposition }
}
