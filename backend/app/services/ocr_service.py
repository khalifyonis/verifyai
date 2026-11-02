import re
from typing import Dict, Any, Optional
from datetime import datetime

class OCRService:
    @staticmethod
    def extract_dates_and_batches(text: str) -> Dict[str, Any]:
        """Extracts batch numbers, expiry dates, and manufacturing dates from extracted OCR text."""
        result = {
            "batch_number": None,
            "expiry_date": None,
            "manufacturing_date": None,
            "raw_text": text
        }
        if not text:
            return result

        normalized = text.upper()

        # Batch / Lot regex patterns
        # e.g., BATCH: B2024-09, LOT NO: A9812, BN: 84920, BATCH #9821
        batch_patterns = [
            r"(?:BATCH|LOT|BN|B\.NO|B/NO|BATCH\s*NO)[\s.:#-]+([A-Z0-9/-]{3,20})",
            r"\bLOT\s*([A-Z0-9]{4,15})\b",
            r"\bBN[:\s]*([A-Z0-9]{4,15})\b"
        ]
        for pattern in batch_patterns:
            match = re.search(pattern, normalized)
            if match:
                result["batch_number"] = match.group(1).strip()
                break

        # Expiry date patterns
        # e.g., EXP: 12/2027, EXP DATE 2026-11-30, BEST BEFORE 09/26, EXP: 15 OCT 2028
        exp_patterns = [
            r"(?:EXP|EXPIRY|EXP\.?\s*DATE|BEST\s*BEFORE|USE\s*BY|BB)[\s.:#-]+(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})",
            r"(?:EXP|EXPIRY|EXP\.?\s*DATE|BEST\s*BEFORE|USE\s*BY|BB)[\s.:#-]+(\d{1,2}[/-]\d{2,4})",
            r"(?:EXP|EXPIRY)[\s.:#-]+(\d{4}[/-]\d{1,2}[/-]\d{1,2})",
            r"(?:EXP|EXPIRY)[\s.:#-]+(\d{1,2}\s+(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)\w*\s+\d{2,4})"
        ]
        for pattern in exp_patterns:
            match = re.search(pattern, normalized)
            if match:
                result["expiry_date"] = match.group(1).strip()
                break

        # Manufacturing date patterns
        mfg_patterns = [
            r"(?:MFG|MFD|MANUFACTURED|PROD|PKD)[\s.:#-]+(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})",
            r"(?:MFG|MFD|MANUFACTURED|PROD|PKD)[\s.:#-]+(\d{1,2}[/-]\d{2,4})",
            r"(?:MFG|MFD)[\s.:#-]+(\d{4}[/-]\d{1,2}[/-]\d{1,2})"
        ]
        for pattern in mfg_patterns:
            match = re.search(pattern, normalized)
            if match:
                result["manufacturing_date"] = match.group(1).strip()
                break

        return result

    @staticmethod
    def is_date_expired(date_str: str) -> Optional[bool]:
        """Checks if a string date is in the past."""
        if not date_str:
            return None
        
        now = datetime.now()
        clean = date_str.strip().replace(".", "/")
        
        # Try formats: MM/YYYY or MM/YY
        if re.match(r"^\d{1,2}/\d{2,4}$", clean):
            parts = clean.split("/")
            m = int(parts[0])
            y = int(parts[1])
            if y < 100:
                y += 2000
            # Expired if end of that month is in the past
            if y < now.year or (y == now.year and m < now.month):
                return True
            return False

        # Try format: DD/MM/YYYY
        if re.match(r"^\d{1,2}/\d{1,2}/\d{2,4}$", clean):
            parts = clean.split("/")
            y = int(parts[2])
            if y < 100:
                y += 2000
            m = int(parts[1])
            d = int(parts[0])
            try:
                dt = datetime(y, m, d)
                return dt < now
            except ValueError:
                pass

        # Try YYYY-MM-DD
        if re.match(r"^\d{4}-\d{1,2}-\d{1,2}$", clean):
            try:
                dt = datetime.strptime(clean, "%Y-%m-%d")
                return dt < now
            except ValueError:
                pass

        return None
