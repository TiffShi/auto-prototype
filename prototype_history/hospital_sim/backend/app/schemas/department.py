import uuid
from typing import Optional

from pydantic import BaseModel, Field
from app.utils.enums import DepartmentType


class DepartmentResponse(BaseModel):
    id: uuid.UUID
    hospital_id: uuid.UUID
    name: str
    type: DepartmentType
    bed_capacity: int
    current_occupancy: int
    upgrade_level: int
    available_beds: int = 0

    model_config = {"from_attributes": True}

    @classmethod
    def from_orm_with_computed(cls, dept):
        data = {
            "id": dept.id,
            "hospital_id": dept.hospital_id,
            "name": dept.name,
            "type": dept.type,
            "bed_capacity": dept.bed_capacity,
            "current_occupancy": dept.current_occupancy,
            "upgrade_level": dept.upgrade_level,
            "available_beds": max(0, dept.bed_capacity - dept.current_occupancy),
        }
        return cls(**data)


class DepartmentUpgrade(BaseModel):
    pass  # No body needed, upgrade is automatic