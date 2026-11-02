from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc

from app.core.database import get_db
from app.models import Report, User
from app.schemas import ReportCreate, ReportOut
from app.api.v1.auth import get_required_user

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.post("", response_model=ReportOut)
async def submit_report(report_in: ReportCreate, db: AsyncSession = Depends(get_db)):
    """Submits a counterfeit or product discrepancy report."""
    report = Report(
        verification_id=report_in.verification_id,
        reporter_email=report_in.reporter_email,
        reporter_role=report_in.reporter_role or "consumer",
        product_name=report_in.product_name,
        barcode=report_in.barcode,
        store_location=report_in.store_location,
        description=report_in.description,
        evidence_images=report_in.evidence_images or [],
        status="PENDING_REVIEW"
    )
    db.add(report)
    await db.commit()
    await db.refresh(report)
    return report

@router.get("", response_model=List[ReportOut])
async def list_reports(
    status: Optional[str] = Query(None),
    limit: int = Query(50, le=100),
    db: AsyncSession = Depends(get_db)
):
    """Lists fraud / counterfeit reports for inspector and company oversight."""
    query = select(Report).order_by(desc(Report.created_at))
    if status:
        query = query.where(Report.status == status)
    query = query.limit(limit)

    res = await db.execute(query)
    reports = res.scalars().all()
    return reports

@router.put("/{id}/status", response_model=ReportOut)
async def update_report_status(
    id: str,
    status: str,
    resolution_notes: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_required_user)
):
    """Updates investigation status and resolutions notes on a fraud case."""
    res = await db.execute(select(Report).where(Report.id == id))
    report = res.scalars().first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found.")

    report.status = status
    if resolution_notes:
        report.resolution_notes = resolution_notes

    await db.commit()
    await db.refresh(report)
    return report
