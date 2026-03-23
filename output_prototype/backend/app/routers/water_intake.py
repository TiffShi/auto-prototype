from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import crud, schemas
from app.database import get_db
from app.auth import get_current_user

router = APIRouter()

@router.post("/water_intakes/", response_model=schemas.WaterIntake)
def create_water_intake(water_intake: schemas.WaterIntakeCreate, db: Session = Depends(get_db), current_user: schemas.User = Depends(get_current_user)):
    return crud.create_water_intake(db=db, water_intake=water_intake, user_id=current_user.id)

@router.get("/water_intakes/", response_model=list[schemas.WaterIntake])
def read_water_intakes(skip: int = 0, limit: int = 10, db: Session = Depends(get_db), current_user: schemas.User = Depends(get_current_user)):
    water_intakes = crud.get_water_intakes(db, user_id=current_user.id)
    return water_intakes