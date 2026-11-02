const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

// ─────────────────────────────────────────────────────────────
// User & Auth Interfaces
// ─────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  username?: string;
  full_name?: string;
  role: string;
  organization_name?: string;
  avatar_url?: string;
  phone?: string;
  bio?: string;
  country?: string;
  auth_provider: string;
  is_active: boolean;
  is_verified: boolean;
  last_login?: string;
  login_count: number;
  created_at: string;
  updated_at: string;
  roles: string[];
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface PermissionItem {
  id: string;
  code: string;
  name: string;
  description?: string;
  module: string;
  created_at: string;
}

export interface RoleItem {
  id: string;
  code: string;
  name: string;
  description?: string;
  color: string;
  is_system: boolean;
  is_active: boolean;
  permissions: PermissionItem[];
  user_count: number;
  created_at: string;
  updated_at: string;
}

export interface UserStats {
  total_users: number;
  active_users: number;
  inactive_users: number;
  verified_users: number;
  roles_breakdown: Record<string, number>;
  auth_providers: Record<string, number>;
}

// ─────────────────────────────────────────────────────────────
// Verification & Product Interfaces
// ─────────────────────────────────────────────────────────────

export interface VerificationRequest {
  barcode?: string;
  batch_number?: string;
  expiry_date?: string;
  product_name_hint?: string;
  image_base64?: string;
  nutrition_label_base64?: string;
  latitude?: number;
  longitude?: number;
  location_name?: string;
}

export interface EvidenceItem {
  source_name: string;
  source_category: string;
  source_url: string;
  claim_supported: string;
  extracted_passage?: string;
  classification: "SUPPORTING" | "CONTRADICTING" | "INCONCLUSIVE" | "OFFICIAL_ALERT";
  is_verified_fact: boolean;
  retrieval_timestamp: string;
}

export interface RiskSignalItem {
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";
  signal: string;
  description: string;
}

export interface BatchItem {
  id: string;
  batch_number: string;
  manufacturing_date?: string;
  expiry_date?: string;
  quantity?: number;
  is_recalled: boolean;
  recall_notice?: string;
  notes?: string;
}

export interface ProductItem {
  id: string;
  name: string;
  brand: string;
  category: string;
  gtin_barcode: string;
  sku?: string;
  variant?: string;
  flavor?: string;
  net_weight?: string;
  serving_size?: string;
  form?: string;
  description?: string;
  image_url?: string;
  certifications?: string[];
  active_ingredients?: Array<{ name: string; amount: string }>;
  packaging_features?: Record<string, any>;
  authorized_regions?: string;
  is_recalled: boolean;
  recall_reason?: string;
  recall_date?: string;
  recall_source_url?: string;
  batches?: BatchItem[];
}

export interface TrustedSourceItem {
  id: string;
  code: string;
  name: string;
  category: string;
  official_url: string;
  lookup_method: string;
  status: string;
  trust_rationale?: string;
  known_limitations?: string;
  last_checked: string;
  last_synced: string;
}

export interface VerificationResult {
  session_id: string;
  verdict: "VERIFIED" | "SUSPICIOUS" | "NOT_VERIFIED" | "OFFICIAL_WARNING";
  verdict_title: string;
  confidence_score: number;
  explanation: string;
  limitations: string;
  recommendation: string;
  product?: ProductItem;
  batch_matched?: BatchItem;
  evidence_records: EvidenceItem[];
  sources_consulted: Array<{
    source_code: string;
    name: string;
    url: string;
    status: string;
  }>;
  risk_signals: RiskSignalItem[];
  extracted_data: Record<string, any>;
  created_at: string;
}

export interface AnalyticsSummary {
  total_scans: number;
  verified_count: number;
  suspicious_count: number;
  not_verified_count: number;
  warning_count: number;
  total_supplements_cataloged: number;
  total_reports_filed: number;
  active_sources_count: number;
  recent_verdicts: Array<{
    id: string;
    session_id: string;
    barcode?: string;
    product_hint?: string;
    verdict: string;
    confidence_score: number;
    location?: string;
    created_at: string;
  }>;
}

export interface ReportItem {
  id: string;
  verification_id?: string;
  reporter_email?: string;
  reporter_role: string;
  product_name?: string;
  brand?: string;
  barcode?: string;
  batch_number?: string;
  store_location?: string;
  purchase_price?: string;
  description: string;
  evidence_images?: string[];
  status: "PENDING_REVIEW" | "INVESTIGATING" | "CONFIRMED_COUNTERFEIT" | "DISMISSED";
  resolution_notes?: string;
  created_at: string;
}

// ─────────────────────────────────────────────────────────────
// Token / Auth Local Storage Helpers
// ─────────────────────────────────────────────────────────────

const TOKEN_KEY = "verifai_auth_token";
const USER_KEY = "verifai_auth_user";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setStoredUser(user: User): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearStoredAuth(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function getAuthHeaders(explicitToken?: string): HeadersInit {
  const token = explicitToken || getStoredToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

// ─────────────────────────────────────────────────────────────
// Auth API Endpoints
// ─────────────────────────────────────────────────────────────

export async function loginUser(email: string, password: string): Promise<TokenResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Invalid email or password");
  }
  const data: TokenResponse = await res.json();
  setStoredToken(data.access_token);
  setStoredUser(data.user);
  return data;
}

export async function registerUser(payload: {
  email: string;
  username: string;
  password: string;
  full_name?: string;
  role?: string;
  country?: string;
  phone?: string;
  organization_name?: string;
}): Promise<TokenResponse> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to create account");
  }
  const data: TokenResponse = await res.json();
  setStoredToken(data.access_token);
  setStoredUser(data.user);
  return data;
}

export async function googleAuthUser(payload: {
  google_id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  id_token?: string;
}): Promise<TokenResponse> {
  const res = await fetch(`${API_BASE}/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Google authentication failed");
  }
  const data: TokenResponse = await res.json();
  setStoredToken(data.access_token);
  setStoredUser(data.user);
  return data;
}

export async function getCurrentUser(explicitToken?: string): Promise<User> {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: getAuthHeaders(explicitToken),
  });
  if (!res.ok) throw new Error("Failed to fetch user profile");
  const user: User = await res.json();
  setStoredUser(user);
  return user;
}

export async function updateUserProfile(payload: {
  full_name?: string;
  username?: string;
  phone?: string;
  bio?: string;
  country?: string;
  organization_name?: string;
  avatar_url?: string;
}): Promise<User> {
  const res = await fetch(`${API_BASE}/auth/profile`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to update profile");
  }
  const updated: User = await res.json();
  setStoredUser(updated);
  return updated;
}

export async function changePassword(oldPassword: string, newPassword: string): Promise<{ status: string }> {
  const res = await fetch(`${API_BASE}/auth/change-password`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to update password");
  }
  return res.json();
}

// ─────────────────────────────────────────────────────────────
// Admin Users API Endpoints
// ─────────────────────────────────────────────────────────────

export async function getAdminUsers(params?: {
  search?: string;
  role?: string;
  is_active?: boolean;
  page?: number;
  page_size?: number;
}): Promise<User[]> {
  const q = new URLSearchParams();
  if (params?.search) q.append("search", params.search);
  if (params?.role) q.append("role", params.role);
  if (params?.is_active !== undefined) q.append("is_active", params.is_active.toString());
  if (params?.page) q.append("page", params.page.toString());
  if (params?.page_size) q.append("page_size", params.page_size.toString());

  const res = await fetch(`${API_BASE}/admin/users?${q.toString()}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to fetch users");
  }
  return res.json();
}

export async function getAdminUserStats(): Promise<UserStats> {
  const res = await fetch(`${API_BASE}/admin/users/stats`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch user statistics");
  return res.json();
}

export async function createAdminUser(payload: {
  email: string;
  username?: string;
  password: string;
  full_name?: string;
  role: string;
  organization_name?: string;
  phone?: string;
  country?: string;
  is_active?: boolean;
  is_verified?: boolean;
  role_codes?: string[];
}): Promise<User> {
  const res = await fetch(`${API_BASE}/admin/users`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to create user");
  }
  return res.json();
}

export async function updateAdminUser(userId: string, payload: Partial<User> & { role_codes?: string[] }): Promise<User> {
  const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to update user");
  }
  return res.json();
}

export async function deleteAdminUser(userId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to delete user");
  }
}

export async function activateAdminUser(userId: string): Promise<User> {
  const res = await fetch(`${API_BASE}/admin/users/${userId}/activate`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to activate user");
  return res.json();
}

export async function deactivateAdminUser(userId: string): Promise<User> {
  const res = await fetch(`${API_BASE}/admin/users/${userId}/deactivate`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to deactivate user");
  return res.json();
}

export async function resetUserPasswordAdmin(userId: string, newPassword: string): Promise<{ status: string }> {
  const res = await fetch(`${API_BASE}/admin/users/${userId}/reset-password`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ new_password: newPassword }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to reset password");
  }
  return res.json();
}

// ─────────────────────────────────────────────────────────────
// Admin Roles & Permissions API Endpoints
// ─────────────────────────────────────────────────────────────

export async function getAdminRoles(): Promise<RoleItem[]> {
  const res = await fetch(`${API_BASE}/admin/roles`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch roles");
  return res.json();
}

export async function getAdminPermissions(module?: string): Promise<PermissionItem[]> {
  const q = module ? `?module=${encodeURIComponent(module)}` : "";
  const res = await fetch(`${API_BASE}/admin/roles/permissions${q}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch permissions");
  return res.json();
}

export async function createAdminRole(payload: {
  code: string;
  name: string;
  description?: string;
  color?: string;
  permission_ids?: string[];
}): Promise<RoleItem> {
  const res = await fetch(`${API_BASE}/admin/roles`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to create role");
  }
  return res.json();
}

export async function updateAdminRole(roleId: string, payload: {
  name?: string;
  description?: string;
  color?: string;
  is_active?: boolean;
}): Promise<RoleItem> {
  const res = await fetch(`${API_BASE}/admin/roles/${roleId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to update role");
  }
  return res.json();
}

export async function deleteAdminRole(roleId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/admin/roles/${roleId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to delete role");
  }
}

export async function assignPermissionsToRole(roleId: string, permissionIds: string[]): Promise<RoleItem> {
  const res = await fetch(`${API_BASE}/admin/roles/${roleId}/permissions`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ permission_ids: permissionIds }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to update permissions");
  }
  return res.json();
}

// ─────────────────────────────────────────────────────────────
// Verification, Catalog, Reports & Analytics API
// ─────────────────────────────────────────────────────────────

export async function verifyProduct(data: VerificationRequest): Promise<VerificationResult> {
  const res = await fetch(`${API_BASE}/verify/scan`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Verification failed");
  }
  return res.json();
}

export async function getScanHistory(verdict?: string, limit = 20) {
  const params = new URLSearchParams();
  if (verdict) params.append("verdict", verdict);
  params.append("limit", limit.toString());

  const res = await fetch(`${API_BASE}/verify/history?${params.toString()}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch scan history");
  return res.json();
}

export async function getProducts(search?: string, category?: string, is_recalled?: boolean): Promise<ProductItem[]> {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (category) params.append("category", category);
  if (is_recalled !== undefined) params.append("is_recalled", is_recalled.toString());

  const res = await fetch(`${API_BASE}/products?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

export async function getTrustedSources(): Promise<TrustedSourceItem[]> {
  const res = await fetch(`${API_BASE}/sources`);
  if (!res.ok) throw new Error("Failed to fetch trusted sources");
  return res.json();
}

export async function createProduct(data: Partial<ProductItem>): Promise<ProductItem> {
  const res = await fetch(`${API_BASE}/products`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to create product");
  }
  return res.json();
}

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const res = await fetch(`${API_BASE}/analytics/summary`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch analytics");
  return res.json();
}

export async function getReports(status?: string): Promise<ReportItem[]> {
  const params = new URLSearchParams();
  if (status) params.append("status", status);

  const res = await fetch(`${API_BASE}/reports?${params.toString()}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch reports");
  return res.json();
}

export async function submitReport(data: {
  product_name?: string;
  brand?: string;
  barcode?: string;
  batch_number?: string;
  store_location?: string;
  purchase_price?: string;
  description: string;
  reporter_email?: string;
  verification_id?: string;
}): Promise<ReportItem> {
  const res = await fetch(`${API_BASE}/reports`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to submit fraud report");
  return res.json();
}

export async function updateReportStatus(reportId: string, status: string, notes?: string) {
  const params = new URLSearchParams({ status });
  if (notes) params.append("resolution_notes", notes);

  const res = await fetch(`${API_BASE}/reports/${reportId}/status?${params.toString()}`, {
    method: "PUT",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to update report status");
  return res.json();
}

export async function seedDemoDatabase() {
  const res = await fetch(`${API_BASE}/seed`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to seed database");
  return res.json();
}
