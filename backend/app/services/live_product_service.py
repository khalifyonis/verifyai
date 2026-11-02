import re
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
import httpx

# GS1 Country / Issuing Agency Prefix Map
GS1_PREFIX_MAP = {
    "00": "GS1 US & Canada",
    "01": "GS1 US & Canada",
    "02": "GS1 US & Canada",
    "03": "GS1 US & Canada",
    "04": "GS1 US & Canada",
    "05": "GS1 US & Canada",
    "06": "GS1 US & Canada",
    "07": "GS1 US & Canada",
    "08": "GS1 US & Canada",
    "09": "GS1 US & Canada",
    "10": "GS1 US & Canada",
    "11": "GS1 US & Canada",
    "12": "GS1 US & Canada",
    "13": "GS1 US & Canada",
    "30": "GS1 France",
    "31": "GS1 France",
    "32": "GS1 France",
    "33": "GS1 France",
    "34": "GS1 France",
    "35": "GS1 France",
    "36": "GS1 France",
    "37": "GS1 France",
    "40": "GS1 Germany",
    "41": "GS1 Germany",
    "42": "GS1 Germany",
    "43": "GS1 Germany",
    "44": "GS1 Germany",
    "45": "GS1 Japan",
    "49": "GS1 Japan",
    "46": "GS1 Russia",
    "471": "GS1 Taiwan",
    "489": "GS1 Hong Kong",
    "50": "GS1 United Kingdom",
    "539": "GS1 Ireland",
    "54": "GS1 Belgium & Luxembourg",
    "57": "GS1 Denmark",
    "600": "GS1 South Africa",
    "601": "GS1 South Africa",
    "619": "GS1 Tunisia",
    "628": "GS1 Saudi Arabia",
    "629": "GS1 United Arab Emirates",
    "690": "GS1 China",
    "691": "GS1 China",
    "692": "GS1 China",
    "693": "GS1 China",
    "694": "GS1 China",
    "695": "GS1 China",
    "70": "GS1 Norway",
    "73": "GS1 Sweden",
    "76": "GS1 Switzerland",
    "80": "GS1 Italy",
    "81": "GS1 Italy",
    "82": "GS1 Italy",
    "83": "GS1 Italy",
    "84": "GS1 Spain",
    "87": "GS1 Netherlands",
    "880": "GS1 South Korea",
    "885": "GS1 Thailand",
    "890": "GS1 India",
    "90": "GS1 Austria",
    "91": "GS1 Austria",
    "93": "GS1 Australia",
    "94": "GS1 New Zealand"
}

class LiveProductService:
    @staticmethod
    def get_gs1_issuing_country(barcode: str) -> Optional[str]:
        """Resolves the issuing national GS1 organization based on prefix."""
        digits = re.sub(r"\D", "", barcode or "")
        if not digits:
            return None
        # Normalize to 13 digits if 12 (UPC-A)
        if len(digits) == 12:
            digits = "0" + digits
        
        # Check 3-digit prefix then 2-digit prefix
        if len(digits) >= 3 and digits[:3] in GS1_PREFIX_MAP:
            return GS1_PREFIX_MAP[digits[:3]]
        if len(digits) >= 2 and digits[:2] in GS1_PREFIX_MAP:
            return GS1_PREFIX_MAP[digits[:2]]
        return "International GS1 Member Organization"

    @staticmethod
    async def fetch_open_food_facts(barcode: str) -> Optional[Dict[str, Any]]:
        """
        Queries the free public Open Food Facts global database for real product details.
        Covers millions of food, beverage, grocery, and supplement products worldwide.
        """
        digits = re.sub(r"\D", "", barcode or "")
        if not digits:
            return None

        # Try standard code, and also without leading zero if 13 digits
        codes_to_try = [digits]
        if len(digits) == 13 and digits.startswith("0"):
            codes_to_try.append(digits[1:])
        elif len(digits) == 12:
            codes_to_try.append("0" + digits)

        headers = {
            "User-Agent": "VerifyAI-AntiCounterfeit-Inspector/1.0 (https://verifyai.org; contact@verifyai.org)"
        }

        async with httpx.AsyncClient(timeout=6.0, headers=headers) as client:
            for code in codes_to_try:
                try:
                    url = f"https://world.openfoodfacts.org/api/v2/product/{code}.json"
                    resp = await client.get(url)
                    if resp.status_code == 200:
                        data = resp.json()
                        if data.get("status") == 1 and "product" in data:
                            p = data["product"]
                            product_name = p.get("product_name") or p.get("product_name_en") or p.get("generic_name") or "Verified Consumer Product"
                            brand = p.get("brands") or p.get("brands_imported") or "International Brand"
                            
                            # Clean brand if comma-separated
                            if "," in brand:
                                brand = brand.split(",")[0].strip()

                            image_url = p.get("image_front_url") or p.get("image_url") or p.get("image_small_url")
                            categories = p.get("categories") or p.get("categories_hierarchy", [])
                            packaging = p.get("packaging") or p.get("packaging_text") or "Standard sealed consumer packaging"
                            ingredients = p.get("ingredients_text") or p.get("ingredients_text_en")
                            countries = p.get("countries") or "Global"
                            labels = p.get("labels_tags", [])
                            labels_clean = [l.replace("en:", "").title() for l in labels[:6]]

                            return {
                                "source": "Open Food Facts Global Public Registry",
                                "source_url": f"https://world.openfoodfacts.org/product/{code}",
                                "barcode": digits,
                                "name": product_name.strip(),
                                "brand": brand.strip(),
                                "category": categories[0] if isinstance(categories, list) and categories else (str(categories).split(",")[0] if categories else "Consumer Goods"),
                                "image_url": image_url,
                                "packaging": packaging,
                                "ingredients": ingredients,
                                "countries": countries,
                                "certifications": labels_clean,
                                "raw_product": p
                            }
                except Exception:
                    continue

        return None

    @staticmethod
    async def check_fda_recalls(search_term: str) -> List[Dict[str, Any]]:
        """
        Queries openFDA Regulatory Enforcement and Recalls API for safety alerts.
        """
        if not search_term or len(search_term.strip()) < 3:
            return []

        clean_term = re.sub(r'[^\w\s]', '', search_term).strip()
        recalls = []

        async with httpx.AsyncClient(timeout=5.0) as client:
            # Check Food / Dietary recalls
            try:
                food_url = f'https://api.fda.gov/food/enforcement.json?search=product_description:"{clean_term}"&limit=2'
                r = await client.get(food_url)
                if r.status_code == 200:
                    data = r.json()
                    for item in data.get("results", []):
                        recalls.append({
                            "agency": "US Food & Drug Administration (FDA)",
                            "type": "Food / Dietary Recall",
                            "classification": item.get("classification", "Class II"),
                            "reason": item.get("reason_for_recall", "Unspecified safety precaution"),
                            "recall_number": item.get("recall_number"),
                            "status": item.get("status", "Ongoing"),
                            "date": item.get("recall_initiation_date"),
                            "source_url": "https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts"
                        })
            except Exception:
                pass

        return recalls
