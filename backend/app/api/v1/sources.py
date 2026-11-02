from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.database import get_db
from app.models import TrustedSource
from app.schemas import TrustedSourceOut
from app.services.source_registry import SourceRegistryService

router = APIRouter(prefix="/sources", tags=["Trusted Sources"])

@router.get("", response_model=List[TrustedSourceOut])
async def list_trusted_sources(db: AsyncSession = Depends(get_db)):
    """Lists all registered trusted verification sources and their operational status."""
    await SourceRegistryService.initialize_sources(db)
    sources = await SourceRegistryService.get_all_sources(db)
    return sources
