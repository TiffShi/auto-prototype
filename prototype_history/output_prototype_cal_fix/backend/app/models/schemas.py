from typing import Union

from pydantic import BaseModel, Field, field_validator


class CalculationRequest(BaseModel):
    """Request body for the /calculate endpoint."""

    expression: str = Field(
        ...,
        min_length=1,
        max_length=256,
        examples=["8 * (3 + 2)", "10 / 2.5", "100 - 37 + 3"],
        description=(
            "An arithmetic expression using numbers and the operators "
            "+, -, *, /. Parentheses are supported."
        ),
    )

    @field_validator("expression")
    @classmethod
    def expression_must_not_be_blank(cls, value: str) -> str:
        stripped = value.strip()
        if not stripped:
            raise ValueError("Expression must not be blank or whitespace only.")
        return stripped

    model_config = {
        "json_schema_extra": {
            "examples": [
                {"expression": "8 * (3 + 2)"},
                {"expression": "100 / 4"},
            ]
        }
    }


class CalculationResponse(BaseModel):
    """Successful response from the /calculate endpoint."""

    result: Union[int, float] = Field(
        ...,
        description="The numeric result of the evaluated expression.",
        examples=[40, 25.5],
    )
    expression: str = Field(
        ...,
        description="The original expression that was evaluated.",
        examples=["8 * (3 + 2)"],
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {"result": 40, "expression": "8 * (3 + 2)"},
            ]
        }
    }


class ErrorResponse(BaseModel):
    """Error response returned when evaluation fails."""

    detail: str = Field(
        ...,
        description="Human-readable description of what went wrong.",
        examples=["Division by zero is not allowed."],
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {"detail": "Division by zero is not allowed."},
                {"detail": "Expression contains invalid characters."},
            ]
        }
    }