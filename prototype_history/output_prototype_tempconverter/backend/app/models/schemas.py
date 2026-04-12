from enum import Enum
from pydantic import BaseModel, Field


class TemperatureScale(str, Enum):
    celsius = "celsius"
    fahrenheit = "fahrenheit"
    kelvin = "kelvin"


class ConversionRequest(BaseModel):
    value: float = Field(
        ...,
        description="The numeric temperature value to convert.",
        examples=[100.0],
    )
    from_scale: TemperatureScale = Field(
        ...,
        description="The source temperature scale.",
        examples=["celsius"],
    )
    to_scale: TemperatureScale = Field(
        ...,
        description="The target temperature scale.",
        examples=["fahrenheit"],
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "value": 100,
                    "from_scale": "celsius",
                    "to_scale": "fahrenheit",
                }
            ]
        }
    }


class ConversionResponse(BaseModel):
    result: float = Field(
        ...,
        description="The converted temperature value.",
    )
    from_scale: TemperatureScale = Field(
        ...,
        description="The source temperature scale used.",
    )
    to_scale: TemperatureScale = Field(
        ...,
        description="The target temperature scale.",
    )
    input_value: float = Field(
        ...,
        description="The original input value provided by the user.",
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "result": 212.0,
                    "from_scale": "celsius",
                    "to_scale": "fahrenheit",
                    "input_value": 100,
                }
            ]
        }
    }