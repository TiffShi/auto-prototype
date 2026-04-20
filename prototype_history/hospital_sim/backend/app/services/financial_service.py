import uuid
import logging

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.transaction import FinancialTransaction
from app.utils.enums import TransactionType

logger = logging.getLogger(__name__)


async def record_transaction(
    db: AsyncSession,
    hospital_id: uuid.UUID,
    type: TransactionType,
    amount: float,
    description: str,
) -> FinancialTransaction:
    transaction = FinancialTransaction(
        hospital_id=hospital_id,
        type=type,
        amount=round(amount, 2),
        description=description,
    )
    db.add(transaction)
    return transaction


async def deduct_salary_expenses(
    db: AsyncSession,
    hospital_id: uuid.UUID,
    total_salary: float,
) -> FinancialTransaction:
    return await record_transaction(
        db=db,
        hospital_id=hospital_id,
        type=TransactionType.EXPENSE,
        amount=total_salary,
        description=f"Staff salary payment: ${total_salary:,.2f}",
    )