from fastapi import APIRouter, HTTPException
from app.models.schemas import ConversionRequest, ConversionResponse
from app.services.conversion import convert_temperature, AbsoluteZeroError

router = APIRouter()


@router.post("/convert", response_model=ConversionResponse)
def convert(request: ConversionRequest):
    """
    Convert a temperature value from one scale to another.

    - **value**: The numeric temperature value to convert
    - **from_scale**: The source temperature scale (celsius, fahrenheit, kelvin)
    - **to_scale**: The target temperature scale (celsius, fahrenheit, kelvin)
    """
    try:
        result = convert_temperature(
            value=request.value,
            from_scale=request.from_scale,
            to_scale=request.to_scale,
        )
    except AbsoluteZeroError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    return ConversionResponse(
        result=result,
        from_scale=request.from_scale,
        to_scale=request.to_scale,
        input_value=request.value,
    )