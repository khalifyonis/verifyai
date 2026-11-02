from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models import TrustedSource

INITIAL_TRUSTED_SOURCES = [
    {
        "code": "GS1_VERIFIED",
        "name": "Verified by GS1",
        "category": "Global Barcode Registry",
        "official_url": "https://www.gs1.org/services/verified-by-gs1",
        "lookup_method": "GTIN Prefix & Checksum Verification",
        "status": "CONFIRMED",
        "trust_rationale": "Official international standards organization for product barcodes and company licensing.",
        "known_limitations": "A valid GTIN proves company barcode registration, but does not prove a physical container is genuine. Counterfeits frequently copy legitimate GTINs."
    },
    {
        "code": "NSF_SPORT",
        "name": "NSF Certified for Sport",
        "category": "Third-Party Supplement Certification",
        "official_url": "https://www.nsfsport.com/certified-products/",
        "lookup_method": "Certification Directory Lookup",
        "status": "CONFIRMED",
        "trust_rationale": "Leading independent testing program screening sports supplements for 290+ banned athletic substances and contaminants.",
        "known_limitations": "Certification applies only to specific tested product lots and registered formulations, not automatically to all brand products."
    },
    {
        "code": "INFORMED_SPORT",
        "name": "Informed Sport / LGC",
        "category": "Banned Substance Testing Directory",
        "official_url": "https://sport.wetestyoutrust.com/certified-brands",
        "lookup_method": "Certified Brand & Batch Registry",
        "status": "CONFIRMED",
        "trust_rationale": "Global banned-substance testing program testing every single batch before release to market.",
        "known_limitations": "Applies strictly to listed certified brands and batches. Non-certified batches from the same brand are not covered."
    },
    {
        "code": "MANUFACTURER_PORTAL",
        "name": "Official Brand Authenticate Ledger",
        "category": "Manufacturer Direct Verification",
        "official_url": "https://www.optimumnutrition.com/en-us/authentication",
        "lookup_method": "Authorized Production Batch Matching",
        "status": "CONFIRMED",
        "trust_rationale": "Direct manufacturer batch databases (e.g. Glanbia/Optimum Nutrition, Dymatize, Nutrabolt).",
        "known_limitations": "Dependent on manufacturer ledger freshness. Batch lookup confirms production existence, but physical packaging must also match."
    },
    {
        "code": "FDA_SAFETY_ALERT",
        "name": "FDA Dietary Supplement Safety & Recall Index",
        "category": "Regulatory Safety Database",
        "official_url": "https://www.fda.gov/consumers/health-fraud-scams/health-fraud-product-database",
        "lookup_method": "Health Fraud & Recall Cross-Reference",
        "status": "CONFIRMED",
        "trust_rationale": "U.S. Food & Drug Administration official alerts for tainted supplements, undeclared ingredients, and recalls.",
        "known_limitations": "Safety notification source only. The absence of an FDA warning does NOT prove that a supplement is genuine or safe."
    }
]

class SourceRegistryService:
    @staticmethod
    async def initialize_sources(db: AsyncSession):
        """Initializes default trusted sources if not present."""
        for src in INITIAL_TRUSTED_SOURCES:
            res = await db.execute(select(TrustedSource).where(TrustedSource.code == src["code"]))
            if not res.scalars().first():
                new_src = TrustedSource(
                    code=src["code"],
                    name=src["name"],
                    category=src["category"],
                    official_url=src["official_url"],
                    lookup_method=src["lookup_method"],
                    status=src["status"],
                    trust_rationale=src["trust_rationale"],
                    known_limitations=src["known_limitations"],
                    last_checked=datetime.now(timezone.utc),
                    last_synced=datetime.now(timezone.utc)
                )
                db.add(new_src)
        await db.commit()

    @staticmethod
    async def get_all_sources(db: AsyncSession) -> List[TrustedSource]:
        res = await db.execute(select(TrustedSource))
        return res.scalars().all()

    @staticmethod
    async def get_source_by_code(db: AsyncSession, code: str) -> Optional[TrustedSource]:
        res = await db.execute(select(TrustedSource).where(TrustedSource.code == code))
        return res.scalars().first()
