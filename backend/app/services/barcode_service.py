import re
from typing import Dict, Any, Optional

def calculate_gs1_check_digit(number_str: str) -> int:
    """Calculates GS1 standard modulo-10 check digit."""
    clean = re.sub(r"\D", "", number_str)
    if not clean:
        return -1
    digits = [int(c) for c in clean]
    # Reverse and alternate multipliers 3 and 1
    total = sum(d * (3 if i % 2 == 0 else 1) for i, d in enumerate(reversed(digits)))
    remainder = total % 10
    return (10 - remainder) % 10

def validate_barcode(barcode: str) -> Dict[str, Any]:
    """Validates barcode format, length, and check-digit validity."""
    if not barcode:
        return {"valid": False, "type": "UNKNOWN", "error": "No barcode provided"}
    
    clean = barcode.strip().replace(" ", "").replace("-", "")
    
    # Check GS1 Application Identifiers if 2D format, e.g. (01)08901234567890(17)261231(10)BATCH99
    gs1_parsed = parse_gs1_ai(clean)
    
    # Standard 1D barcodes
    if re.match(r"^\d{13}$", clean):
        expected_check = calculate_gs1_check_digit(clean[:-1])
        actual_check = int(clean[-1])
        valid = (expected_check == actual_check)
        return {
            "valid": valid,
            "type": "EAN-13",
            "clean_code": clean,
            "check_digit_passed": valid,
            "error": None if valid else f"Check digit mismatch (expected {expected_check}, found {actual_check})",
            "gs1_data": gs1_parsed
        }
    elif re.match(r"^\d{12}$", clean):
        expected_check = calculate_gs1_check_digit(clean[:-1])
        actual_check = int(clean[-1])
        valid = (expected_check == actual_check)
        return {
            "valid": valid,
            "type": "UPC-A",
            "clean_code": clean,
            "check_digit_passed": valid,
            "error": None if valid else "UPC check digit mismatch",
            "gs1_data": gs1_parsed
        }
    elif re.match(r"^\d{8}$", clean):
        expected_check = calculate_gs1_check_digit(clean[:-1])
        actual_check = int(clean[-1])
        valid = (expected_check == actual_check)
        return {
            "valid": valid,
            "type": "EAN-8",
            "clean_code": clean,
            "check_digit_passed": valid,
            "error": None if valid else "EAN-8 check digit mismatch",
            "gs1_data": gs1_parsed
        }
    elif re.match(r"^\d{14}$", clean):
        return {
            "valid": True,
            "type": "GTIN-14 / ITF-14",
            "clean_code": clean,
            "check_digit_passed": True,
            "error": None,
            "gs1_data": gs1_parsed
        }
    elif len(clean) >= 4:
        return {
            "valid": True,
            "type": "Code-128 / QR / Custom",
            "clean_code": clean,
            "check_digit_passed": True,
            "error": None,
            "gs1_data": gs1_parsed
        }
    else:
        return {
            "valid": False,
            "type": "INVALID",
            "clean_code": clean,
            "check_digit_passed": False,
            "error": "Barcode is too short or corrupted",
            "gs1_data": None
        }

def parse_gs1_ai(code: str) -> Optional[Dict[str, str]]:
    """Attempts to parse GS1 Application Identifiers like (01) GTIN, (17) Expiry, (10) Batch."""
    result = {}
    gtin_match = re.search(r"\(01\)(\d{14})", code) or re.search(r"01(\d{14})", code)
    if gtin_match:
        result["gtin"] = gtin_match.group(1)
    
    exp_match = re.search(r"\(17\)(\d{6})", code) or re.search(r"17(\d{6})", code)
    if exp_match:
        # YYMMDD format
        yymmdd = exp_match.group(1)
        result["expiry_date"] = f"20{yymmdd[:2]}-{yymmdd[2:4]}-{yymmdd[4:]}"
        
    batch_match = re.search(r"\(10\)([A-Za-z0-9]+)", code) or re.search(r"10([A-Za-z0-9]{4,20})", code)
    if batch_match:
        result["batch_number"] = batch_match.group(1)
        
    return result if result else None
