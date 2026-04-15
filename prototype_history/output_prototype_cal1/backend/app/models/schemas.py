from pydantic import BaseModel, Field, field_validator
from typing import Union
import re


class CalculationRequest(BaseModel):
    expression: str = Field(
        ...,
        min_length=1,
        max_length=200,
        description="A mathematical expression to evaluate (e.g. '8 * (3 + 2)')",
        examples=["8 * (3 + 2)", "10 / 2 + 3", "100 - 45 * 2"],
    )

    @field_validator("expression")
    @classmethod
    def expression_must_not_be_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Expression must not be blank or whitespace only")
        return v

    model_config = {
        "json_schema_extra": {
            "examples": [
                {"expression": "8 * (3 + 2)"},
                {"expression": "100 / 4"},
                {"expression": "3.14 * 2"},
            ]
        }
    }


class CalculationResponse(BaseModel):
    result: Union[int, float] = Field(
        ...,
        description="The numeric result of the evaluated expression",
    )
    expression: str = Field(
        ...,
        description="The original expression that was evaluated",
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {"result": 40, "expression": "8 * (3 + 2)"},
                {"result": 25.0, "expression": "100 / 4"},
            ]
        }
    }


class ErrorResponse(BaseModel):
    error: str = Field(
        ...,
        description="A human-readable description of what went wrong",
    )
    expression: str = Field(
        ...,
        description="The original expression that caused the error",
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {"error": "Division by zero", "expression": "5 / 0"},
                {"error": "Invalid expression syntax", "expression": "8 ** ("},
            ]
        }
    }