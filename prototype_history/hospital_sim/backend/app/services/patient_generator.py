import random
import uuid
from typing import Optional

from faker import Faker
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.patient import Patient
from app.utils.enums import SeverityLevel, PatientStatus

fake = Faker()

CONDITIONS = {
    SeverityLevel.LOW: [
        "Common Cold", "Minor Laceration", "Sprained Ankle", "Mild Headache",
        "Allergic Reaction", "Minor Burns", "Stomach Ache", "Ear Infection",
        "Sore Throat", "Mild Fever",
    ],
    SeverityLevel.MEDIUM: [
        "Pneumonia", "Appendicitis", "Fractured Arm", "Severe Migraine",
        "Kidney Stones", "Asthma Attack", "Diabetic Episode", "Chest Pain",
        "Severe Infection", "Concussion",
    ],
    SeverityLevel.CRITICAL: [
        "Heart Attack", "Stroke", "Severe Trauma", "Sepsis",
        "Respiratory Failure", "Internal Bleeding", "Anaphylactic Shock",
        "Cardiac Arrest", "Severe Burns", "Multiple Organ Failure",
    ],
}

TREATMENT_COSTS = {
    SeverityLevel.LOW: (500, 2000),
    SeverityLevel.MEDIUM: (3000, 10000),
    SeverityLevel.CRITICAL: (15000, 50000),
}

REQUIRED_TICKS = {
    SeverityLevel.LOW: (2, 4),
    SeverityLevel.MEDIUM: (4, 8),
    SeverityLevel.CRITICAL: (8, 15),
}


def calculate_treatment_cost(severity: SeverityLevel) -> float:
    low, high = TREATMENT_COSTS[severity]
    return round(random.uniform(low, high), 2)


def calculate_required_ticks(severity: SeverityLevel) -> int:
    low, high = REQUIRED_TICKS[severity]
    return random.randint(low, high)


def get_random_severity() -> SeverityLevel:
    """Weighted random severity: 50% LOW, 35% MEDIUM, 15% CRITICAL"""
    return random.choices(
        [SeverityLevel.LOW, SeverityLevel.MEDIUM, SeverityLevel.CRITICAL],
        weights=[50, 35, 15],
        k=1,
    )[0]


async def generate_patient(
    db: AsyncSession,
    hospital_id: uuid.UUID,
    severity: Optional[SeverityLevel] = None,
) -> Patient:
    if severity is None:
        severity = get_random_severity()

    condition = random.choice(CONDITIONS[severity])
    patient = Patient(
        hospital_id=hospital_id,
        name=fake.name(),
        age=random.randint(1, 95),
        condition=condition,
        severity=severity,
        status=PatientStatus.WAITING,
        treatment_cost=calculate_treatment_cost(severity),
        required_ticks=calculate_required_ticks(severity),
        ticks_in_treatment=0,
    )
    db.add(patient)
    return patient