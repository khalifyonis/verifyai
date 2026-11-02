import uuid
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc

from app.core.database import get_db
from app.models import VerificationScan, User
from app.schemas import VerificationRequest, VerificationResultOut, ProductOut, BatchOut
from app.services.verification_engine import VerificationEngine
from app.api.v1.auth import get_current_user

router = APIRouter(prefix="/verify", tags=["Verification"])

@router.post("/scan", response_model=VerificationResultOut)
async def scan_and_verify(
    req: VerificationRequest,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Submits a gym supplement product for multi-factor evidence-based verification.
    """
    if not req.barcode and not req.image_base64 and not req.product_name_hint:
        raise HTTPException(
            status_code=400,
            detail="A barcode, product name, or packaging image must be provided."
        )

    # Run evidence-based verification engine
    result = await VerificationEngine.verify_product(
        db=db,
        barcode=req.barcode,
        batch_number=req.batch_number,
        expiry_date=req.expiry_date,
        product_name_hint=req.product_name_hint,
        image_base64=req.image_base64,
        nutrition_label_base64=req.nutrition_label_base64,
        client_metadata={
            "location_name": req.location_name,
            "latitude": req.latitude,
            "longitude": req.longitude
        }
    )

    session_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)

    # Persist the scan in database
    scan_record = VerificationScan(
        id=str(uuid.uuid4()),
        session_id=session_id,
        user_id=current_user.id if current_user else None,
        barcode_scanned=req.barcode or result["extracted_data"].get("barcode"),
        batch_number_scanned=req.batch_number or result["extracted_data"].get("batch_number"),
        expiry_date_scanned=req.expiry_date or result["extracted_data"].get("expiry_date"),
        product_name_hint=req.product_name_hint,
        verdict=result["verdict"],
        confidence_score=result["confidence_score"],
        explanation=result["explanation"],
        limitations=result["limitations"],
        recommendation=result["recommendation"],
        evidence_records=result["evidence_records"],
        sources_consulted=result["sources_consulted"],
        risk_signals=result["risk_signals"],
        location_name=req.location_name or "Fitness Consumer Web App",
        latitude=req.latitude,
        longitude=req.longitude,
        created_at=now
    )
    db.add(scan_record)
    await db.commit()

    product_out = ProductOut.model_validate(result["product"]) if result["product"] else None
    batch_out = BatchOut.model_validate(result["batch_matched"]) if result["batch_matched"] else None

    return VerificationResultOut(
        session_id=session_id,
        verdict=result["verdict"],
        verdict_title=result["verdict_title"],
        confidence_score=result["confidence_score"],
        explanation=result["explanation"],
        limitations=result["limitations"],
        recommendation=result["recommendation"],
        product=product_out,
        batch_matched=batch_out,
        evidence_records=result["evidence_records"],
        sources_consulted=result["sources_consulted"],
        risk_signals=result["risk_signals"],
        extracted_data=result["extracted_data"],
        created_at=now
    )

@router.get("/history")
async def get_scan_history(
    verdict: Optional[str] = Query(None),
    limit: int = Query(20, le=100),
    db: AsyncSession = Depends(get_db)
):
    query = select(VerificationScan).order_by(desc(VerificationScan.created_at))
    if verdict:
        query = query.where(VerificationScan.verdict == verdict)
    query = query.limit(limit)

    res = await db.execute(query)
    scans = res.scalars().all()
    
    return [
        {
            "id": s.id,
            "session_id": s.session_id,
            "barcode": s.barcode_scanned,
            "batch_number": s.batch_number_scanned,
            "expiry_date": s.expiry_date_scanned,
            "product_name_hint": s.product_name_hint,
            "verdict": s.verdict,
            "confidence_score": s.confidence_score,
            "location_name": s.location_name,
            "created_at": s.created_at,
            "risk_count": len(s.risk_signals or []),
            "evidence_count": len(s.evidence_records or [])
        }
        for s in scans
    ]

@router.get("/scan/{id}")
async def get_scan_detail(id: str, db: AsyncSession = Depends(get_db)):
    res = await db.execute(
        select(VerificationScan).where(
            (VerificationScan.id == id) | (VerificationScan.session_id == id)
        )
    )
    scan = res.scalars().first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan record not found.")

    return {
        "id": scan.id,
        "session_id": scan.session_id,
        "barcode": scan.barcode_scanned,
        "batch_number": scan.batch_number_scanned,
        "expiry_date": scan.expiry_date_scanned,
        "verdict": scan.verdict,
        "confidence_score": scan.confidence_score,
        "explanation": scan.explanation,
        "limitations": scan.limitations,
        "evidence_records": scan.evidence_records,
        "sources_consulted": scan.sources_consulted,
        "risk_signals": scan.risk_signals,
        "recommendation": scan.recommendation,
        "location_name": scan.location_name,
        "created_at": scan.created_at
    }
