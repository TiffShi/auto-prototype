import logging
from app.utils.enums import StaffRole

logger = logging.getLogger(__name__)

SALARY_BASE = {
    StaffRole.DOCTOR: 8000.0,
    StaffRole.NURSE: 4000.0,
    StaffRole.SURGEON: 12000.0,
    StaffRole.PHARMACIST: 5000.0,
    StaffRole.ADMIN: 3000.0,
}

FATIGUE_INCREASE_PER_TICK = 5
FATIGUE_RECOVERY_PER_TICK = 10
FATIGUE_THRESHOLD_UNAVAILABLE = 90


def calculate_salary(role: StaffRole, skill_level: int) -> float:
    """Calculate monthly salary based on role and skill level."""
    base = SALARY_BASE.get(role, 4000.0)
    skill_multiplier = 1.0 + (skill_level - 1) * 0.1  # 10% per skill level above 1
    return round(base * skill_multiplier, 2)


def apply_fatigue(fatigue: int, is_working: bool) -> int:
    """Apply fatigue changes based on whether staff is working."""
    if is_working:
        new_fatigue = min(100, fatigue + FATIGUE_INCREASE_PER_TICK)
    else:
        new_fatigue = max(0, fatigue - FATIGUE_RECOVERY_PER_TICK)
    return new_fatigue


def is_staff_available(fatigue: int) -> bool:
    """Determine if staff is available based on fatigue."""
    return fatigue < FATIGUE_THRESHOLD_UNAVAILABLE