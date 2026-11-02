from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import or_, desc

from app.core.database import get_db
from app.models import Product, Batch, User
from app.schemas import ProductCreate, ProductUpdate, ProductOut, BatchCreate, BatchOut
from app.api.v1.auth import get_required_user

router = APIRouter(prefix="/products", tags=["Products"])

@router.get("", response_model=List[ProductOut])
async def list_products(
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    is_recalled: Optional[bool] = Query(None),
    limit: int = Query(50, le=100),
    db: AsyncSession = Depends(get_db)
):
    """Lists registered products with optional filtering."""
    query = select(Product).options(selectinload(Product.batches)).order_by(desc(Product.created_at))

    if search:
        search_filter = f"%{search}%"
        query = query.where(
            or_(
                Product.name.ilike(search_filter),
                Product.brand.ilike(search_filter),
                Product.gtin_barcode.like(search_filter)
            )
        )
    if category:
        query = query.where(Product.category == category)
    if is_recalled is not None:
        query = query.where(Product.is_recalled == is_recalled)

    query = query.limit(limit)
    res = await db.execute(query)
    products = res.scalars().all()
    return products

@router.post("", response_model=ProductOut)
async def create_product(
    prod_in: ProductCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_required_user)
):
    """Registers a new authorized product master record into the trusted database."""
    # Check if barcode already registered
    res = await db.execute(select(Product).where(Product.gtin_barcode == prod_in.gtin_barcode))
    if res.scalars().first():
        raise HTTPException(status_code=400, detail="A product with this GTIN/barcode already exists in the registry.")

    new_product = Product(
        name=prod_in.name,
        brand=prod_in.brand,
        category=prod_in.category,
        gtin_barcode=prod_in.gtin_barcode.strip(),
        sku=prod_in.sku,
        description=prod_in.description,
        image_url=prod_in.image_url,
        packaging_features=prod_in.packaging_features or {},
        expected_weight=prod_in.expected_weight,
        authorized_regions=prod_in.authorized_regions or "Global",
        is_recalled=prod_in.is_recalled,
        recall_reason=prod_in.recall_reason
    )
    db.add(new_product)
    await db.flush()

    if prod_in.batches:
        for b in prod_in.batches:
            batch = Batch(
                product_id=new_product.id,
                batch_number=b.batch_number,
                manufacturing_date=b.manufacturing_date,
                expiry_date=b.expiry_date,
                quantity=b.quantity or 1000,
                is_recalled=b.is_recalled,
                notes=b.notes
            )
            db.add(batch)

    await db.commit()
    
    # Reload with batches
    res = await db.execute(
        select(Product).options(selectinload(Product.batches)).where(Product.id == new_product.id)
    )
    return res.scalars().first()

@router.get("/{id}", response_model=ProductOut)
async def get_product(id: str, db: AsyncSession = Depends(get_db)):
    """Retrieves product record with its authorized production batches."""
    res = await db.execute(
        select(Product).options(selectinload(Product.batches)).where(Product.id == id)
    )
    product = res.scalars().first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found.")
    return product

@router.put("/{id}", response_model=ProductOut)
async def update_product(
    id: str,
    prod_in: ProductUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_required_user)
):
    """Updates an existing product master record."""
    res = await db.execute(
        select(Product).options(selectinload(Product.batches)).where(Product.id == id)
    )
    product = res.scalars().first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found.")

    update_data = prod_in.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(product, field, val)

    await db.commit()
    await db.refresh(product)
    return product

@router.post("/{id}/batches", response_model=BatchOut)
async def add_batch(
    id: str,
    batch_in: BatchCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_required_user)
):
    """Adds a new authorized production batch to a product."""
    res = await db.execute(select(Product).where(Product.id == id))
    product = res.scalars().first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found.")

    batch = Batch(
        product_id=id,
        batch_number=batch_in.batch_number,
        manufacturing_date=batch_in.manufacturing_date,
        expiry_date=batch_in.expiry_date,
        quantity=batch_in.quantity or 1000,
        is_recalled=batch_in.is_recalled,
        notes=batch_in.notes
    )
    db.add(batch)
    await db.commit()
    await db.refresh(batch)
    return batch

@router.post("/{id}/recall")
async def toggle_recall(
    id: str,
    is_recalled: bool,
    reason: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_required_user)
):
    """Sets or clears safety recall alert on a product."""
    res = await db.execute(select(Product).where(Product.id == id))
    product = res.scalars().first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found.")

    product.is_recalled = is_recalled
    product.recall_reason = reason if is_recalled else None
    await db.commit()
    return {
        "id": product.id,
        "name": product.name,
        "is_recalled": product.is_recalled,
        "recall_reason": product.recall_reason
    }
