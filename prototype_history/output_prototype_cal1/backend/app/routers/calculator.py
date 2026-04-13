from fastapi import APIRouter, HTTPException
from models.schemas import CalculationRequest, CalculationResponse, ErrorResponse
from services.evaluator import evaluate_expression, EvaluationError

router = APIRouter()


@router.post(
    "/calculate",
    response_model=CalculationResponse,
    responses={
        400: {"model": ErrorResponse, "description": "Invalid or unsafe expression"},
    },
    summary="Evaluate a math expression",
    description="Accepts a mathematical expression string and returns the evaluated result.",
)
async def calculate(request: CalculationRequest):
    """
    Evaluate a mathematical expression safely.

    - **expression**: A string containing a valid arithmetic expression
      (e.g. `"8 * (3 + 2)"`, `"10 / 2 + 3"`)

    Returns the numeric result or a structured error message.
    """
    try:
        result = evaluate_expression(request.expression)
        return CalculationResponse(result=result, expression=request.expression)
    except EvaluationError as exc:
        raise HTTPException(
            status_code=400,
            detail={"error": str(exc), "expression": request.expression},
        )
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail={"error": "Internal server error", "expression": request.expression},
        )