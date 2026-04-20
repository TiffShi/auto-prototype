import random
import uuid
import logging
from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.event import Event
from app.models.hospital import Hospital
from app.models.inventory import Inventory
from app.models.staff import Staff
from app.utils.enums import EventSeverity

logger = logging.getLogger(__name__)

RANDOM_EVENTS = [
    {
        "event_type": "EQUIPMENT_FAILURE",
        "description": "A critical piece of equipment has malfunctioned and requires immediate repair.",
        "severity": EventSeverity.WARNING,
        "probability": 0.05,
    },
    {
        "event_type": "DISEASE_OUTBREAK",
        "description": "A disease outbreak has been reported in the city. Expect increased patient arrivals.",
        "severity": EventSeverity.CRITICAL,
        "probability": 0.02,
    },
    {
        "event_type": "STAFF_ILLNESS",
        "description": "A staff member has fallen ill and is unavailable for their shift.",
        "severity": EventSeverity.WARNING,
        "probability": 0.08,
    },
    {
        "event_type": "DONATION_RECEIVED",
        "description": "The hospital received a generous donation from a local benefactor.",
        "severity": EventSeverity.INFO,
        "probability": 0.03,
    },
    {
        "event_type": "INSPECTION_PASSED",
        "description": "The hospital passed its quarterly health inspection with flying colors.",
        "severity": EventSeverity.INFO,
        "probability": 0.04,
    },
    {
        "event_type": "POWER_OUTAGE",
        "description": "A brief power outage affected non-critical systems. Backup generators activated.",
        "severity": EventSeverity.WARNING,
        "probability": 0.03,
    },
    {
        "event_type": "MASS_CASUALTY",
        "description": "A mass casualty event has occurred. Multiple critical patients incoming.",
        "severity": EventSeverity.CRITICAL,
        "probability": 0.01,
    },
]


async def maybe_generate_event(
    db: AsyncSession,
    hospital_id: uuid.UUID,
) -> list[Event]:
    """Randomly generate events based on probability."""
    generated_events = []

    for event_template in RANDOM_EVENTS:
        if random.random() < event_template["probability"]:
            event = Event(
                hospital_id=hospital_id,
                event_type=event_template["event_type"],
                description=event_template["description"],
                severity=event_template["severity"],
            )
            db.add(event)
            generated_events.append(event)
            logger.info(f"Generated event: {event_template['event_type']} for hospital {hospital_id}")

    return generated_events


async def create_low_stock_event(
    db: AsyncSession,
    hospital_id: uuid.UUID,
    item_name: str,
    quantity: int,
) -> Event:
    event = Event(
        hospital_id=hospital_id,
        event_type="LOW_STOCK",
        description=f"Low stock alert: {item_name} has only {quantity} units remaining.",
        severity=EventSeverity.WARNING,
    )
    db.add(event)
    return event


async def create_patient_critical_event(
    db: AsyncSession,
    hospital_id: uuid.UUID,
    patient_name: str,
) -> Event:
    event = Event(
        hospital_id=hospital_id,
        event_type="PATIENT_CRITICAL",
        description=f"Patient {patient_name} is in critical condition and requires immediate attention.",
        severity=EventSeverity.CRITICAL,
    )
    db.add(event)
    return event


async def create_patient_deceased_event(
    db: AsyncSession,
    hospital_id: uuid.UUID,
    patient_name: str,
) -> Event:
    event = Event(
        hospital_id=hospital_id,
        event_type="PATIENT_DECEASED",
        description=f"Patient {patient_name} has passed away.",
        severity=EventSeverity.CRITICAL,
    )
    db.add(event)
    return event


async def create_budget_warning_event(
    db: AsyncSession,
    hospital_id: uuid.UUID,
    budget: float,
) -> Event:
    event = Event(
        hospital_id=hospital_id,
        event_type="LOW_BUDGET",
        description=f"Hospital budget is critically low: ${budget:,.2f} remaining.",
        severity=EventSeverity.CRITICAL,
    )
    db.add(event)
    return event