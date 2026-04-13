from pydantic import BaseModel, field_validator
from typing import Literal

Scale = Literal["Celsius", "Fahrenheit", "Kelvin"]


class ConversionRequest(BaseModel):
    value: float
    from_scale: Scale
    to_scale: Scale

    @field_validator("value")
    @classmethod
    def value_must_be_finite(cls, v: float) -> float:
        import math
        if math.isnan(v) or math.isinf(v):
            raise ValueError("Temperature value must be a finite number.")
        return v

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "value": 100.0,
                    "from_scale": "Celsius",
                    "to_scale": "Fahrenheit",
                }
            ]
        }
    }


class ConversionResponse(BaseModel):
    result: float
    from_scale: Scale
    to_scale: Scale
    input_value: float

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "result": 212.0,
                    "from_scale": "Celsius",
                    "to_scale": "Fahrenheit",
                    "input_value": 100.0,
                }
            ]
        }
    }