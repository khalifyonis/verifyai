from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, Field, ConfigDict

# ─────────────────────────────────────────────────────────────
# User Schemas
# ─────────────────────────────────────────────────────────────

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    role: str = "consumer"
    organization_name: Optional[str] = None

class UserCreate(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6)
    full_name: Optional[str] = None
    role: str = "consumer"
    organization_name: Optional[str] = None
    phone: Optional[str] = None
    country: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class GoogleAuthRequest(BaseModel):
    """Request payload when a user signs in with Google on the frontend."""
    google_id: str
    email: EmailStr
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None

class UserOut(BaseModel):
    id: str
    email: str
    username: Optional[str] = None
    full_name: Optional[str] = None
    role: str
    organization_name: Optional[str] = None
    avatar_url: Optional[str] = None
    phone: Optional[str] = None
    bio: Optional[str] = None
    country: Optional[str] = None
    auth_provider: str = "local"
    is_active: bool
    is_verified: bool = False
    last_login: Optional[datetime] = None
    login_count: int = 0
    created_at: datetime
    updated_at: Optional[datetime] = None
    roles: List[str] = []  # List of role codes assigned via RBAC
    model_config = ConfigDict(from_attributes=True)

class UserUpdateProfile(BaseModel):
    full_name: Optional[str] = None
    username: Optional[str] = None
    phone: Optional[str] = None
    bio: Optional[str] = None
    country: Optional[str] = None
    avatar_url: Optional[str] = None
    organization_name: Optional[str] = None

class UserAdminUpdate(BaseModel):
    """Admin-level user update."""
    full_name: Optional[str] = None
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[str] = None
    phone: Optional[str] = None
    bio: Optional[str] = None
    country: Optional[str] = None
    organization_name: Optional[str] = None
    is_active: Optional[bool] = None
    is_verified: Optional[bool] = None

class UserAdminCreate(BaseModel):
    """Admin creates a new user."""
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6)
    full_name: Optional[str] = None
    role: str = "consumer"
    phone: Optional[str] = None
    country: Optional[str] = None
    organization_name: Optional[str] = None
    is_active: bool = True
    is_verified: bool = False
    role_codes: List[str] = []  # Assign roles on creation

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=6)

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

class TokenData(BaseModel):
    user_id: Optional[str] = None
    role: Optional[str] = None


# ─────────────────────────────────────────────────────────────
# Permission & Role Schemas
# ─────────────────────────────────────────────────────────────

class PermissionOut(BaseModel):
    id: str
    code: str
    name: str
    description: Optional[str] = None
    module: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class RoleOut(BaseModel):
    id: str
    code: str
    name: str
    description: Optional[str] = None
    color: str = "#06B6D4"
    is_system: bool = False
    is_active: bool = True
    permissions: List[PermissionOut] = []
    user_count: int = 0
    created_at: datetime
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class RoleCreate(BaseModel):
    code: str = Field(..., min_length=2, max_length=50)
    name: str = Field(..., min_length=2, max_length=255)
    description: Optional[str] = None
    color: str = "#06B6D4"
    permission_codes: List[str] = []

class RoleUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    color: Optional[str] = None
    is_active: Optional[bool] = None
    permission_codes: Optional[List[str]] = None

class AssignRoleRequest(BaseModel):
    user_id: str
    role_code: str


# ─────────────────────────────────────────────────────────────
# Batch Schemas
# ─────────────────────────────────────────────────────────────

class BatchBase(BaseModel):
    batch_number: str
    manufacturing_date: Optional[str] = None
    expiry_date: Optional[str] = None
    quantity: Optional[int] = 1000
    is_recalled: bool = False
    recall_notice: Optional[str] = None
    notes: Optional[str] = None

class BatchCreate(BatchBase):
    pass

class BatchOut(BatchBase):
    id: str
    product_id: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


# ─────────────────────────────────────────────────────────────
# Product Schemas
# ─────────────────────────────────────────────────────────────

class ProductBase(BaseModel):
    name: str
    brand: str
    category: str = "Whey Protein"
    gtin_barcode: str
    sku: Optional[str] = None
    variant: Optional[str] = None
    flavor: Optional[str] = None
    net_weight: Optional[str] = None
    serving_size: Optional[str] = None
    form: Optional[str] = "Powder"
    description: Optional[str] = None
    image_url: Optional[str] = None
    certifications: Optional[List[str]] = []
    active_ingredients: Optional[List[Dict[str, Any]]] = []
    packaging_features: Optional[Dict[str, Any]] = None
    authorized_regions: Optional[str] = "Global"
    is_recalled: bool = False
    recall_reason: Optional[str] = None
    recall_date: Optional[str] = None
    recall_source_url: Optional[str] = None

class ProductCreate(ProductBase):
    company_id: Optional[str] = None
    batches: Optional[List[BatchCreate]] = []

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    brand: Optional[str] = None
    category: Optional[str] = None
    variant: Optional[str] = None
    flavor: Optional[str] = None
    net_weight: Optional[str] = None
    serving_size: Optional[str] = None
    form: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    certifications: Optional[List[str]] = None
    active_ingredients: Optional[List[Dict[str, Any]]] = None
    packaging_features: Optional[Dict[str, Any]] = None
    authorized_regions: Optional[str] = None
    is_recalled: Optional[bool] = None
    recall_reason: Optional[str] = None

class ProductOut(ProductBase):
    id: str
    company_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    batches: List[BatchOut] = []
    model_config = ConfigDict(from_attributes=True)


# ─────────────────────────────────────────────────────────────
# Trusted Source Schema
# ─────────────────────────────────────────────────────────────

class TrustedSourceOut(BaseModel):
    id: str
    code: str
    name: str
    category: str
    official_url: str
    lookup_method: str
    status: str
    trust_rationale: Optional[str] = None
    known_limitations: Optional[str] = None
    last_checked: datetime
    last_synced: datetime
    model_config = ConfigDict(from_attributes=True)


# ─────────────────────────────────────────────────────────────
# Evidence & Verification
# ─────────────────────────────────────────────────────────────

class EvidenceItem(BaseModel):
    source_name: str
    source_category: str  # GS1 Registry, Third-Party Certification, Official Manufacturer, Safety Regulator
    source_url: str
    claim_supported: str
    extracted_passage: Optional[str] = None
    classification: str  # "SUPPORTING", "CONTRADICTING", "INCONCLUSIVE", "OFFICIAL_ALERT"
    is_verified_fact: bool = True
    retrieval_timestamp: str

class RiskSignalItem(BaseModel):
    severity: str  # "CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"
    signal: str
    description: str

class VerificationRequest(BaseModel):
    barcode: Optional[str] = None
    batch_number: Optional[str] = None
    expiry_date: Optional[str] = None
    product_name_hint: Optional[str] = None
    image_base64: Optional[str] = None
    nutrition_label_base64: Optional[str] = None
    location_name: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class VerificationResultOut(BaseModel):
    session_id: str
    # VERIFIED, SUSPICIOUS, NOT_VERIFIED, OFFICIAL_WARNING
    verdict: str
    verdict_title: str
    confidence_score: float
    explanation: str
    limitations: str
    recommendation: str
    product: Optional[ProductOut] = None
    batch_matched: Optional[BatchOut] = None
    evidence_records: List[EvidenceItem] = []
    sources_consulted: List[Dict[str, Any]] = []
    risk_signals: List[RiskSignalItem] = []
    extracted_data: Dict[str, Any] = {}
    created_at: datetime


# ─────────────────────────────────────────────────────────────
# Report Schemas
# ─────────────────────────────────────────────────────────────

class ReportCreate(BaseModel):
    verification_id: Optional[str] = None
    reporter_email: Optional[EmailStr] = None
    reporter_role: str = "consumer"
    product_name: Optional[str] = None
    brand: Optional[str] = None
    barcode: Optional[str] = None
    batch_number: Optional[str] = None
    store_location: Optional[str] = None
    purchase_price: Optional[str] = None
    description: str
    evidence_images: Optional[List[str]] = []

class ReportOut(ReportCreate):
    id: str
    status: str
    resolution_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


# ─────────────────────────────────────────────────────────────
# Analytics
# ─────────────────────────────────────────────────────────────

class AnalyticsSummaryOut(BaseModel):
    total_scans: int
    verified_count: int
    suspicious_count: int
    not_verified_count: int
    warning_count: int
    total_supplements_cataloged: int
    total_reports_filed: int
    active_sources_count: int
    recent_verdicts: List[Dict[str, Any]]
