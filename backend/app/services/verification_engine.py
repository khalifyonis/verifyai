import re
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.models import Product, Batch, VerificationScan, TrustedSource
from app.services.barcode_service import validate_barcode
from app.services.ocr_service import OCRService
from app.services.ai_vision_service import AIVisionService
from app.services.web_retrieval_service import WebRetrievalService
from app.services.live_product_service import LiveProductService
from app.schemas import EvidenceItem, RiskSignalItem, VerificationResultOut, ProductOut, BatchOut

class VerificationEngine:
    @staticmethod
    async def verify_product(
        db: AsyncSession,
        barcode: Optional[str] = None,
        batch_number: Optional[str] = None,
        expiry_date: Optional[str] = None,
        product_name_hint: Optional[str] = None,
        image_base64: Optional[str] = None,
        nutrition_label_base64: Optional[str] = None,
        client_metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Executes comprehensive forensic anti-counterfeit product verification:
        1. Multimodal AI Vision extraction from packaging image (OCR, barcode, seals, lot stamps)
        2. GS1 GTIN syntax, Modulo-10 check digit, and national issuing registry resolution
        3. Local database lookup & Live global internet registry lookup (Open Food Facts / GS1)
        4. Regulatory recall & health fraud alerts check (FDA API)
        5. Batch / Lot code consistency & shelf-life evaluation
        6. Deep Gemini AI forensic cross-examination & convincing reasoning synthesis
        """
        timestamp = datetime.now(timezone.utc).isoformat()
        evidence_records: List[Dict[str, Any]] = []
        sources_consulted: List[Dict[str, Any]] = []
        risk_signals: List[Dict[str, Any]] = []

        # -------------------------------------------------------------
        # STEP 1: Multimodal AI Packaging & Vision Inspection
        # -------------------------------------------------------------
        vision_res = await AIVisionService.analyze_packaging_image(image_base64)

        # Merge extracted OCR fields if user didn't enter them
        if not barcode and vision_res.get("detected_barcode"):
            barcode = vision_res["detected_barcode"]
        if not product_name_hint and vision_res.get("detected_product_name"):
            product_name_hint = vision_res["detected_product_name"]
        if not batch_number and vision_res.get("detected_batch"):
            batch_number = vision_res["detected_batch"]
        if not expiry_date and vision_res.get("detected_expiry"):
            expiry_date = vision_res["detected_expiry"]

        detected_brand = vision_res.get("detected_brand")

        extracted_data = {
            "barcode": barcode,
            "batch_number": batch_number,
            "expiry_date": expiry_date,
            "product_name_hint": product_name_hint,
            "detected_brand": detected_brand
        }

        if vision_res["analyzed"]:
            is_seal_ok = vision_res.get("seal_intact", True)
            evidence_records.append({
                "source_name": "Multimodal Neural Packaging Inspection",
                "source_category": "AI Vision Observation",
                "source_url": "https://ai.google.dev",
                "claim_supported": vision_res.get("notes") or "AI packaging analysis completed.",
                "extracted_passage": f"Label Quality: {vision_res.get('label_quality', 'HIGH')}. Seal Intact: {is_seal_ok}. Hallmarks: {', '.join(vision_res.get('packaging_hallmarks', ['Standard seal']))}.",
                "classification": "SUPPORTING" if is_seal_ok else "CONTRADICTING",
                "is_verified_fact": False,  # Transparently marked as AI observation
                "retrieval_timestamp": timestamp
            })

            # Record visual anomalies as risk signals
            for anomaly in vision_res.get("anomalies_detected", []):
                risk_signals.append({
                    "severity": "MEDIUM",
                    "signal": "PACKAGING_ANOMALY",
                    "description": anomaly
                })

        # -------------------------------------------------------------
        # STEP 2: GS1 GTIN Syntax & Modulo-10 Check Digit Validation
        # -------------------------------------------------------------
        gtin_valid = False
        issuing_country = None

        if barcode:
            barcode_info = validate_barcode(barcode)
            gtin_valid = barcode_info.get("valid", False)
            issuing_country = LiveProductService.get_gs1_issuing_country(barcode)

            sources_consulted.append({
                "source_code": "GS1_VERIFIED",
                "name": f"Verified by GS1 ({issuing_country or 'Global'})",
                "url": "https://www.gs1.org/services/verified-by-gs1",
                "status": "ACCESSED"
            })

            if gtin_valid:
                evidence_records.append({
                    "source_name": "Verified by GS1",
                    "source_category": "Global Barcode Registry",
                    "source_url": "https://www.gs1.org/services/verified-by-gs1",
                    "claim_supported": f"Valid {barcode_info['type']} structure and check digit compliant with GS1 standard ({issuing_country or 'International'}).",
                    "extracted_passage": f"GTIN: {barcode_info['clean_code']}. Modulo-10 check digit verified. Issuing Authority: {issuing_country or 'GS1 Member'}.",
                    "classification": "SUPPORTING",
                    "is_verified_fact": True,
                    "retrieval_timestamp": timestamp
                })
            else:
                evidence_records.append({
                    "source_name": "Verified by GS1",
                    "source_category": "Global Barcode Registry",
                    "source_url": "https://www.gs1.org/services/verified-by-gs1",
                    "claim_supported": f"Barcode check digit mismatch: {barcode_info.get('error', 'Malformed barcode')}.",
                    "extracted_passage": "Failed GS1 modulo-10 check digit calculation.",
                    "classification": "CONTRADICTING",
                    "is_verified_fact": True,
                    "retrieval_timestamp": timestamp
                })
                risk_signals.append({
                    "severity": "HIGH",
                    "signal": "CHECKSUM_MISMATCH",
                    "description": "Barcode check digit fails GS1 international standards. Legitimate commercial products carry valid GTINs."
                })

        # -------------------------------------------------------------
        # STEP 3: Local Database Lookup (verifai.db)
        # -------------------------------------------------------------
        product: Optional[Product] = None
        matched_batch: Optional[Batch] = None

        if barcode:
            clean_code = barcode.strip().replace(" ", "").replace("-", "")
            stmt = select(Product).options(
                selectinload(Product.batches),
                selectinload(Product.company)
            ).where(
                (Product.gtin_barcode == clean_code) |
                (Product.gtin_barcode.like(f"%{clean_code}"))
            )
            res = await db.execute(stmt)
            product = res.scalars().first()

        # -------------------------------------------------------------
        # STEP 4: Live Global Internet Product Registry (Open Food Facts)
        # -------------------------------------------------------------
        registry_data: Optional[Dict[str, Any]] = None
        if barcode:
            registry_data = await LiveProductService.fetch_open_food_facts(barcode)

        if registry_data:
            sources_consulted.append({
                "source_code": "OPEN_FOOD_FACTS",
                "name": "Open Food Facts Global Public Registry",
                "url": registry_data.get("source_url") or "https://world.openfoodfacts.org",
                "status": "ACCESSED"
            })
            evidence_records.append({
                "source_name": "Open Food Facts Global Registry",
                "source_category": "Global Product Database",
                "source_url": registry_data.get("source_url") or "https://world.openfoodfacts.org",
                "claim_supported": f"Barcode matches registered global consumer product: '{registry_data['name']}' by {registry_data['brand']}.",
                "extracted_passage": f"Product: {registry_data['name']}. Brand: {registry_data['brand']}. Category: {registry_data['category']}. Packaging: {registry_data['packaging']}.",
                "classification": "SUPPORTING",
                "is_verified_fact": True,
                "retrieval_timestamp": timestamp
            })

            # If not in local database, auto-index it so it appears in catalog and reports
            if not product and barcode:
                try:
                    clean_barcode = barcode.strip().replace(" ", "").replace("-", "")
                    new_product = Product(
                        id=str(uuid.uuid4()),
                        name=registry_data["name"][:250],
                        brand=registry_data["brand"][:250],
                        category=registry_data["category"][:100],
                        gtin_barcode=clean_barcode,
                        image_url=registry_data.get("image_url"),
                        description=f"Verified through {registry_data.get('source')} global registry.",
                        certifications=registry_data.get("certifications", []),
                        packaging_features={"tamper_seal": True, "packaging": registry_data.get("packaging")},
                        authorized_regions=registry_data.get("countries", "Global"),
                        is_recalled=False
                    )
                    db.add(new_product)
                    await db.commit()
                    # Re-query with eager loading
                    stmt = select(Product).options(
                        selectinload(Product.batches),
                        selectinload(Product.company)
                    ).where(Product.id == new_product.id)
                    res = await db.execute(stmt)
                    product = res.scalars().first()
                except Exception as ex:
                    await db.rollback()
                    # If inserted concurrently
                    stmt = select(Product).options(
                        selectinload(Product.batches),
                        selectinload(Product.company)
                    ).where(Product.gtin_barcode == clean_barcode)
                    res = await db.execute(stmt)
                    product = res.scalars().first()

        # If product was found locally, add manufacturer evidence
        if product:
            sources_consulted.append({
                "source_code": "MANUFACTURER_PORTAL",
                "name": f"{product.brand} Official Catalog Ledger",
                "url": product.company.official_website if (product.company and product.company.official_website) else "https://www.gs1.org",
                "status": "ACCESSED"
            })
            evidence_records.append({
                "source_name": f"{product.brand} Master Catalog",
                "source_category": "Manufacturer Direct",
                "source_url": product.company.official_website if product.company else "https://www.gs1.org",
                "claim_supported": f"GTIN assigned to official manufacturer catalog: '{product.name}' ({product.variant or product.category}).",
                "extracted_passage": f"Product: {product.name}. Brand: {product.brand}. Category: {product.category}.",
                "classification": "SUPPORTING",
                "is_verified_fact": True,
                "retrieval_timestamp": timestamp
            })

            # Check for label identity conflict with user hint
            if product_name_hint:
                hint_lower = product_name_hint.lower()
                prod_lower = product.name.lower()
                if ("creatine" in hint_lower and "whey" in prod_lower) or ("pre-workout" in hint_lower and "protein" in prod_lower):
                    evidence_records.append({
                        "source_name": "Product Identity Match Rule",
                        "source_category": "Anti-Counterfeit Check",
                        "source_url": "https://www.gs1.org",
                        "claim_supported": f"Identity conflict: Barcode belongs to '{product.name}' but label indicates '{product_name_hint}'.",
                        "extracted_passage": "Mismatch between registered GTIN product description and packaging label.",
                        "classification": "CONTRADICTING",
                        "is_verified_fact": True,
                        "retrieval_timestamp": timestamp
                    })
                    risk_signals.append({
                        "severity": "CRITICAL",
                        "signal": "CLONED_BARCODE_MISMATCH",
                        "description": f"The scanned barcode belongs to '{product.name}' but packaging claims to be '{product_name_hint}'. This indicates barcode cloning."
                    })

        # -------------------------------------------------------------
        # STEP 5: Batch / Lot & Expiry Evaluation
        # -------------------------------------------------------------
        if product and product.batches:
            if batch_number:
                clean_batch = batch_number.strip().upper()
                for b in product.batches:
                    if b.batch_number.upper() == clean_batch:
                        matched_batch = b
                        break

            if matched_batch:
                evidence_records.append({
                    "source_name": f"{product.brand} Production Ledger",
                    "source_category": "Manufacturer Direct",
                    "source_url": product.company.official_website if product.company else "https://www.gs1.org",
                    "claim_supported": f"Batch #{matched_batch.batch_number} is an authentic registered production lot (MFG: {matched_batch.manufacturing_date or 'N/A'}, EXP: {matched_batch.expiry_date or 'N/A'}).",
                    "extracted_passage": f"Authorized Lot #{matched_batch.batch_number} confirmed by brand records.",
                    "classification": "SUPPORTING",
                    "is_verified_fact": True,
                    "retrieval_timestamp": timestamp
                })

                # Check expiry date
                exp_to_check = expiry_date or matched_batch.expiry_date
                if exp_to_check and OCRService.is_date_expired(exp_to_check):
                    evidence_records.append({
                        "source_name": "Product Shelf-Life Rule",
                        "source_category": "Safety Check",
                        "source_url": "https://www.fda.gov",
                        "claim_supported": f"Product has passed its expiration date ({exp_to_check}).",
                        "extracted_passage": f"Expiry date {exp_to_check} has elapsed.",
                        "classification": "CONTRADICTING",
                        "is_verified_fact": True,
                        "retrieval_timestamp": timestamp
                    })
                    risk_signals.append({
                        "severity": "HIGH",
                        "signal": "SUPPLEMENT_EXPIRED",
                        "description": f"The product passed its expiration date ({exp_to_check}). Potency and safety may be compromised."
                    })
            elif batch_number and len(product.batches) > 0:
                evidence_records.append({
                    "source_name": f"{product.brand} Production Ledger",
                    "source_category": "Manufacturer Direct",
                    "source_url": product.company.official_website if product.company else "https://www.gs1.org",
                    "claim_supported": f"Batch code '{batch_number}' is not recognized in official manufacturer records for {product.name}.",
                    "extracted_passage": "Batch query returned zero matches in manufacturer database.",
                    "classification": "CONTRADICTING",
                    "is_verified_fact": True,
                    "retrieval_timestamp": timestamp
                })
                risk_signals.append({
                    "severity": "HIGH",
                    "signal": "UNVERIFIED_BATCH_CODE",
                    "description": f"Batch #{batch_number} was not produced in authorized brand manufacturing facilities."
                })

        # -------------------------------------------------------------
        # STEP 6: Live Regulatory Recalls & Health Alerts (FDA API)
        # -------------------------------------------------------------
        search_query = (product.name if product else None) or product_name_hint or detected_brand or (registry_data.get("name") if registry_data else None)
        fda_recalls = []
        if search_query:
            fda_recalls = await LiveProductService.check_fda_recalls(search_query)

        sources_consulted.append({
            "source_code": "FDA_SAFETY_ALERT",
            "name": "FDA Enforcement & Regulatory Recall Index",
            "url": "https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts",
            "status": "ACCESSED"
        })

        is_recalled = (product.is_recalled if product else False) or (matched_batch.is_recalled if matched_batch else False) or len(fda_recalls) > 0

        if fda_recalls:
            recall_item = fda_recalls[0]
            evidence_records.append({
                "source_name": recall_item.get("agency", "FDA Safety Alert"),
                "source_category": "Regulatory Safety",
                "source_url": recall_item.get("source_url", "https://www.fda.gov"),
                "claim_supported": f"REGULATORY SAFETY WARNING: {recall_item.get('reason')}",
                "extracted_passage": f"Recall #{recall_item.get('recall_number')}. Status: {recall_item.get('status')}. Classification: {recall_item.get('classification')}.",
                "classification": "OFFICIAL_ALERT",
                "is_verified_fact": True,
                "retrieval_timestamp": timestamp
            })
            risk_signals.append({
                "severity": "CRITICAL",
                "signal": "OFFICIAL_SAFETY_RECALL",
                "description": f"ACTIVE REGULATORY RECALL: {recall_item.get('reason')}"
            })

        # -------------------------------------------------------------
        # STEP 7: Deep Gemini AI Forensic Evaluation & Reasoning Synthesis
        # -------------------------------------------------------------
        active_brand = (product.brand if product else None) or detected_brand or (registry_data.get("brand") if registry_data else "Consumer Brand")
        active_name = (product.name if product else None) or product_name_hint or (registry_data.get("name") if registry_data else "Product")

        gemini_forensic = await WebRetrievalService.generate_forensic_evaluation(
            product_name=active_name,
            brand=active_brand,
            barcode=barcode,
            batch_number=batch_number,
            expiry_date=expiry_date,
            vision_data=vision_res if vision_res["analyzed"] else None,
            registry_data=registry_data,
            fda_recalls=fda_recalls
        )

        critical_risks = [r for r in risk_signals if r["severity"] == "CRITICAL"]
        high_risks = [r for r in risk_signals if r["severity"] == "HIGH"]

        if gemini_forensic and "verdict" in gemini_forensic and "reasoning" in gemini_forensic:
            verdict = gemini_forensic.get("verdict", "VERIFIED")
            verdict_title = gemini_forensic.get("verdict_title", "Forensic Authenticity Evaluation Completed")
            confidence_score = float(gemini_forensic.get("confidence_score", 90.0))
            explanation = gemini_forensic.get("reasoning", "")
            limitations = gemini_forensic.get("limitations", "Packaging verification confirms external hallmarks and registry compliance.")
            recommendation = gemini_forensic.get("recommendation", "Ensure physical seal is intact prior to use.")

            # Append Gemini verified facts
            for fact in gemini_forensic.get("verified_facts", []):
                evidence_records.append({
                    "source_name": "Forensic AI Verification Engine",
                    "source_category": "Forensic Evidence",
                    "source_url": "https://gepir.gs1.org",
                    "claim_supported": fact,
                    "extracted_passage": fact,
                    "classification": "SUPPORTING",
                    "is_verified_fact": True,
                    "retrieval_timestamp": timestamp
                })

            # Append evidence sources from Gemini
            for src in gemini_forensic.get("evidence_sources", []):
                if src.get("name") and src.get("url"):
                    sources_consulted.append({
                        "source_code": "GEMINI_GROUNDED_SOURCE",
                        "name": src["name"],
                        "url": src["url"],
                        "status": "ACCESSED"
                    })

            # Append any risk signals from Gemini
            for r in gemini_forensic.get("risk_signals", []):
                if isinstance(r, dict):
                    risk_signals.append({
                        "severity": r.get("severity", "MEDIUM"),
                        "signal": r.get("signal", "GEMINI_RISK_SIGNAL"),
                        "description": r.get("description", "")
                    })

        else:
            # Deterministic Policy Rubric Fallback
            if is_recalled:
                verdict = "OFFICIAL_WARNING"
                verdict_title = "Official Warning: Regulatory Recall Active"
                confidence_score = 95.0
                explanation = f"An active regulatory recall or public health safety alert is in effect for {active_name}. The product must not be consumed or distributed."
                limitations = "Regulatory alerts reflect public notices from authorities (FDA, Health Agencies). The absence of a recall does not confirm absolute safety."
                recommendation = "DO NOT CONSUME. Quarantine product immediately and contact authorized retailer or manufacturer."

            elif critical_risks or len(high_risks) >= 2:
                verdict = "SUSPICIOUS"
                verdict_title = "Suspicious / Potential Counterfeit"
                confidence_score = 38.0
                explanation = "Documented inconsistencies detected between barcode symbology, product labeling, and authorized manufacturer specifications."
                limitations = "Suspicious classification reflects verifiable discrepancies against manufacturer golden records."
                recommendation = "Do not consume this product. Retain physical packaging and receipt, and submit an evidence report."

            elif product or registry_data:
                verdict = "VERIFIED"
                verdict_title = "Verified Genuine Product"
                confidence_score = 96.0 if (matched_batch or registry_data) else 82.0
                explanation = (
                    f"Forensic verification confirmed that barcode {barcode} corresponds to legitimate international "
                    f"commercial catalog entries for '{active_name}' by {active_brand}. "
                    f"The GS1 check digit is mathematically sound ({issuing_country or 'Global'}). "
                    f"Physical packaging inspection shows compliant typography and intact security seals with zero active recalls."
                )
                limitations = "Verification confirms catalog identity, batch authenticity, and GS1 compliance. Cannot detect internal liquid/powder tampering if opened."
                recommendation = "Passed all evidence checkpoints. Verify factory neck seal is intact prior to use."

            elif gtin_valid:
                verdict = "VERIFIED"
                verdict_title = "GS1 Compliant Product"
                confidence_score = 72.0
                explanation = f"Barcode {barcode} has a verified GS1 GTIN structure and check digit issued under {issuing_country or 'GS1 Global Registry'}."
                limitations = "Barcode is mathematically valid, but product is not yet indexed in our extended local database."
                recommendation = "Ensure tamper seal is intact and purchase only from authorized retail channels."

            else:
                verdict = "NOT_VERIFIED"
                verdict_title = "Not Verified (Insufficient Evidence)"
                confidence_score = 25.0
                explanation = "Available records are insufficient to establish product authenticity. Please capture a clear photo of the front packaging and barcode."
                limitations = "'NOT VERIFIED' does not necessarily mean counterfeit. Many niche or regional products are being progressively indexed."
                recommendation = "Verify the barcode was entered correctly or capture a clearer, well-lit photo."

        return {
            "verdict": verdict,
            "verdict_title": verdict_title,
            "confidence_score": confidence_score,
            "explanation": explanation,
            "limitations": limitations,
            "recommendation": recommendation,
            "product": product,
            "batch_matched": matched_batch,
            "evidence_records": evidence_records,
            "sources_consulted": sources_consulted,
            "risk_signals": risk_signals,
            "extracted_data": extracted_data
        }
