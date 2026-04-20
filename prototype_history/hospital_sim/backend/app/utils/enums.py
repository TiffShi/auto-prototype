from enum import Enum


class DepartmentType(str, Enum):
    ER = "ER"
    ICU = "ICU"
    GENERAL = "GENERAL"
    SURGERY = "SURGERY"
    PHARMACY = "PHARMACY"


class SeverityLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    CRITICAL = "CRITICAL"


class PatientStatus(str, Enum):
    WAITING = "WAITING"
    IN_TREATMENT = "IN_TREATMENT"
    DISCHARGED = "DISCHARGED"
    DECEASED = "DECEASED"


class StaffRole(str, Enum):
    DOCTOR = "DOCTOR"
    NURSE = "NURSE"
    SURGEON = "SURGEON"
    PHARMACIST = "PHARMACIST"
    ADMIN = "ADMIN"


class ShiftType(str, Enum):
    DAY = "DAY"
    NIGHT = "NIGHT"


class InventoryCategory(str, Enum):
    MEDICINE = "MEDICINE"
    EQUIPMENT = "EQUIPMENT"
    SUPPLIES = "SUPPLIES"


class TransactionType(str, Enum):
    REVENUE = "REVENUE"
    EXPENSE = "EXPENSE"


class EventSeverity(str, Enum):
    INFO = "INFO"
    WARNING = "WARNING"
    CRITICAL = "CRITICAL"