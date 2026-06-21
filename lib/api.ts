// Client-side API helpers for Nexora AI

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'USER' | 'ADMIN' | 'AGENT';
  city?: string;
  budget?: string;
}

export interface ApiProperty {
  id: string;
  name: string;
  price: number;
  brand: string;
  description: string;
  category: string;
  rating: number;
  reviewsCount: number;
  carpetArea?: string;
  carpetAreaSqFt?: number;
  facing?: string;
  completionStatus?: string;
  reraId?: string;
  purpose: 'BUY' | 'RENT' | 'SELL';
  bhk?: number;
  locality?: string;
  city?: string;
  furnishing?: 'FURNISHED' | 'SEMI_FURNISHED' | 'UNFURNISHED';
  floor?: number;
  totalFloors?: number;
  parking?: number;
  amenities: string[];
  pricePerSqFt?: number;
  possessionDate?: string;
  constructionAge?: string;
  images: string[];
  isApproved: boolean;
  isFeatured: boolean;
  createdAt: string;
}

// Helper to get token from localStorage/cookies
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('nexora_token');
}

// Set auth token
export function setAuthToken(token: string | null) {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem('nexora_token', token);
    // Also set a cookie so Server Components/API routes can read it
    document.cookie = `nexora_token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
  } else {
    localStorage.removeItem('nexora_token');
    document.cookie = 'nexora_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }
}

// Standard fetch wrapper
async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const res = await fetch(endpoint, {
    ...options,
    headers
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Request failed with status ${res.status}`);
  }

  return res.json();
}

// ── Auth APIs ───────────────────────────────────────────────────────────────
export async function loginUser(email: string, password: string) {
  const data = await apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  setAuthToken(data.token);
  return data;
}

export async function registerUser(payload: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  city?: string;
}) {
  const data = await apiFetch('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  setAuthToken(data.token);
  return data;
}

export async function getMe() {
  return await apiFetch('/api/auth/me');
}

// ── Property APIs ────────────────────────────────────────────────────────────
export async function getProperties(params?: Record<string, string>) {
  const query = params ? '?' + new URLSearchParams(params).toString() : '';
  return await apiFetch(`/api/properties${query}`);
}

export async function getPropertyDetail(id: string) {
  return await apiFetch(`/api/properties/${id}`);
}

export async function postProperty(payload: Partial<ApiProperty>) {
  return await apiFetch('/api/properties', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

// ── Shortlist APIs ───────────────────────────────────────────────────────────
export async function getShortlist() {
  return await apiFetch('/api/shortlist');
}

export async function addToShortlist(propertyId: string) {
  return await apiFetch('/api/shortlist', {
    method: 'POST',
    body: JSON.stringify({ propertyId })
  });
}

export async function removeFromShortlist(id: string) {
  return await apiFetch(`/api/shortlist/${id}`, {
    method: 'DELETE'
  });
}

// ── Inquiry APIs ─────────────────────────────────────────────────────────────
export async function submitInquiry(payload: {
  name: string;
  phone: string;
  email?: string;
  message?: string;
  type?: 'SITE_VISIT' | 'CALL_BACK' | 'GENERAL';
  propertyId: string;
}) {
  return await apiFetch('/api/inquiries', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

// ── Localities API ───────────────────────────────────────────────────────────
export async function getLocalities(city?: string) {
  const query = city ? `?city=${encodeURIComponent(city)}` : '';
  return await apiFetch(`/api/localities${query}`);
}

// ── Newsletter API ───────────────────────────────────────────────────────────
export async function subscribeNewsletter(email: string) {
  return await apiFetch('/api/newsletter', {
    method: 'POST',
    body: JSON.stringify({ email })
  });
}

export async function deleteProperty(id: string) {
  return await apiFetch(`/api/properties/${id}`, {
    method: 'DELETE'
  });
}

// ── Admin APIs ──────────────────────────────────────────────────────────────
export async function getAdminStats() {
  return await apiFetch('/api/admin/stats');
}

export async function getAdminProperties(params?: Record<string, string>) {
  const query = params ? '?' + new URLSearchParams(params).toString() : '';
  return await apiFetch(`/api/admin/properties${query}`);
}

export async function approveProperty(id: string, approve: boolean) {
  return await apiFetch(`/api/admin/properties/${id}/approve`, {
    method: 'PATCH',
    body: JSON.stringify({ approve })
  });
}

// ── OTP APIs ────────────────────────────────────────────────────────────────
export async function sendOtp(phone: string) {
  return await apiFetch('/api/auth/otp/send', {
    method: 'POST',
    body: JSON.stringify({ phone })
  });
}

export async function verifyOtp(phone: string, code: string) {
  return await apiFetch('/api/auth/otp/verify', {
    method: 'POST',
    body: JSON.stringify({ phone, code })
  });
}
