from app.models.schemas import TemperatureScale


class AbsoluteZeroError(ValueError):
    """Raised when a conversion would produce a temperature below absolute zero."""
    pass


ABSOLUTE_ZERO_KELVIN = 0.0


def _to_celsius(value: float, from_scale: TemperatureScale) -> float:
    """Convert any supported scale to Celsius as an intermediate step."""
    if from_scale == TemperatureScale.celsius:
        return value
    elif from_scale == TemperatureScale.fahrenheit:
        return (value - 32) * 5 / 9
    elif from_scale == TemperatureScale.kelvin:
        return value - 273.15
    else:
        raise ValueError(f"Unsupported scale: {from_scale}")


def _from_celsius(celsius: float, to_scale: TemperatureScale) -> float:
    """Convert a Celsius value to any supported target scale."""
    if to_scale == TemperatureScale.celsius:
        return celsius
    elif to_scale == TemperatureScale.fahrenheit:
        return (celsius * 9 / 5) + 32
    elif to_scale == TemperatureScale.kelvin:
        return celsius + 273.15
    else:
        raise ValueError(f"Unsupported scale: {to_scale}")


def convert_temperature(
    value: float,
    from_scale: TemperatureScale,
    to_scale: TemperatureScale,
) -> float:
    """
    Convert a temperature value from one scale to another.

    Raises:
        AbsoluteZeroError: If the input value is below absolute zero for the
                           given scale, or if the resulting Kelvin value would
                           be negative.
    """
    # Validate that the input itself is not below absolute zero
    celsius = _to_celsius(value, from_scale)
    kelvin_equivalent = celsius + 273.15

    if kelvin_equivalent < ABSOLUTE_ZERO_KELVIN:
        raise AbsoluteZeroError(
            "Temperature below absolute zero is not physically possible."
        )

    # Perform the conversion
    result = _from_celsius(celsius, to_scale)

    # Final guard: if the target is Kelvin, ensure result is non-negative
    # (This is redundant given the check above, but kept for explicit safety)
    if to_scale == TemperatureScale.kelvin and result < ABSOLUTE_ZERO_KELVIN:
        raise AbsoluteZeroError(
            "Temperature below absolute zero is not physically possible."
        )

    return result