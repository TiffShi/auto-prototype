from fastapi import APIRouter, HTTPException
from app.models.schemas import ConversionRequest, ConversionResponse
from app.services.conversion import convert_temperature, AbsoluteZeroError, InvalidScaleError

router = APIRouter()


@router.post("/convert", response_model=ConversionResponse)
def convert(request: ConversionRequest):
    """
    Convert a temperature value from one scale to another.

    Supported scales: Celsius, Fahrenheit, Kelvin

    Raises 422 if the temperature is below absolute zero or if an invalid scale is provided.
    """
    try:
        result = convert_temperature(
            value=request.value,
            from_scale=request.from_scale,
            to_scale=request.to_scale,
        )
    except AbsoluteZeroError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except InvalidScaleError as e:
        raise HTTPException(status_code=422, detail=str(e))

    return ConversionResponse(
        result=result,
        from_scale=request.from_scale,
        to_scale=request.to_scale,
        input_value=request.value,
    )