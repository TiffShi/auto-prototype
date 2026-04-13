"""
Pure conversion logic for temperature scales.

All conversions route through Kelvin as the canonical intermediate unit:

  Celsius    → Kelvin:  K = C + 273.15
  Fahrenheit → Kelvin:  K = (F + 459.67) × 5/9
  Kelvin     → Kelvin:  K = K

  Kelvin → Celsius:     C = K − 273.15
  Kelvin → Fahrenheit:  F = K × 9/5 − 459.67
  Kelvin → Kelvin:      K = K

Absolute zero constraint: K >= 0
"""

ABSOLUTE_ZERO_KELVIN = 0.0
ABSOLUTE_ZERO_CELSIUS = -273.15
ABSOLUTE_ZERO_FAHRENHEIT = -459.67

SUPPORTED_SCALES = {"Celsius", "Fahrenheit", "Kelvin"}


class AbsoluteZeroError(ValueError):
    """Raised when the input temperature is below absolute zero."""
    pass


class InvalidScaleError(ValueError):
    """Raised when an unsupported temperature scale is provided."""
    pass


def _to_kelvin(value: float, from_scale: str) -> float:
    """Convert a temperature value from the given scale to Kelvin."""
    if from_scale == "Celsius":
        return value + 273.15
    elif from_scale == "Fahrenheit":
        return (value + 459.67) * 5.0 / 9.0
    elif from_scale == "Kelvin":
        return value
    else:
        raise InvalidScaleError(
            f"Unsupported scale '{from_scale}'. Must be one of: {', '.join(sorted(SUPPORTED_SCALES))}."
        )


def _from_kelvin(kelvin: float, to_scale: str) -> float:
    """Convert a temperature value from Kelvin to the target scale."""
    if to_scale == "Celsius":
        return kelvin - 273.15
    elif to_scale == "Fahrenheit":
        return kelvin * 9.0 / 5.0 - 459.67
    elif to_scale == "Kelvin":
        return kelvin
    else:
        raise InvalidScaleError(
            f"Unsupported scale '{to_scale}'. Must be one of: {', '.join(sorted(SUPPORTED_SCALES))}."
        )


def _validate_absolute_zero(value: float, from_scale: str) -> None:
    """
    Validate that the input temperature is not below absolute zero.

    Raises AbsoluteZeroError if the value is below the absolute zero
    threshold for the given scale.
    """
    if from_scale == "Celsius" and value < ABSOLUTE_ZERO_CELSIUS:
        raise AbsoluteZeroError(
            f"Temperature {value} °C is below absolute zero (−273.15 °C)."
        )
    elif from_scale == "Fahrenheit" and value < ABSOLUTE_ZERO_FAHRENHEIT:
        raise AbsoluteZeroError(
            f"Temperature {value} °F is below absolute zero (−459.67 °F)."
        )
    elif from_scale == "Kelvin" and value < ABSOLUTE_ZERO_KELVIN:
        raise AbsoluteZeroError(
            f"Temperature {value} K is below absolute zero (0 K)."
        )


def convert_temperature(value: float, from_scale: str, to_scale: str) -> float:
    """
    Convert a temperature from one scale to another.

    Args:
        value:      The numeric temperature to convert.
        from_scale: The source scale ('Celsius', 'Fahrenheit', or 'Kelvin').
        to_scale:   The target scale ('Celsius', 'Fahrenheit', or 'Kelvin').

    Returns:
        The converted temperature as a float.

    Raises:
        AbsoluteZeroError:  If the input temperature is below absolute zero.
        InvalidScaleError:  If an unsupported scale name is provided.
    """
    if from_scale not in SUPPORTED_SCALES:
        raise InvalidScaleError(
            f"Unsupported source scale '{from_scale}'. "
            f"Must be one of: {', '.join(sorted(SUPPORTED_SCALES))}."
        )
    if to_scale not in SUPPORTED_SCALES:
        raise InvalidScaleError(
            f"Unsupported target scale '{to_scale}'. "
            f"Must be one of: {', '.join(sorted(SUPPORTED_SCALES))}."
        )

    _validate_absolute_zero(value, from_scale)

    # Identity conversion — no math needed
    if from_scale == to_scale:
        return value

    kelvin = _to_kelvin(value, from_scale)

    # Defensive check: Kelvin should never be negative after validation,
    # but guard against floating-point edge cases near absolute zero.
    if kelvin < 0.0:
        raise AbsoluteZeroError(
            "Temperature is below absolute zero for the given scale."
        )

    result = _from_kelvin(kelvin, to_scale)
    return result