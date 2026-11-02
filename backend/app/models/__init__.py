import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text, ForeignKey, JSON, Table, UniqueConstraint
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

# ─────────────────────────────────────────────────────────────
# RBAC: Roles & Permissions
# ─────────────────────────────────────────────────────────────

class Permission(Base):
    __tablename__ = "permissions"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    code = Column(String(100), unique=True, index=True, nullable=False)       # e.g. "users.view", "products.create"
    name = Column(String(255), nullable=False)                                 # Human-readable: "View Users"
    description = Column(Text, nullable=True)
    module = Column(String(100), index=True, nullable=False, default="general")  # e.g. "users", "products", "reports", "verification"
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Many-to-many via RolePermission
    roles = relationship("RolePermission", back_populates="permission", cascade="all, delete-orphan")


class Role(Base):
    __tablename__ = "roles"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    code = Column(String(50), unique=True, index=True, nullable=False)   # "super_admin", "admin", "inspector", "company", "consumer"
    name = Column(String(255), nullable=False)                            # "Super Admin", "Administrator"
    description = Column(Text, nullable=True)
    color = Column(String(20), default="#06B6D4")                         # Badge color for UI
    is_system = Column(Boolean, default=False)                            # System roles can't be deleted
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Many-to-many via RolePermission
    permissions = relationship("RolePermission", back_populates="role", cascade="all, delete-orphan")
    # Many-to-many via UserRole
    users = relationship("UserRole", back_populates="role", cascade="all, delete-orphan")


class RolePermission(Base):
    __tablename__ = "role_permissions"
    __table_args__ = (
        UniqueConstraint("role_id", "permission_id", name="uq_role_permission"),
    )
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    role_id = Column(String(36), ForeignKey("roles.id", ondelete="CASCADE"), nullable=False)
    permission_id = Column(String(36), ForeignKey("permissions.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    role = relationship("Role", back_populates="permissions")
    permission = relationship("Permission", back_populates="roles")


class UserRole(Base):
    __tablename__ = "user_roles"
    __table_args__ = (
        UniqueConstraint("user_id", "role_id", name="uq_user_role"),
    )
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    role_id = Column(String(36), ForeignKey("roles.id", ondelete="CASCADE"), nullable=False)
    assigned_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    assigned_by = Column(String(36), nullable=True)  # Who assigned this role

    user = relationship("User", back_populates="user_roles")
    role = relationship("Role", back_populates="users")


# ─────────────────────────────────────────────────────────────
# Users
# ─────────────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=True)
    hashed_password = Column(String(255), nullable=True)  # Nullable for Google OAuth users
    full_name = Column(String(255), nullable=True)
    role = Column(String(50), default="consumer")  # Legacy simple role: consumer, inspector, company, admin
    organization_name = Column(String(255), nullable=True)
    
    # Profile fields
    avatar_url = Column(String(500), nullable=True)
    phone = Column(String(50), nullable=True)
    bio = Column(Text, nullable=True)
    country = Column(String(100), nullable=True)
    
    # Auth provider
    auth_provider = Column(String(50), default="local")  # "local", "google"
    google_id = Column(String(255), unique=True, nullable=True, index=True)
    
    # Status
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)  # Email verified
    last_login = Column(DateTime, nullable=True)
    login_count = Column(Integer, default=0)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # RBAC relationship
    user_roles = relationship("UserRole", back_populates="user", cascade="all, delete-orphan")


# ─────────────────────────────────────────────────────────────
# Companies
# ─────────────────────────────────────────────────────────────

class Company(Base):
    __tablename__ = "companies"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), index=True, nullable=False)
    registration_number = Column(String(100), unique=True, nullable=True)
    contact_email = Column(String(255), nullable=False)
    country = Column(String(100), default="Global")
    is_verified = Column(Boolean, default=True)
    official_website = Column(String(500), nullable=True)
    verification_portal_url = Column(String(500), nullable=True)
    api_key = Column(String(128), unique=True, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    products = relationship("Product", back_populates="company", cascade="all, delete-orphan")

class Product(Base):
    __tablename__ = "products"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    company_id = Column(String(36), ForeignKey("companies.id"), nullable=True)
    name = Column(String(255), index=True, nullable=False)
    brand = Column(String(255), index=True, nullable=False)
    # Supplement specific categories:
    # Whey Protein, Creatine Monohydrate, Pre-Workout, Mass Gainers, BCAAs & EAAs, Electrolytes & Hydration, Vitamins & Minerals, Omega-3
    category = Column(String(100), index=True, default="Whey Protein")
    gtin_barcode = Column(String(100), unique=True, index=True, nullable=False)
    sku = Column(String(100), nullable=True)
    
    # Supplement attributes
    variant = Column(String(255), nullable=True)  # e.g. "Double Rich Chocolate, 5 lbs / 2.27 kg"
    flavor = Column(String(100), nullable=True)
    net_weight = Column(String(100), nullable=True)
    serving_size = Column(String(100), nullable=True)
    form = Column(String(50), default="Powder")  # Powder, Capsule, Liquid, Bar
    
    description = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=True)
    certifications = Column(JSON, default=list)  # ["NSF Certified for Sport", "Informed Sport", "Creapure"]
    active_ingredients = Column(JSON, default=list)  # [{"name": "Creatine Monohydrate", "amount": "5g"}]
    packaging_features = Column(JSON, default=dict)  # neck bands, golden hologram seals, embossed logos, lot stamp format
    authorized_regions = Column(String(255), default="Global")
    
    # Recalls & Safety Warnings
    is_recalled = Column(Boolean, default=False)
    recall_reason = Column(Text, nullable=True)
    recall_date = Column(String(50), nullable=True)
    recall_source_url = Column(String(500), nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    company = relationship("Company", back_populates="products")
    batches = relationship("Batch", back_populates="product", cascade="all, delete-orphan")

class Batch(Base):
    __tablename__ = "batches"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    product_id = Column(String(36), ForeignKey("products.id"), nullable=False)
    batch_number = Column(String(100), index=True, nullable=False)
    manufacturing_date = Column(String(50), nullable=True)
    expiry_date = Column(String(50), nullable=True)
    quantity = Column(Integer, default=1000)
    is_recalled = Column(Boolean, default=False)
    recall_notice = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    product = relationship("Product", back_populates="batches")

class TrustedSource(Base):
    __tablename__ = "trusted_sources"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    code = Column(String(50), unique=True, index=True, nullable=False)  # GS1_VERIFIED, NSF_SPORT, INFORMED_SPORT, MANUFACTURER_CHANNEL, FDA_ALERT
    name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)  # "Registry", "Third-Party Certification", "Manufacturer Official", "Regulatory Safety"
    official_url = Column(String(500), nullable=False)
    lookup_method = Column(String(100), default="Search Grounding & Public Registry")
    status = Column(String(50), default="CONFIRMED")  # CONFIRMED, LIMITED, UNAVAILABLE
    trust_rationale = Column(Text, nullable=True)
    known_limitations = Column(Text, nullable=True)
    last_checked = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    last_synced = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class VerificationScan(Base):
    __tablename__ = "verification_scans"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    session_id = Column(String(100), index=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    
    # Input observations
    barcode_scanned = Column(String(100), index=True, nullable=True)
    batch_number_scanned = Column(String(100), nullable=True)
    expiry_date_scanned = Column(String(100), nullable=True)
    product_name_hint = Column(String(255), nullable=True)
    packaging_image_url = Column(String(500), nullable=True)
    nutrition_label_image_url = Column(String(500), nullable=True)
    extracted_text = Column(Text, nullable=True)
    
    # Core Statuses: VERIFIED, SUSPICIOUS, NOT_VERIFIED, OFFICIAL_WARNING
    verdict = Column(String(50), index=True, nullable=False)
    confidence_score = Column(Float, default=0.0)
    
    # Plain language explanation & limitation
    explanation = Column(Text, nullable=True)
    limitations = Column(Text, nullable=True)
    recommendation = Column(Text, nullable=True)
    
    # Structured evidence and source references
    evidence_records = Column(JSON, default=list)  # list of evidence objects with source URL, claims, and status
    sources_consulted = Column(JSON, default=list)  # list of sources with access status
    risk_signals = Column(JSON, default=list)
    ai_observations = Column(JSON, default=dict)
    
    location_name = Column(String(255), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class Report(Base):
    __tablename__ = "reports"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    verification_id = Column(String(36), ForeignKey("verification_scans.id"), nullable=True)
    reporter_email = Column(String(255), nullable=True)
    reporter_role = Column(String(50), default="consumer")
    product_name = Column(String(255), nullable=True)
    brand = Column(String(255), nullable=True)
    barcode = Column(String(100), nullable=True)
    batch_number = Column(String(100), nullable=True)
    store_location = Column(String(255), nullable=True)
    purchase_price = Column(String(50), nullable=True)
    description = Column(Text, nullable=False)
    evidence_images = Column(JSON, default=list)
    status = Column(String(50), default="PENDING_REVIEW")  # PENDING_REVIEW, INVESTIGATING, CONFIRMED_COUNTERFEIT, DISMISSED
    resolution_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), nullable=True)
    action = Column(String(100), nullable=False)
    entity_type = Column(String(100), nullable=False)
    entity_id = Column(String(100), nullable=True)
    details = Column(JSON, default=dict)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
