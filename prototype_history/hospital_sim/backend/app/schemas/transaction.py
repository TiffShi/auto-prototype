import uuid
from datetime import datetime

from pydantic import BaseModel
from app.utils.enums import TransactionType


class TransactionResponse(BaseModel):
    id: uuid.UUID
    hospital_id: uuid.UUID
    type: TransactionType
    amount: float
    description: str
    created_at: datetime

    model_config = {"from_attributes": True}


class FinancialSummary(BaseModel):
    budget: float
    total_revenue: float
    total_expenses: float
    net_profit: float
    transactions: list[TransactionResponse]