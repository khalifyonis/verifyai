from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.core.database import engine, Base, AsyncSessionLocal
from app.api.v1.auth import router as auth_router
from app.api.v1.verify import router as verify_router
from app.api.v1.products import router as products_router
from app.api.v1.reports import router as reports_router
from app.api.v1.analytics import router as analytics_router
from app.api.v1.seed import router as seed_router
from app.api.v1.sources import router as sources_router
from app.api.v1.admin_users import router as admin_users_router
from app.api.v1.admin_roles import router as admin_roles_router
from app.api.v1.admin_roles import seed_roles_and_permissions

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables on startup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    # Seed default roles & permissions
    async with AsyncSessionLocal() as db:
        await seed_roles_and_permissions(db)
    yield
    # Cleanup on shutdown
    await engine.dispose()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    description="VERIFAI — AI-Powered Product Verification & Anti-Counterfeit Platform API",
    lifespan=lifespan
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static file serving for uploads
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include API v1 Routers
prefix = settings.API_V1_STR
app.include_router(auth_router, prefix=prefix)
app.include_router(verify_router, prefix=prefix)
app.include_router(products_router, prefix=prefix)
app.include_router(reports_router, prefix=prefix)
app.include_router(analytics_router, prefix=prefix)
app.include_router(seed_router, prefix=prefix)
app.include_router(sources_router, prefix=prefix)
app.include_router(admin_users_router, prefix=prefix)
app.include_router(admin_roles_router, prefix=prefix)

@app.get("/")
async def root():
    return {
        "platform": "VERIFAI Anti-Counterfeit Platform",
        "status": "online",
        "version": settings.PROJECT_VERSION,
        "docs_url": "/docs",
        "api_v1": prefix
    }

@app.get("/health")
async def health():
    return {"status": "healthy"}
