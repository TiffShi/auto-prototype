from fastapi import APIRouter, HTTPException

from app.models.schemas import CalculationRequest, CalculationResponse, ErrorResponse
from app.services.calculator_service import evaluate_expression, CalculatorError

router = APIRouter(
    prefix="/calculate",
    tags=["Calculator"],
)


@router.post(
    "",
    response_model=CalculationResponse,
    responses={
        400: {"model": ErrorResponse, "description": "Invalid expression or math error"},
    },
    summary="Evaluate a math expression",
    description="Accepts a safe arithmetic expression string and returns the evaluated result.",
)
def calculate(payload: CalculationRequest):
    """
    Evaluate the provided arithmetic expression and return the result.

    - Supports: `+`, `-`, `*`, `/`, `(`, `)`, decimal numbers
    - Rejects: unsafe input, division by zero, malformed expressions
    """
    try:
        result = evaluate_expression(payload.expression)
    except CalculatorError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return CalculationResponse(result=result, expression=payload.expression)