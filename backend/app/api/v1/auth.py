from typing import Optional, List
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from jose import JWTError, jwt

from app.core.config import settings
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token
from app.models import User, UserRole, Role, RolePermission, AuditLog
from app.schemas import (
    UserCreate, UserLogin, UserOut, Token, TokenData,
    GoogleAuthRequest, UserUpdateProfile, ChangePasswordRequest
)

router = APIRouter(prefix="/auth", tags=["Authentication"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login-form", auto_error=False)


def _build_user_out(user: User) -> UserOut:
    """Build a UserOut with role codes resolved from RBAC relationships."""
    role_codes = []
    if hasattr(user, "user_roles") and user.user_roles:
        role_codes = [ur.role.code for ur in user.user_roles if ur.role]
    # Also include the legacy role field if not already present
    if user.role and user.role not in role_codes:
        role_codes.insert(0, user.role)
    return UserOut(
        id=user.id,
        email=user.email,
        username=user.username,
        full_name=user.full_name,
        role=user.role or "consumer",
        organization_name=user.organization_name,
        avatar_url=user.avatar_url,
        phone=user.phone,
        bio=user.bio,
        country=user.country,
        auth_provider=user.auth_provider or "local",
        is_active=user.is_active,
        is_verified=user.is_verified or False,
        last_login=user.last_login,
        login_count=user.login_count or 0,
        created_at=user.created_at,
        updated_at=user.updated_at,
        roles=role_codes,
    )


async def _load_user_with_roles(db: AsyncSession, user_id: str) -> Optional[User]:
    """Load user with eagerly loaded roles."""
    res = await db.execute(
        select(User)
        .options(selectinload(User.user_roles).selectinload(UserRole.role))
        .where(User.id == user_id)
    )
    return res.scalars().first()


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> Optional[User]:
    if not token:
        return None
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            return None
    except JWTError:
        return None
    
    user = await _load_user_with_roles(db, user_id)
    return user

async def get_required_user(user: Optional[User] = Depends(get_current_user)) -> User:
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided or have expired.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated. Contact an administrator.",
        )
    return user

async def get_admin_user(user: User = Depends(get_required_user)) -> User:
    """Require the user to be an admin or super_admin."""
    admin_roles = {"admin", "super_admin"}
    user_roles = set()
    if user.role:
        user_roles.add(user.role)
    if hasattr(user, "user_roles") and user.user_roles:
        user_roles.update(ur.role.code for ur in user.user_roles if ur.role)
    if not user_roles & admin_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator privileges required.",
        )
    return user


# ──────────────────────────────────────────────────────────
# REGISTRATION
# ──────────────────────────────────────────────────────────

@router.post("/register", response_model=Token)
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    # Check if email exists
    res = await db.execute(select(User).where(User.email == user_in.email.lower()))
    if res.scalars().first():
        raise HTTPException(status_code=400, detail="User with this email already registered.")
    
    # Check if username exists
    if user_in.username:
        res2 = await db.execute(select(User).where(User.username == user_in.username.lower()))
        if res2.scalars().first():
            raise HTTPException(status_code=400, detail="This username is already taken.")
    
    new_user = User(
        email=user_in.email.lower(),
        username=user_in.username.lower() if user_in.username else None,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role=user_in.role or "consumer",
        organization_name=user_in.organization_name,
        phone=user_in.phone,
        country=user_in.country,
        auth_provider="local",
        is_active=True,
        is_verified=False,
        last_login=datetime.now(timezone.utc),
        login_count=1,
    )
    db.add(new_user)
    await db.flush()
    
    # Assign default role from RBAC
    role_res = await db.execute(select(Role).where(Role.code == (user_in.role or "consumer")))
    default_role = role_res.scalars().first()
    if default_role:
        db.add(UserRole(user_id=new_user.id, role_id=default_role.id))
    
    # Audit log
    db.add(AuditLog(
        user_id=new_user.id,
        action="USER_REGISTERED",
        entity_type="user",
        entity_id=new_user.id,
        details={"email": new_user.email, "method": "local"}
    ))
    
    await db.commit()
    
    # Reload with roles
    user = await _load_user_with_roles(db, new_user.id)
    access_token = create_access_token(subject=user.id)
    return Token(access_token=access_token, token_type="bearer", user=_build_user_out(user))


# ──────────────────────────────────────────────────────────
# LOGIN
# ──────────────────────────────────────────────────────────

@router.post("/login", response_model=Token)
async def login(credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    res = await db.execute(
        select(User)
        .options(selectinload(User.user_roles).selectinload(UserRole.role))
        .where(User.email == credentials.email.lower())
    )
    user = res.scalars().first()
    if not user or not user.hashed_password or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid email or password.")
    
    if not user.is_active:
        raise HTTPException(status_code=400, detail="User account is deactivated.")
    
    # Update login stats
    user.last_login = datetime.now(timezone.utc)
    user.login_count = (user.login_count or 0) + 1
    await db.commit()
    await db.refresh(user)
    
    access_token = create_access_token(subject=user.id)
    return Token(access_token=access_token, token_type="bearer", user=_build_user_out(user))

@router.post("/login-form", response_model=Token)
async def login_form(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    res = await db.execute(
        select(User)
        .options(selectinload(User.user_roles).selectinload(UserRole.role))
        .where(User.email == form_data.username.lower())
    )
    user = res.scalars().first()
    if not user or not user.hashed_password or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid credentials.")
    
    user.last_login = datetime.now(timezone.utc)
    user.login_count = (user.login_count or 0) + 1
    await db.commit()
    
    access_token = create_access_token(subject=user.id)
    return Token(access_token=access_token, token_type="bearer", user=_build_user_out(user))


# ──────────────────────────────────────────────────────────
# GOOGLE OAUTH
# ──────────────────────────────────────────────────────────

@router.post("/google", response_model=Token)
async def google_auth(payload: GoogleAuthRequest, db: AsyncSession = Depends(get_db)):
    """
    Handle Google Sign-In from the frontend.
    If the user already exists (by google_id or email), log them in.
    Otherwise create a new account.
    """
    # Try to find by google_id first
    res = await db.execute(
        select(User)
        .options(selectinload(User.user_roles).selectinload(UserRole.role))
        .where(User.google_id == payload.google_id)
    )
    user = res.scalars().first()
    
    if not user:
        # Try by email
        res2 = await db.execute(
            select(User)
            .options(selectinload(User.user_roles).selectinload(UserRole.role))
            .where(User.email == payload.email.lower())
        )
        user = res2.scalars().first()
        
        if user:
            # Link Google to existing account
            user.google_id = payload.google_id
            user.auth_provider = "google"
            if not user.avatar_url and payload.avatar_url:
                user.avatar_url = payload.avatar_url
            if not user.full_name and payload.full_name:
                user.full_name = payload.full_name
        else:
            # Create new Google user
            # Generate a username from email
            base_username = payload.email.split("@")[0].lower()
            username = base_username
            suffix = 1
            while True:
                check = await db.execute(select(User).where(User.username == username))
                if not check.scalars().first():
                    break
                username = f"{base_username}{suffix}"
                suffix += 1
            
            user = User(
                email=payload.email.lower(),
                username=username,
                full_name=payload.full_name,
                avatar_url=payload.avatar_url,
                google_id=payload.google_id,
                auth_provider="google",
                role="consumer",
                is_active=True,
                is_verified=True,  # Google-verified email
                last_login=datetime.now(timezone.utc),
                login_count=1,
            )
            db.add(user)
            await db.flush()
            
            # Assign default consumer role
            role_res = await db.execute(select(Role).where(Role.code == "consumer"))
            default_role = role_res.scalars().first()
            if default_role:
                db.add(UserRole(user_id=user.id, role_id=default_role.id))
            
            db.add(AuditLog(
                user_id=user.id,
                action="USER_REGISTERED",
                entity_type="user",
                entity_id=user.id,
                details={"email": user.email, "method": "google"}
            ))
    
    if not user.is_active:
        raise HTTPException(status_code=400, detail="User account is deactivated.")
    
    user.last_login = datetime.now(timezone.utc)
    user.login_count = (user.login_count or 0) + 1
    await db.commit()
    
    # Reload with roles
    user = await _load_user_with_roles(db, user.id)
    access_token = create_access_token(subject=user.id)
    return Token(access_token=access_token, token_type="bearer", user=_build_user_out(user))


# ──────────────────────────────────────────────────────────
# PROFILE
# ──────────────────────────────────────────────────────────

@router.get("/me", response_model=UserOut)
async def get_me(current_user: User = Depends(get_required_user)):
    return _build_user_out(current_user)

@router.put("/me", response_model=UserOut)
async def update_profile(
    data: UserUpdateProfile,
    current_user: User = Depends(get_required_user),
    db: AsyncSession = Depends(get_db)
):
    if data.username is not None:
        # Check uniqueness
        res = await db.execute(
            select(User).where(User.username == data.username.lower(), User.id != current_user.id)
        )
        if res.scalars().first():
            raise HTTPException(status_code=400, detail="This username is already taken.")
        current_user.username = data.username.lower()
    
    for field in ["full_name", "phone", "bio", "country", "avatar_url", "organization_name"]:
        val = getattr(data, field, None)
        if val is not None:
            setattr(current_user, field, val)
    
    await db.commit()
    user = await _load_user_with_roles(db, current_user.id)
    return _build_user_out(user)

@router.put("/me/password")
async def change_password(
    data: ChangePasswordRequest,
    current_user: User = Depends(get_required_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.auth_provider == "google" and not current_user.hashed_password:
        raise HTTPException(status_code=400, detail="Google-authenticated accounts cannot change password here. Set a password first.")
    
    if not verify_password(data.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect.")
    
    current_user.hashed_password = get_password_hash(data.new_password)
    await db.commit()
    return {"message": "Password updated successfully."}
