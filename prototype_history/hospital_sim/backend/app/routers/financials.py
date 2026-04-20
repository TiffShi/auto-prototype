import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.database import get_db
from app.models.hospital import Hospital
from app.models.transaction import FinancialTransaction
from app.schemas.transaction import FinancialSummary, TransactionResponse
from app.utils.enums import TransactionType

router = APIRouter()


@router.get("/hospitals/{hospital_id}/financials", response_model=FinancialSummary)
async def get_financials(
    hospital_id: uuid.UUID,
    limit: int = Query(default=50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
):
    hospital = await db.get(Hospital, hospital_id)
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")

    # Get totals
    revenue_result = await db.execute(
        select(func.sum(FinancialTransaction.amount)).where(
            FinancialTransaction.hospital_id == hospital_id,
            FinancialTransaction.type == TransactionType.REVENUE,
        )
    )
    total_revenue = float(revenue_result.scalar() or 0)

    expense_result = await db.execute(
        select(func.sum(FinancialTransaction.amount)).where(
            FinancialTransaction.hospital_id == hospital_id,
            FinancialTransaction.type == TransactionType.EXPENSE,
        )
    )
    total_expenses = float(expense_result.scalar() or 0)

    # Get recent transactions
    tx_result = await db.execute(
        select(FinancialTransaction)
        .where(FinancialTransaction.hospital_id == hospital_id)
        .order_by(FinancialTransaction.created_at.desc())
        .limit(limit)
    )
    transactions = tx_result.scalars().all()

    return FinancialSummary(
        budget=float(hospital.budget),
        total_revenue=total_revenue,
        total_expenses=total_expenses,
        net_profit=total_revenue - total_expenses,
        transactions=[TransactionResponse.model_validate(t) for t in transactions],
    )