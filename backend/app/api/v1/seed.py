import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete

from app.core.database import get_db
from app.core.security import get_password_hash
from app.models import User, Company, Product, Batch, VerificationScan, Report, TrustedSource
from app.services.source_registry import SourceRegistryService

router = APIRouter(prefix="/seed", tags=["Database Seeder"])

@router.post("")
async def seed_supplement_database(db: AsyncSession = Depends(get_db)):
    """Seeds authentic sports nutrition and fitness supplement verification catalog."""
    # Initialize trusted sources
    await SourceRegistryService.initialize_sources(db)

    # Clean existing demonstration products and re-seed with sports nutrition
    await db.execute(delete(Batch))
    await db.execute(delete(Product))
    await db.execute(delete(Company))
    await db.execute(delete(VerificationScan))

    # 1. Companies (Sports Nutrition Manufacturers)
    glanbia = Company(
        name="Glanbia Performance Nutrition (Optimum Nutrition)",
        contact_email="brandprotection@glanbia.com",
        country="United States / Ireland",
        official_website="https://www.optimumnutrition.com",
        verification_portal_url="https://www.optimumnutrition.com/en-us/authentication",
        is_verified=True
    )
    dymatize = Company(
        name="Dymatize Nutrition (BellRing Brands)",
        contact_email="quality@dymatize.com",
        country="United States",
        official_website="https://dymatize.com",
        verification_portal_url="https://dymatize.com/pages/quality",
        is_verified=True
    )
    nutrabolt = Company(
        name="Nutrabolt (Cellucor / C4)",
        contact_email="quality@nutrabolt.com",
        country="United States",
        official_website="https://cellucor.com",
        verification_portal_url="https://cellucor.com/pages/quality-assurance",
        is_verified=True
    )
    apex = Company(
        name="Apex Sports Labs (Flagged Entity)",
        contact_email="compliance@fda.gov",
        country="Unverified",
        official_website="https://www.fda.gov",
        is_verified=False
    )
    db.add_all([glanbia, dymatize, nutrabolt, apex])
    await db.flush()

    # 2. Authentic Fitness Supplement Products
    # Product 1: Optimum Nutrition Gold Standard 100% Whey (Double Rich Chocolate 5 lb)
    # GTIN: 0748927028669
    on_whey = Product(
        company_id=glanbia.id,
        name="Gold Standard 100% Whey Protein",
        brand="Optimum Nutrition",
        category="Whey Protein & Protein Powders",
        gtin_barcode="0748927028669",
        sku="ON-GSW-5LB-DRC",
        variant="Double Rich Chocolate, 5 lbs (2.27 kg)",
        flavor="Double Rich Chocolate",
        net_weight="5 lbs / 2.27 kg",
        serving_size="1 Rounded Scoop (30.4g)",
        form="Powder",
        description="The world's benchmark whey protein isolate. Features 24g protein, 5.5g naturally occurring BCAAs, and gluten-free formulation.",
        image_url="https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=600&auto=format&fit=crop&q=80",
        certifications=["Informed Choice Certified", "Informed Sport Tested"],
        active_ingredients=[
            {"name": "Whey Protein Isolate", "amount": "24g"},
            {"name": "BCAAs", "amount": "5.5g"},
            {"name": "Glutamine & Glutamic Acid", "amount": "4g"}
        ],
        packaging_features={
            "neck_shrink_band": "Golden Hologram ON Crest",
            "bottom_lot_stamping": "Two-line laser printed with blue expiry date",
            "tub_plastic": "High-density embossed base"
        },
        authorized_regions="Global"
    )
    db.add(on_whey)
    await db.flush()

    b1_whey = Batch(
        product_id=on_whey.id,
        batch_number="OPN-2026-W98",
        manufacturing_date="2024-06-10",
        expiry_date="2027-06-09",
        quantity=65000,
        notes="Authentic registered commercial production run. Passed LGC banned substance testing."
    )
    db.add(b1_whey)

    # Product 2: Optimum Nutrition Micronized Creatine Monohydrate (Unflavored 300g)
    # GTIN: 0748927024104
    on_creatine = Product(
        company_id=glanbia.id,
        name="Micronized Creatine Monohydrate",
        brand="Optimum Nutrition",
        category="Creatine Monohydrate",
        gtin_barcode="0748927024104",
        sku="ON-CREAT-300G",
        variant="Unflavored, 300g (60 Servings)",
        flavor="Unflavored",
        net_weight="300 grams",
        serving_size="1 Rounded Teaspoon (5g)",
        form="Powder",
        description="100% pure micronized creatine monohydrate to support muscle power, strength, and ATP regeneration.",
        image_url="https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=600&auto=format&fit=crop&q=80",
        certifications=["Creapure Quality Certified", "Informed Sport"],
        active_ingredients=[
            {"name": "Micronized Creatine Monohydrate", "amount": "5g"}
        ],
        packaging_features={
            "neck_shrink_band": "Matte black shrink sleeve with ON logo",
            "inner_seal": "Pressure-sensitive foil seal under cap"
        },
        authorized_regions="Global"
    )
    db.add(on_creatine)
    await db.flush()

    b1_creatine = Batch(
        product_id=on_creatine.id,
        batch_number="ONC-84920",
        manufacturing_date="2024-04-15",
        expiry_date="2027-04-14",
        quantity=40000,
        notes="Verified official batch. Retains pure white crystalline consistency."
    )
    db.add(b1_creatine)

    # Product 3: Dymatize ISO100 Hydrolyzed Whey Isolate (Gourmet Chocolate 5 lb)
    # GTIN: 0705016113204
    dym_iso = Product(
        company_id=dymatize.id,
        name="ISO100 Hydrolyzed 100% Whey Isolate",
        brand="Dymatize",
        category="Whey Protein & Protein Powders",
        gtin_barcode="0705016113204",
        sku="DYM-ISO100-5LB-GC",
        variant="Gourmet Chocolate, 5 lbs (2.3 kg)",
        flavor="Gourmet Chocolate",
        net_weight="5 lbs / 2.3 kg",
        serving_size="1 Scoop (32g)",
        form="Powder",
        description="Fast-absorbing hydrolyzed whey protein isolate engineered for athletic recovery with <1g sugar and <1g fat.",
        image_url="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80",
        certifications=["Informed Choice Certified"],
        active_ingredients=[
            {"name": "Hydrolyzed Whey Protein Isolate", "amount": "25g"},
            {"name": "BCAAs", "amount": "5.5g"}
        ],
        packaging_features={
            "tamper_neck_seal": "Black security tape with Dymatize monogram"
        },
        authorized_regions="Global"
    )
    db.add(dym_iso)
    await db.flush()

    b1_dym = Batch(
        product_id=dym_iso.id,
        batch_number="DYM-50113-X",
        manufacturing_date="2024-08-01",
        expiry_date="2026-08-01",
        quantity=35000
    )
    db.add(b1_dym)

    # Product 4: Cellucor C4 Original Pre-Workout (Icy Blue Razz 390g)
    # GTIN: 0842595101234
    c4 = Product(
        company_id=nutrabolt.id,
        name="C4 Original Explosive Pre-Workout",
        brand="Cellucor",
        category="Pre-Workout & Energy Formulations",
        gtin_barcode="0842595101234",
        sku="C4-ORIG-IBR-60S",
        variant="Icy Blue Razz, 390g (60 Servings)",
        flavor="Icy Blue Razz",
        net_weight="390 grams",
        serving_size="1 Level Scoop (6.5g)",
        form="Powder",
        description="Advanced pre-workout energy formula with CarnoSyn Beta-Alanine, Arginine AKG, and 150mg caffeine per serving.",
        image_url="https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80",
        certifications=["cGMP Certified Quality"],
        active_ingredients=[
            {"name": "CarnoSyn Beta-Alanine", "amount": "1.6g"},
            {"name": "Caffeine Anhydrous", "amount": "150mg"},
            {"name": "Creatine Nitrate (NO3-T)", "amount": "1g"}
        ],
        authorized_regions="Global"
    )
    db.add(c4)
    await db.flush()

    b1_c4 = Batch(
        product_id=c4.id,
        batch_number="C4-2025-BR",
        manufacturing_date="2024-05-15",
        expiry_date="2026-05-14",
        quantity=50000
    )
    db.add(b1_c4)

    # Product 5: FDA Flagged Dangerous Tainted Pre-Workout (Official Warning Scenario)
    # GTIN: 0619985432109
    tainted_pre = Product(
        company_id=apex.id,
        name="Apex Nitric Surge Hardcore Pre-Workout",
        brand="Apex Sports Labs",
        category="Pre-Workout & Energy Formulations",
        gtin_barcode="0619985432109",
        sku="APEX-SURGE-300G",
        variant="Extreme Fruit Punch 300g",
        description="Supposed dietary supplement flagged by public health authorities.",
        is_recalled=True,
        recall_reason="FDA PUBLIC SAFETY WARNING: Laboratory analysis confirmed the presence of undeclared 1,3-dimethylamylamine (DMAA/DMHA derivatives), a dangerous stimulant that can elevate blood pressure and cause cardiovascular emergencies.",
        recall_date="2025-11-14",
        recall_source_url="https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts"
    )
    db.add(tainted_pre)

    # 3. Initial Baseline Scan Logs
    scan1 = VerificationScan(
        barcode_scanned="0748927028669",
        batch_number_scanned="OPN-2026-W98",
        expiry_date_scanned="2027-06-09",
        product_name_hint="Gold Standard 100% Whey Double Rich Chocolate",
        verdict="VERIFIED",
        confidence_score=96.5,
        explanation="Sufficient positive evidence established: Valid GTIN, verified manufacturer product master 'Gold Standard 100% Whey Protein', authentic production batch #OPN-2026-W98, and valid shelf-life.",
        limitations="System verifies catalog identity, batch authenticity, and GS1 compliance. It cannot detect physical liquid/powder tampering if the factory tamper-evident seal was compromised after opening.",
        recommendation="Passed all evidence checkpoints. Ensure the physical neck seal is intact prior to consuming.",
        location_name="Fitness First Gym Retail Counter"
    )
    scan2 = VerificationScan(
        barcode_scanned="0619985432109",
        batch_number_scanned="APX-998",
        verdict="OFFICIAL_WARNING",
        confidence_score=95.0,
        explanation="An official safety recall or regulatory alert is active for this product (Apex Nitric Surge Hardcore Pre-Workout).",
        limitations="Regulatory alerts reflect public notices from authorities (FDA, Health Agencies). The absence of a recall does not confirm safety.",
        recommendation="DO NOT CONSUME. Quarantining product immediately and report to retail vendor or public health inspection authorities.",
        location_name="Downtown Nutrition Store"
    )
    scan3 = VerificationScan(
        barcode_scanned="0748927024104",
        batch_number_scanned="FAKE-LOT-999",
        product_name_hint="Optimum Nutrition Creatine",
        verdict="SUSPICIOUS",
        confidence_score=40.0,
        explanation="Documented inconsistencies detected: Batch #FAKE-LOT-999 is not recognized in official manufacturer records for Micronized Creatine Monohydrate.",
        limitations="Suspicious classification reflects verifiable discrepancies against manufacturer golden records. Further physical laboratory analysis may be requested.",
        recommendation="Do not consume this supplement. Retain the physical tub, receipt, and packaging, and submit an evidence report.",
        location_name="Market Stall #12"
    )
    db.add_all([scan1, scan2, scan3])

    # 4. User and Inspector Accounts
    res_admin = await db.execute(select(User).where(User.email == "admin@verifai.io"))
    if not res_admin.scalars().first():
        admin = User(
            email="admin@verifai.io",
            hashed_password=get_password_hash("verifai123"),
            full_name="Lead Inspector Hassan",
            role="admin",
            organization_name="Anti-Counterfeit Supplement Task Force"
        )
        db.add(admin)

    await db.commit()

    return {
        "status": "success",
        "message": "VERIFAI sports nutrition & supplement catalog seeded with real products, batches, and trusted sources."
    }
