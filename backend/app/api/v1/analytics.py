from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, desc

from app.core.database import get_db
from app.models import VerificationScan, Product, Report, TrustedSource

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/summary")
async def get_analytics_summary(db: AsyncSession = Depends(get_db)):
    """Computes high-level supplement verification analytics."""
    res_scans = await db.execute(select(func.count(VerificationScan.id)))
    total_scans = res_scans.scalar() or 0

    res_verified = await db.execute(select(func.count(VerificationScan.id)).where(VerificationScan.verdict == "VERIFIED"))
    verified_count = res_verified.scalar() or 0

    res_suspicious = await db.execute(select(func.count(VerificationScan.id)).where(VerificationScan.verdict == "SUSPICIOUS"))
    suspicious_count = res_suspicious.scalar() or 0

    res_not_verified = await db.execute(select(func.count(VerificationScan.id)).where(VerificationScan.verdict == "NOT_VERIFIED"))
    not_verified_count = res_not_verified.scalar() or 0

    res_warning = await db.execute(select(func.count(VerificationScan.id)).where(VerificationScan.verdict == "OFFICIAL_WARNING"))
    warning_count = res_warning.scalar() or 0

    res_products = await db.execute(select(func.count(Product.id)))
    total_products = res_products.scalar() or 0

    res_reports = await db.execute(select(func.count(Report.id)))
    total_reports = res_reports.scalar() or 0

    res_sources = await db.execute(select(func.count(TrustedSource.id)))
    active_sources = res_sources.scalar() or 0

    res_recent = await db.execute(
        select(VerificationScan).order_by(desc(VerificationScan.created_at)).limit(6)
    )
    recent = res_recent.scalars().all()
    recent_verdicts = [
        {
            "id": s.id,
            "session_id": s.session_id,
            "barcode": s.barcode_scanned,
            "product_hint": s.product_name_hint,
            "verdict": s.verdict,
            "confidence_score": s.confidence_score,
            "location": s.location_name,
            "created_at": s.created_at
        }
        for s in recent
    ]

    return {
        "total_scans": total_scans,
        "verified_count": verified_count,
        "suspicious_count": suspicious_count,
        "not_verified_count": not_verified_count,
        "warning_count": warning_count,
        "total_supplements_cataloged": total_products,
        "total_reports_filed": total_reports,
        "active_sources_count": active_sources,
        "recent_verdicts": recent_verdicts
    }
