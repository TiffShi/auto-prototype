from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import crud, schemas
from app.database import get_db

router = APIRouter(
    prefix="/water_intake",
    tags=["water_intake"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=schemas.WaterIntake)
def log_water_intake(water_intake: schemas.WaterIntakeCreate, db: Session = Depends(get_db)):
    return crud.create_water_intake(db=db, water_intake=water_intake, user_id=1)  # Replace with actual user_id