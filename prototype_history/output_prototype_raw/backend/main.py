from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, validator
from datetime import datetime
from typing import List

app = FastAPI(title="Banking App API")

# CORS configuration — explicitly whitelist the frontend origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

# In-memory account state
account = {
    "balance": 500.00,
    "transactions": []
}


# --- Pydantic Models ---

class AmountRequest(BaseModel):
    amount: float

    @validator("amount")
    def amount_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError("Amount must be greater than zero.")
        return round(v, 2)


class TransactionRecord(BaseModel):
    type: str
    amount: float
    timestamp: str


class BalanceResponse(BaseModel):
    balance: float


class TransactionResponse(BaseModel):
    success: bool
    balance: float
    message: str


class TransactionsListResponse(BaseModel):
    transactions: List[TransactionRecord]


# --- Helper ---

def record_transaction(tx_type: str, amount: float):
    account["transactions"].append({
        "type": tx_type,
        "amount": amount,
        "timestamp": datetime.utcnow().isoformat()
    })


# --- Routes ---

@app.get("/balance", response_model=BalanceResponse)
def get_balance():
    return {"balance": round(account["balance"], 2)}


@app.post("/deposit", response_model=TransactionResponse)
def deposit(request: AmountRequest):
    amount = request.amount
    account["balance"] = round(account["balance"] + amount, 2)
    record_transaction("deposit", amount)
    return {
        "success": True,
        "balance": account["balance"],
        "message": f"Deposited ${amount:.2f}"
    }


@app.post("/withdraw", response_model=TransactionResponse)
def withdraw(request: AmountRequest):
    amount = request.amount
    if amount > account["balance"]:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient funds. Current balance is ${account['balance']:.2f}."
        )
    account["balance"] = round(account["balance"] - amount, 2)
    record_transaction("withdraw", amount)
    return {
        "success": True,
        "balance": account["balance"],
        "message": f"Withdrew ${amount:.2f}"
    }


@app.get("/transactions", response_model=TransactionsListResponse)
def get_transactions():
    return {"transactions": account["transactions"]}