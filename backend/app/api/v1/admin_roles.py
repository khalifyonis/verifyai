"""
Admin Roles & Permissions Management API — Full CRUD for RBAC.
Also handles seeding default roles and permissions on startup.
"""
from typing import Optional, List
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import func

from app.core.database import get_db
from app.core.security import get_password_hash
from app.models import Role, Permission, RolePermission, UserRole, AuditLog, User
from app.schemas import RoleOut, RoleCreate, RoleUpdate, PermissionOut
from app.api.v1.auth import get_admin_user

router = APIRouter(prefix="/admin/roles", tags=["Admin — Roles & Permissions"])


# ──────────────────────────────────────────────────────────
# DEFAULT SYSTEM DATA
# ──────────────────────────────────────────────────────────

DEFAULT_PERMISSIONS = [
    # Users module
    {"code": "users.view",        "name": "View Users",           "module": "users",        "description": "View user list and profiles"},
    {"code": "users.create",      "name": "Create Users",         "module": "users",        "description": "Create new user accounts"},
    {"code": "users.edit",        "name": "Edit Users",           "module": "users",        "description": "Update user information"},
    {"code": "users.delete",      "name": "Delete Users",         "module": "users",        "description": "Deactivate or remove users"},
    {"code": "users.roles",       "name": "Manage User Roles",    "module": "users",        "description": "Assign and remove roles from users"},
    # Products module
    {"code": "products.view",     "name": "View Products",        "module": "products",     "description": "View the product catalog"},
    {"code": "products.create",   "name": "Create Products",      "module": "products",     "description": "Add new products to the catalog"},
    {"code": "products.edit",     "name": "Edit Products",        "module": "products",     "description": "Update product details"},
    {"code": "products.delete",   "name": "Delete Products",      "module": "products",     "description": "Remove products from catalog"},
    # Verification module
    {"code": "verify.scan",       "name": "Run Verification",     "module": "verification", "description": "Perform product verification scans"},
    {"code": "verify.history",    "name": "View Scan History",    "module": "verification", "description": "Access all scan history"},
    # Reports module
    {"code": "reports.view",      "name": "View Reports",         "module": "reports",      "description": "View fraud/suspicious reports"},
    {"code": "reports.create",    "name": "Submit Reports",       "module": "reports",      "description": "File new fraud reports"},
    {"code": "reports.manage",    "name": "Manage Reports",       "module": "reports",      "description": "Update report status and resolution"},
    # Sources module
    {"code": "sources.view",      "name": "View Sources",         "module": "sources",      "description": "View trusted verification sources"},
    {"code": "sources.manage",    "name": "Manage Sources",       "module": "sources",      "description": "Add, edit, or remove trusted sources"},
    # Analytics module
    {"code": "analytics.view",    "name": "View Analytics",       "module": "analytics",    "description": "Access platform analytics"},
    # Admin module
    {"code": "admin.dashboard",   "name": "Admin Dashboard",      "module": "admin",        "description": "Access the admin dashboard"},
    {"code": "admin.settings",    "name": "Platform Settings",    "module": "admin",        "description": "Modify platform settings"},
    {"code": "admin.audit",       "name": "View Audit Logs",      "module": "admin",        "description": "Access audit trail logs"},
    # Roles module
    {"code": "roles.view",        "name": "View Roles",           "module": "roles",        "description": "View roles and permissions"},
    {"code": "roles.create",      "name": "Create Roles",         "module": "roles",        "description": "Create new roles"},
    {"code": "roles.edit",        "name": "Edit Roles",           "module": "roles",        "description": "Update roles and their permissions"},
    {"code": "roles.delete",      "name": "Delete Roles",         "module": "roles",        "description": "Remove roles"},
]

DEFAULT_ROLES = [
    {
        "code": "super_admin",
        "name": "Super Administrator",
        "description": "Full platform access with all permissions. Cannot be deleted.",
        "color": "#F43F5E",
        "is_system": True,
        "permissions": [p["code"] for p in DEFAULT_PERMISSIONS],  # All permissions
    },
    {
        "code": "admin",
        "name": "Administrator",
        "description": "Platform administration with user and content management.",
        "color": "#6366F1",
        "is_system": True,
        "permissions": [
            "users.view", "users.create", "users.edit", "users.delete", "users.roles",
            "products.view", "products.create", "products.edit", "products.delete",
            "verify.scan", "verify.history",
            "reports.view", "reports.create", "reports.manage",
            "sources.view", "sources.manage",
            "analytics.view",
            "admin.dashboard", "admin.audit",
            "roles.view",
        ],
    },
    {
        "code": "inspector",
        "name": "Inspector",
        "description": "Field inspector with verification and report review access.",
        "color": "#F59E0B",
        "is_system": True,
        "permissions": [
            "products.view",
            "verify.scan", "verify.history",
            "reports.view", "reports.create", "reports.manage",
            "sources.view",
            "analytics.view",
        ],
    },
    {
        "code": "company",
        "name": "Company / Importer",
        "description": "Brand partner with product catalog and batch management access.",
        "color": "#10B981",
        "is_system": True,
        "permissions": [
            "products.view", "products.create", "products.edit",
            "verify.scan", "verify.history",
            "reports.view",
            "sources.view",
        ],
    },
    {
        "code": "consumer",
        "name": "Consumer",
        "description": "Public user with scan and reporting access.",
        "color": "#06B6D4",
        "is_system": True,
        "permissions": [
            "products.view",
            "verify.scan", "verify.history",
            "reports.create",
            "sources.view",
        ],
    },
]


async def seed_roles_and_permissions(db: AsyncSession):
    """Seed default permissions and roles if they don't exist."""
    # Seed permissions
    for perm_data in DEFAULT_PERMISSIONS:
        existing = await db.execute(select(Permission).where(Permission.code == perm_data["code"]))
        if not existing.scalars().first():
            db.add(Permission(**perm_data))
    await db.commit()
    
    # Seed roles
    for role_data in DEFAULT_ROLES:
        existing = await db.execute(select(Role).where(Role.code == role_data["code"]))
        role = existing.scalars().first()
        if not role:
            role = Role(
                code=role_data["code"],
                name=role_data["name"],
                description=role_data["description"],
                color=role_data["color"],
                is_system=role_data["is_system"],
            )
            db.add(role)
            await db.flush()
        
        # Assign permissions
        for perm_code in role_data["permissions"]:
            perm_res = await db.execute(select(Permission).where(Permission.code == perm_code))
            perm = perm_res.scalars().first()
            if perm:
                existing_rp = await db.execute(
                    select(RolePermission).where(
                        RolePermission.role_id == role.id,
                        RolePermission.permission_id == perm.id
                    )
                )
                if not existing_rp.scalars().first():
                    db.add(RolePermission(role_id=role.id, permission_id=perm.id))
    
    # Seed default system users if they don't exist
    demo_users = [
        {
            "email": "admin@verifai.io",
            "username": "admin_hassan",
            "full_name": "Lead Inspector Hassan",
            "role": "super_admin",
            "organization_name": "National Anti-Counterfeit Task Force",
            "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
            "bio": "Lead Regulatory & Compliance Officer overseeing sports supplement authentication.",
            "country": "United States",
        },
        {
            "email": "inspector@verifai.io",
            "username": "dr_sarah",
            "full_name": "Dr. Sarah Al-Mansoor",
            "role": "inspector",
            "organization_name": "FDA Field Operations & Border Inspection",
            "avatar_url": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80",
            "bio": "Senior Inspector specializing in supplement purity and packaging forensics.",
            "country": "United Arab Emirates",
        },
        {
            "email": "partner@glanbia.com",
            "username": "glanbia_partner",
            "full_name": "Glanbia Brand Assurance",
            "role": "company",
            "organization_name": "Glanbia Performance Nutrition (ON)",
            "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
            "bio": "Brand protection director for Optimum Nutrition and BSN global distribution.",
            "country": "Ireland",
        },
        {
            "email": "consumer@verifai.io",
            "username": "ahmed_consumer",
            "full_name": "Ahmed Farah",
            "role": "consumer",
            "organization_name": "Consumer Community",
            "avatar_url": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
            "bio": "Fitness enthusiast and supplement researcher verifying batch authenticity.",
            "country": "Somalia",
        },
    ]

    for u_info in demo_users:
        existing_u = await db.execute(select(User).where(User.email == u_info["email"]))
        user = existing_u.scalars().first()
        if not user:
            user = User(
                email=u_info["email"],
                username=u_info["username"],
                hashed_password=get_password_hash("verifai123"),
                full_name=u_info["full_name"],
                role=u_info["role"],
                organization_name=u_info["organization_name"],
                avatar_url=u_info["avatar_url"],
                bio=u_info["bio"],
                country=u_info["country"],
                auth_provider="local",
                is_active=True,
                is_verified=True,
                login_count=12,
            )
            db.add(user)
            await db.flush()
        else:
            if not user.username:
                user.username = u_info["username"]
            if not user.avatar_url:
                user.avatar_url = u_info["avatar_url"]
            if not user.bio:
                user.bio = u_info["bio"]
            if not user.country:
                user.country = u_info["country"]
        
        # Link role in UserRole
        role_res = await db.execute(select(Role).where(Role.code == u_info["role"]))
        target_role = role_res.scalars().first()
        if target_role:
            ur_check = await db.execute(
                select(UserRole).where(
                    UserRole.user_id == user.id,
                    UserRole.role_id == target_role.id
                )
            )
            if not ur_check.scalars().first():
                db.add(UserRole(user_id=user.id, role_id=target_role.id))

    await db.commit()


def _build_role_out(role: Role, user_count: int = 0) -> RoleOut:
    """Build RoleOut from ORM object."""
    perms = []
    if hasattr(role, "permissions") and role.permissions:
        for rp in role.permissions:
            if rp.permission:
                perms.append(PermissionOut(
                    id=rp.permission.id,
                    code=rp.permission.code,
                    name=rp.permission.name,
                    description=rp.permission.description,
                    module=rp.permission.module,
                    created_at=rp.permission.created_at,
                ))
    return RoleOut(
        id=role.id,
        code=role.code,
        name=role.name,
        description=role.description,
        color=role.color or "#06B6D4",
        is_system=role.is_system or False,
        is_active=role.is_active if role.is_active is not None else True,
        permissions=perms,
        user_count=user_count,
        created_at=role.created_at,
        updated_at=role.updated_at,
    )


# ──────────────────────────────────────────────────────────
# PERMISSIONS ENDPOINTS
# ──────────────────────────────────────────────────────────

@router.get("/permissions", response_model=List[PermissionOut])
async def list_permissions(
    module: Optional[str] = Query(None),
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """List all permissions, optionally filtered by module."""
    await seed_roles_and_permissions(db)
    
    query = select(Permission)
    if module:
        query = query.where(Permission.module == module)
    query = query.order_by(Permission.module, Permission.code)
    
    res = await db.execute(query)
    perms = res.scalars().all()
    return [PermissionOut.model_validate(p) for p in perms]


@router.get("/permissions/modules")
async def list_permission_modules(
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Get the list of unique permission modules."""
    await seed_roles_and_permissions(db)
    res = await db.execute(select(Permission.module).distinct())
    modules = [row[0] for row in res.all()]
    return sorted(modules)


# ──────────────────────────────────────────────────────────
# ROLES CRUD
# ──────────────────────────────────────────────────────────

@router.get("", response_model=List[RoleOut])
async def list_roles(
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """List all roles with their permissions and user counts."""
    await seed_roles_and_permissions(db)
    
    res = await db.execute(
        select(Role)
        .options(selectinload(Role.permissions).selectinload(RolePermission.permission))
        .order_by(Role.created_at)
    )
    roles = res.scalars().all()
    
    result = []
    for role in roles:
        uc_res = await db.execute(select(func.count(UserRole.id)).where(UserRole.role_id == role.id))
        uc = uc_res.scalar() or 0
        result.append(_build_role_out(role, user_count=uc))
    
    return result


@router.get("/{role_id}", response_model=RoleOut)
async def get_role(
    role_id: str,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a single role."""
    res = await db.execute(
        select(Role)
        .options(selectinload(Role.permissions).selectinload(RolePermission.permission))
        .where(Role.id == role_id)
    )
    role = res.scalars().first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found.")
    
    uc_res = await db.execute(select(func.count(UserRole.id)).where(UserRole.role_id == role.id))
    uc = uc_res.scalar() or 0
    return _build_role_out(role, user_count=uc)


@router.post("", response_model=RoleOut, status_code=201)
async def create_role(
    data: RoleCreate,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new custom role."""
    existing = await db.execute(select(Role).where(Role.code == data.code))
    if existing.scalars().first():
        raise HTTPException(status_code=400, detail=f"Role with code '{data.code}' already exists.")
    
    role = Role(
        code=data.code,
        name=data.name,
        description=data.description,
        color=data.color,
        is_system=False,
    )
    db.add(role)
    await db.flush()
    
    # Assign permissions
    for perm_code in data.permission_codes:
        perm_res = await db.execute(select(Permission).where(Permission.code == perm_code))
        perm = perm_res.scalars().first()
        if perm:
            db.add(RolePermission(role_id=role.id, permission_id=perm.id))
    
    db.add(AuditLog(
        user_id=admin.id,
        action="ADMIN_CREATE_ROLE",
        entity_type="role",
        entity_id=role.id,
        details={"code": role.code, "permissions": data.permission_codes}
    ))
    
    await db.commit()
    
    # Reload
    res = await db.execute(
        select(Role)
        .options(selectinload(Role.permissions).selectinload(RolePermission.permission))
        .where(Role.id == role.id)
    )
    role = res.scalars().first()
    return _build_role_out(role, user_count=0)


@router.put("/{role_id}", response_model=RoleOut)
async def update_role(
    role_id: str,
    data: RoleUpdate,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Update a role's details or permissions."""
    res = await db.execute(
        select(Role)
        .options(selectinload(Role.permissions).selectinload(RolePermission.permission))
        .where(Role.id == role_id)
    )
    role = res.scalars().first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found.")
    
    for field in ["name", "description", "color", "is_active"]:
        val = getattr(data, field, None)
        if val is not None:
            setattr(role, field, val)
    
    # Update permissions if provided
    if data.permission_codes is not None:
        # Remove existing permissions
        for rp in list(role.permissions):
            await db.delete(rp)
        await db.flush()
        
        # Add new permissions
        for perm_code in data.permission_codes:
            perm_res = await db.execute(select(Permission).where(Permission.code == perm_code))
            perm = perm_res.scalars().first()
            if perm:
                db.add(RolePermission(role_id=role.id, permission_id=perm.id))
    
    db.add(AuditLog(
        user_id=admin.id,
        action="ADMIN_UPDATE_ROLE",
        entity_type="role",
        entity_id=role.id,
        details={"code": role.code}
    ))
    
    await db.commit()
    
    # Reload
    res = await db.execute(
        select(Role)
        .options(selectinload(Role.permissions).selectinload(RolePermission.permission))
        .where(Role.id == role.id)
    )
    role = res.scalars().first()
    uc_res = await db.execute(select(func.count(UserRole.id)).where(UserRole.role_id == role.id))
    uc = uc_res.scalar() or 0
    return _build_role_out(role, user_count=uc)


@router.delete("/{role_id}")
async def delete_role(
    role_id: str,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a role. System roles cannot be deleted."""
    res = await db.execute(select(Role).where(Role.id == role_id))
    role = res.scalars().first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found.")
    
    if role.is_system:
        raise HTTPException(status_code=400, detail="System roles cannot be deleted.")
    
    # Check if users are assigned to this role
    uc_res = await db.execute(select(func.count(UserRole.id)).where(UserRole.role_id == role.id))
    uc = uc_res.scalar() or 0
    if uc > 0:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot delete role: {uc} user(s) still assigned. Remove users from this role first."
        )
    
    await db.delete(role)
    db.add(AuditLog(
        user_id=admin.id,
        action="ADMIN_DELETE_ROLE",
        entity_type="role",
        entity_id=role_id,
        details={"code": role.code}
    ))
    await db.commit()
    return {"message": f"Role '{role.code}' deleted."}
