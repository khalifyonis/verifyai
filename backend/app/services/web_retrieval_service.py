import re
import json
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
import httpx
from app.core.config import settings

class WebRetrievalService:
    @staticmethod
    def is_safe_url(url: str) -> bool:
        """Validates that a URL is a legitimate public web address and prevents SSRF attacks."""
        if not url:
            return False
        clean = url.lower().strip()
        if not (clean.startswith("https://") or clean.startswith("http://")):
            return False
        # Block internal addresses, loopbacks, and link-local
        blocked_patterns = [
            r"://localhost",
            r"://127\.",
            r"://10\.",
            r"://172\.(1[6-9]|2[0-9]|3[0-1])\.",
            r"://192\.168\.",
            r"://169\.254\.",
            r"://0\.0\.0\.0",
            r"://\[::1\]"
        ]
        for pattern in blocked_patterns:
            if re.search(pattern, clean):
                return False
        return True

    @staticmethod
    async def generate_forensic_evaluation(
        product_name: str,
        brand: str,
        barcode: Optional[str] = None,
        batch_number: Optional[str] = None,
        expiry_date: Optional[str] = None,
        vision_data: Optional[Dict[str, Any]] = None,
        registry_data: Optional[Dict[str, Any]] = None,
        fda_recalls: Optional[List[Dict[str, Any]]] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Synthesizes multimodal evidence, global registries, and regulatory alerts
        using Gemini to produce an authoritative, convincing anti-counterfeit forensic evaluation.
        """
        if not settings.GEMINI_API_KEY:
            return None

        # Build comprehensive context for Gemini
        vision_notes = vision_data.get("notes", "No visual packaging data") if vision_data else "No visual packaging data"
        seal_status = "Intact" if (vision_data and vision_data.get("seal_intact")) else ("Not Detected / Missing" if vision_data else "Not Provided")
        print_quality = vision_data.get("label_quality", "Unknown") if vision_data else "Not Assessed"
        anomalies = vision_data.get("anomalies_detected", []) if vision_data else []

        prompt = (
            f"You are a World-Class Forensic Anti-Counterfeit and Product Authentication Specialist.\n"
            f"A consumer has submitted a physical product for authentication with the following parameters:\n\n"
            f"- Brand Name: {brand}\n"
            f"- Product Title: {product_name}\n"
            f"- Barcode / GTIN: {barcode or 'Not provided'}\n"
            f"- Batch / Lot Number: {batch_number or 'Not provided'}\n"
            f"- Expiry Date: {expiry_date or 'Not provided'}\n"
            f"- Physical Security Seal: {seal_status}\n"
            f"- Packaging Label Quality: {print_quality}\n"
            f"- Visual Inspection Notes: {vision_notes}\n"
            f"- Detected Anomalies: {', '.join(anomalies) if anomalies else 'None'}\n"
            f"- Global Registry Status: {'Verified in Public Database (' + registry_data.get('source', '') + ')' if registry_data else 'Unregistered in local catalog'}\n"
            f"- Regulatory Recall Alerts: {'Active Alert: ' + fda_recalls[0].get('reason', '') if fda_recalls else 'No active FDA recalls found'}\n\n"
            f"INSTRUCTIONS:\n"
            f"Perform an exhaustive forensic verification and return a STRICT JSON response.\n"
            f"The 'reasoning' field MUST BE THOROUGH AND CONVINCING (2-3 detailed paragraphs) explaining:\n"
            f"1) Barcode structure and international registry status.\n"
            f"2) Authentic manufacturer packaging hallmarks (security seals, typography, lot coding conventions).\n"
            f"3) Safety, recall, and regulatory status.\n"
            f"4) Definitive conclusion on whether the product is genuine, suspicious, or dangerous.\n\n"
            f"JSON FORMAT REQUIREMENTS:\n"
            f"{{\n"
            f'  "verdict": "VERIFIED" | "SUSPICIOUS" | "OFFICIAL_WARNING" | "NOT_VERIFIED",\n'
            f'  "verdict_title": "Concise professional title (e.g. Verified Genuine Global Product)",\n'
            f'  "confidence_score": 96.5,\n'
            f'  "reasoning": "Thorough, convincing 2-3 paragraph explanation...",\n'
            f'  "verified_facts": ["Fact 1", "Fact 2", "Fact 3"],\n'
            f'  "risk_signals": [{{"severity": "CRITICAL"|"HIGH"|"MEDIUM"|"LOW", "signal": "CODE", "description": "Details"}}],\n'
            f'  "evidence_sources": [{{"name": "Source Name", "url": "https://...", "claim": "What was verified"}}],\n'
            f'  "recommendation": "Clear actionable advice for the consumer.",\n'
            f'  "limitations": "Scientific limitations of packaging verification."\n'
            f"}}"
        )

        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"response_mime_type": "application/json"}
        }

        model = settings.GEMINI_MODEL or "gemini-3.5-flash"
        models_to_try = [model, "gemini-3.5-flash", "gemini-3.7-flash"]

        async with httpx.AsyncClient(timeout=25.0) as client:
            for m in models_to_try:
                try:
                    url = f"https://generativelanguage.googleapis.com/v1beta/models/{m}:generateContent?key={settings.GEMINI_API_KEY}"
                    resp = await client.post(url, json=payload)
                    if resp.status_code == 200:
                        data = resp.json()
                        candidates = data.get("candidates", [])
                        if candidates and "content" in candidates[0]:
                            text = candidates[0]["content"]["parts"][0]["text"]
                            parsed = json.loads(text)
                            return parsed
                except Exception as ex:
                    print(f"[WebRetrievalService] Gemini model {m} failed: {ex}")
                    continue

        return None
