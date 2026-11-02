# 🛡️ VERIFAI — AI-Powered Product Verification Platform

> **Scan. Analyze. Verify.** — Evidence-first. AI-assisted. Source-aware.

VERIFAI is a production-oriented product verification platform that helps consumers, inspectors, companies, and administrators assess whether a product appears genuine, suspicious, or cannot be verified — using product images, barcode data, OCR text extraction, trusted records, deterministic verification rules, and AI-assisted analysis.

## Architecture

```
verifyai/
├── frontend/          # Next.js + TypeScript + Tailwind CSS + shadcn/ui
├── backend/           # Python + FastAPI + SQLAlchemy + Alembic
├── design/            # UI/UX prototype and design assets
└── docs/              # Architecture and API documentation
```

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js, TypeScript, Tailwind CSS v3, shadcn/ui |
| Backend | Python 3.12, FastAPI, Pydantic, SQLAlchemy, Alembic |
| Database | PostgreSQL 18 |
| AI | Google Gemini API (multimodal) |
| OCR | Tesseract OCR |
| Barcode | ZXing/pyzbar |

## Quick Start

### Prerequisites
- Node.js 20+
- Python 3.12+
- PostgreSQL 18+

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate     # Windows
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

### Environment Variables
Copy `.env.example` files in both `frontend/` and `backend/` directories and configure them.

## User Roles

| Role | Access |
|------|--------|
| **Consumer** | Scan products, view results, report suspicious items |
| **Admin** | Manage users, products, sources, review cases |
| **Company/Importer** | Submit product records, manage batches |
| **Inspector** | Review flagged cases, record decisions |

## Verification Statuses

- **VERIFIED** — Evidence matches trusted records under configured rules
- **SUSPICIOUS** — Evidence shows meaningful conflict or warning signs
- **NOT VERIFIED** — Insufficient evidence to determine status

## License

Proprietary — All rights reserved.
