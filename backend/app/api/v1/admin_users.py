"""
Admin User Management API — Full CRUD for users with RBAC role assignment.
"""
from typing import Optional, List
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import func, or_, desc

from app.core.database import get_db
from app.core.security import get_password_hash
from app.models import User, UserRole, Role, AuditLog
from app.schemas import UserOut, UserAdminCreate, UserAdminUpdate
from app.api.v1.auth import get_admin_user, _build_user_out, _load_user_with_roles

router = APIRouter(prefix="/admin/users", tags=["Admin — User Management"])


@router.get("", response_model=List[UserOut])
async def list_users(
    search: Optional[str] = Query(None, description="Search by name, email, or username"),
    role: Optional[str] = Query(None, description="Filter by legacy role"),
    is_active: Optional[bool] = Query(None),
    sort_by: str = Query("created_at", description="Sort field"),
    sort_dir: str = Query("desc", description="asc or desc"),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """List all users with search, filter, and pagination."""
    query = select(User).options(
        selectinload(User.user_roles).selectinload(UserRole.role)
    )
    
    if search:
        search_term = f"%{search}%"
        query = query.where(
            or_(
                User.email.ilike(search_term),
                User.full_name.ilike(search_term),
                User.username.ilike(search_term),
                User.organization_name.ilike(search_term),
            )
        )
    
    if role:
        query = query.where(User.role == role)
    
    if is_active is not None:
        query = query.where(User.is_active == is_active)
    
    # Sort
    sort_col = getattr(User, sort_by, User.created_at)
    if sort_dir == "asc":
        query = query.order_by(sort_col.asc())
    else:
        query = query.order_by(sort_col.desc())
    
    # Pagination
    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size)
    
    res = await db.execute(query)
    users = res.scalars().all()
    return [_build_user_out(u) for u in users]


@router.get("/stats")
async def user_stats(
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Get user statistics for the admin dashboard."""
    total = (await db.execute(select(func.count(User.id)))).scalar() or 0
    active = (await db.execute(select(func.count(User.id)).where(User.is_active == True))).scalar() or 0
    inactive = total - active
    verified = (await db.execute(select(func.count(User.id)).where(User.is_verified == True))).scalar() or 0
    
    # Counts by role
    role_counts = {}
    for role_name in ["consumer", "inspector", "company", "admin", "super_admin"]:
        count = (await db.execute(select(func.count(User.id)).where(User.role == role_name))).scalar() or 0
        role_counts[role_name] = count
    
    # Counts by auth provider
    local_count = (await db.execute(select(func.count(User.id)).where(User.auth_provider == "local"))).scalar() or 0
    google_count = (await db.execute(select(func.count(User.id)).where(User.auth_provider == "google"))).scalar() or 0
    
    # Recent signups (last 7 days)
    from datetime import timedelta
    seven_days_ago = datetime.now(timezone.utc) - timedelta(days=7)
    recent_signups = (await db.execute(
        select(func.count(User.id)).where(User.created_at >= seven_days_ago)
    )).scalar() or 0
    
    return {
        "total_users": total,
        "active_users": active,
        "inactive_users": inactive,
        "verified_users": verified,
        "role_counts": role_counts,
        "auth_providers": {"local": local_count, "google": google_count},
        "recent_signups_7d": recent_signups,
    }


@router.get("/{user_id}", response_model=UserOut)
async def get_user(
    user_id: str,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a single user by ID."""
    user = await _load_user_with_roles(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    return _build_user_out(user)


@router.post("", response_model=UserOut, status_code=201)
async def create_user(
    data: UserAdminCreate,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Admin creates a new user."""
    # Check email uniqueness
    res = await db.execute(select(User).where(User.email == data.email.lower()))
    if res.scalars().first():
        raise HTTPException(status_code=400, detail="Email already registered.")
    
    # Check username uniqueness
    if data.username:
        res2 = await db.execute(select(User).where(User.username == data.username.lower()))
        if res2.scalars().first():
            raise HTTPException(status_code=400, detail="Username already taken.")
    
    new_user = User(
        email=data.email.lower(),
        username=data.username.lower() if data.username else None,
        hashed_password=get_password_hash(data.password),
        full_name=data.full_name,
        role=data.role,
        phone=data.phone,
        country=data.country,
        organization_name=data.organization_name,
        auth_provider="local",
        is_active=data.is_active,
        is_verified=data.is_verified,
    )
    db.add(new_user)
    await db.flush()
    
    # Assign RBAC roles
    for code in data.role_codes:
        role_res = await db.execute(select(Role).where(Role.code == code))
        role_obj = role_res.scalars().first()
        if role_obj:
            db.add(UserRole(user_id=new_user.id, role_id=role_obj.id, assigned_by=admin.id))
    
    # If no explicit role_codes, assign the legacy role
    if not data.role_codes:
        role_res = await db.execute(select(Role).where(Role.code == data.role))
        role_obj = role_res.scalars().first()
        if role_obj:
            db.add(UserRole(user_id=new_user.id, role_id=role_obj.id, assigned_by=admin.id))
    
    # Audit
    db.add(AuditLog(
        user_id=admin.id,
        action="ADMIN_CREATE_USER",
        entity_type="user",
        entity_id=new_user.id,
        details={"email": new_user.email, "role": data.role, "created_by": admin.email}
    ))
    
    await db.commit()
    user = await _load_user_with_roles(db, new_user.id)
    return _build_user_out(user)


@router.put("/{user_id}", response_model=UserOut)
async def update_user(
    user_id: str,
    data: UserAdminUpdate,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Admin updates a user."""
    user = await _load_user_with_roles(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    
    # Email uniqueness check
    if data.email is not None and data.email.lower() != user.email:
        dup = await db.execute(select(User).where(User.email == data.email.lower(), User.id != user_id))
        if dup.scalars().first():
            raise HTTPException(status_code=400, detail="Email already in use.")
        user.email = data.email.lower()
    
    # Username uniqueness check
    if data.username is not None and data.username.lower() != (user.username or ""):
        dup = await db.execute(select(User).where(User.username == data.username.lower(), User.id != user_id))
        if dup.scalars().first():
            raise HTTPException(status_code=400, detail="Username already taken.")
        user.username = data.username.lower()
    
    for field in ["full_name", "role", "phone", "bio", "country", "organization_name", "is_active", "is_verified"]:
        val = getattr(data, field, None)
        if val is not None:
            setattr(user, field, val)
    
    # Audit
    db.add(AuditLog(
        user_id=admin.id,
        action="ADMIN_UPDATE_USER",
        entity_type="user",
        entity_id=user_id,
        details={"updated_fields": [k for k, v in data.model_dump(exclude_unset=True).items() if v is not None]}
    ))
    
    await db.commit()
    user = await _load_user_with_roles(db, user_id)
    return _build_user_out(user)


@router.delete("/{user_id}")
async def delete_user(
    user_id: str,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Admin deletes (deactivates) a user. Hard-delete is avoided for audit trail."""
    if user_id == admin.id:
        raise HTTPException(status_code=400, detail="You cannot delete your own account.")
    
    user = await _load_user_with_roles(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    
    user.is_active = False
    
    db.add(AuditLog(
        user_id=admin.id,
        action="ADMIN_DEACTIVATE_USER",
        entity_type="user",
        entity_id=user_id,
        details={"email": user.email}
    ))
    
    await db.commit()
    return {"message": f"User {user.email} has been deactivated."}


@router.post("/{user_id}/activate")
async def activate_user(
    user_id: str,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Re-activate a deactivated user."""
    res = await db.execute(select(User).where(User.id == user_id))
    user = res.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    
    user.is_active = True
    db.add(AuditLog(
        user_id=admin.id,
        action="ADMIN_ACTIVATE_USER",
        entity_type="user",
        entity_id=user_id,
        details={"email": user.email}
    ))
    await db.commit()
    return {"message": f"User {user.email} has been activated."}


@router.post("/{user_id}/reset-password")
async def admin_reset_password(
    user_id: str,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Admin resets a user's password to a temporary one."""
    res = await db.execute(select(User).where(User.id == user_id))
    user = res.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    
    temp_password = "Verifai@2026"
    user.hashed_password = get_password_hash(temp_password)
    
    db.add(AuditLog(
        user_id=admin.id,
        action="ADMIN_RESET_PASSWORD",
        entity_type="user",
        entity_id=user_id,
        details={"email": user.email}
    ))
    await db.commit()
    return {"message": f"Password reset. Temporary password: {temp_password}"}


@router.post("/{user_id}/roles/{role_code}")
async def assign_role_to_user(
    user_id: str,
    role_code: str,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Assign an RBAC role to a user."""
    res = await db.execute(select(User).where(User.id == user_id))
    user = res.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    
    role_res = await db.execute(select(Role).where(Role.code == role_code))
    role = role_res.scalars().first()
    if not role:
        raise HTTPException(status_code=404, detail=f"Role '{role_code}' not found.")
    
    # Check if already assigned
    existing = await db.execute(
        select(UserRole).where(UserRole.user_id == user_id, UserRole.role_id == role.id)
    )
    if existing.scalars().first():
        raise HTTPException(status_code=400, detail="Role already assigned to this user.")
    
    db.add(UserRole(user_id=user_id, role_id=role.id, assigned_by=admin.id))
    
    # Also update the legacy role field
    user.role = role_code
    
    db.add(AuditLog(
        user_id=admin.id,
        action="ADMIN_ASSIGN_ROLE",
        entity_type="user_role",
        entity_id=user_id,
        details={"role": role_code}
    ))
    await db.commit()
    
    loaded = await _load_user_with_roles(db, user_id)
    return _build_user_out(loaded)


@router.delete("/{user_id}/roles/{role_code}")
async def remove_role_from_user(
    user_id: str,
    role_code: str,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Remove an RBAC role from a user."""
    role_res = await db.execute(select(Role).where(Role.code == role_code))
    role = role_res.scalars().first()
    if not role:
        raise HTTPException(status_code=404, detail=f"Role '{role_code}' not found.")
    
    ur_res = await db.execute(
        select(UserRole).where(UserRole.user_id == user_id, UserRole.role_id == role.id)
    )
    ur = ur_res.scalars().first()
    if not ur:
        raise HTTPException(status_code=404, detail="User does not have this role.")
    
    await db.delete(ur)
    
    db.add(AuditLog(
        user_id=admin.id,
        action="ADMIN_REMOVE_ROLE",
        entity_type="user_role",
        entity_id=user_id,
        details={"role": role_code}
    ))
    await db.commit()
    
    loaded = await _load_user_with_roles(db, user_id)
    return _build_user_out(loaded)
