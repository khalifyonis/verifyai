import pytest
from app.services.barcode_service import validate_barcode, calculate_gs1_check_digit
from app.services.ocr_service import OCRService
from app.services.web_retrieval_service import WebRetrievalService
from app.services.verification_engine import VerificationEngine
from app.core.database import AsyncSessionLocal, engine, Base
from app.api.v1.seed import seed_supplement_database

def test_gs1_checksum_calculation():
    # EAN-13: 074892702410 + check digit 4
    check = calculate_gs1_check_digit("074892702410")
    assert check == 4

def test_valid_supplement_barcode():
    res = validate_barcode("0748927024104")
    assert res["valid"] is True
    assert res["check_digit_passed"] is True
    assert res["type"] == "EAN-13"

def test_invalid_barcode_checksum():
    res = validate_barcode("0748927024109")  # wrong check digit
    assert res["valid"] is False
    assert res["check_digit_passed"] is False

def test_ssrf_protection_filters_internal_addresses():
    assert WebRetrievalService.is_safe_url("https://www.optimumnutrition.com") is True
    assert WebRetrievalService.is_safe_url("https://sport.wetestyoutrust.com") is True
    assert WebRetrievalService.is_safe_url("http://localhost:8000/internal") is False
    assert WebRetrievalService.is_safe_url("http://127.0.0.1:5432/admin") is False
    assert WebRetrievalService.is_safe_url("http://192.168.1.1/router") is False
    assert WebRetrievalService.is_safe_url("http://169.254.169.254/metadata") is False

def test_ocr_date_expiry_detection():
    assert OCRService.is_date_expired("2020-01-01") is True
    assert OCRService.is_date_expired("2035-12-31") is False


# ─── Fixture: auto-create DB tables + seed data ───────────────────────

@pytest.fixture(autouse=True, scope="session")
def setup_database():
    """Create all tables and seed test data once per session."""
    import asyncio
    
    async def _setup():
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        async with AsyncSessionLocal() as db:
            await seed_supplement_database(db)
    asyncio.run(_setup())
    yield


@pytest.mark.asyncio
async def test_verified_genuine_creatine_scan():
    async with AsyncSessionLocal() as db:
        res = await VerificationEngine.verify_product(
            db=db,
            barcode="0748927024104",
            batch_number="ONC-84920",
            expiry_date="2027-04-14",
            product_name_hint="Optimum Nutrition Creatine"
        )
        assert res["verdict"] == "VERIFIED"
        assert res["confidence_score"] >= 90.0
        assert "Sufficient positive evidence established" in res["explanation"]
        assert res["batch_matched"] is not None
        assert len(res["evidence_records"]) >= 4

@pytest.mark.asyncio
async def test_suspicious_counterfeit_batch_scan():
    async with AsyncSessionLocal() as db:
        res = await VerificationEngine.verify_product(
            db=db,
            barcode="0748927024104",
            batch_number="FAKE-LOT-999",
            expiry_date="2029-12-31",
            product_name_hint="Optimum Nutrition Creatine"
        )
        assert res["verdict"] == "SUSPICIOUS"
        assert res["confidence_score"] <= 50.0
        assert any(r["signal"] == "UNVERIFIED_BATCH_CODE" for r in res["risk_signals"])

@pytest.mark.asyncio
async def test_official_warning_fda_recalled_preworkout():
    async with AsyncSessionLocal() as db:
        res = await VerificationEngine.verify_product(
            db=db,
            barcode="0619985432109",
            batch_number="APX-998",
            product_name_hint="Apex Nitric Surge"
        )
        assert res["verdict"] == "OFFICIAL_WARNING"
        assert "SAFETY WARNING" in res["verdict_title"] or "Recall" in res["verdict_title"]
        assert any(e["classification"] == "OFFICIAL_ALERT" for e in res["evidence_records"])

@pytest.mark.asyncio
async def test_not_verified_unregistered_supplement():
    async with AsyncSessionLocal() as db:
        res = await VerificationEngine.verify_product(
            db=db,
            barcode="0890123999992",
            product_name_hint="Unregistered Generic Supplement"
        )
        assert res["verdict"] == "NOT_VERIFIED"
        assert "NOT VERIFIED" in res["limitations"]
        assert "does NOT mean counterfeit" in res["limitations"]
