import uuid
import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.hospital import Hospital
from app.services.simulation_engine import simulation_manager, run_tick
from app.schemas.hospital import HospitalStats

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/hospitals/{hospital_id}/simulate/tick")
async def manual_tick(
    hospital_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    hospital = await db.get(Hospital, hospital_id)
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")

    result = await run_tick(db, hospital_id)
    return {"message": "Tick executed", "hospital_id": str(hospital_id), "result": result}