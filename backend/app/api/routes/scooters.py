import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.scooter import Scooter, ScooterStatus
from app.schemas.scooter import ScooterCreate, ScooterRead, ScooterUpdate

router = APIRouter()


@router.get("", response_model=list[ScooterRead])
def list_scooters(
    status_filter: ScooterStatus | None = Query(default=None, alias="status"),
    search: str | None = Query(default=None, description="Поиск по номеру или модели"),
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
):
    query = db.query(Scooter)
    if status_filter is not None:
        query = query.filter(Scooter.status == status_filter)
    if search:
        like = f"%{search}%"
        query = query.filter(or_(Scooter.number.ilike(like), Scooter.model.ilike(like)))
    return query.order_by(Scooter.updated_at.desc()).all()


@router.post("", response_model=ScooterRead, status_code=status.HTTP_201_CREATED)
def create_scooter(
    payload: ScooterCreate,
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
):
    if db.query(Scooter).filter(Scooter.number == payload.number).first():
        raise HTTPException(status_code=409, detail="Самокат с таким номером уже существует")
    scooter = Scooter(**payload.model_dump())
    db.add(scooter)
    db.commit()
    db.refresh(scooter)
    return scooter


@router.get("/{scooter_id}", response_model=ScooterRead)
def get_scooter(
    scooter_id: uuid.UUID,
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
):
    scooter = db.get(Scooter, scooter_id)
    if scooter is None:
        raise HTTPException(status_code=404, detail="Самокат не найден")
    return scooter


@router.put("/{scooter_id}", response_model=ScooterRead)
def update_scooter(
    scooter_id: uuid.UUID,
    payload: ScooterUpdate,
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
):
    scooter = db.get(Scooter, scooter_id)
    if scooter is None:
        raise HTTPException(status_code=404, detail="Самокат не найден")

    update_data = payload.model_dump(exclude_unset=True)
    if "number" in update_data and update_data["number"] != scooter.number:
        if db.query(Scooter).filter(Scooter.number == update_data["number"]).first():
            raise HTTPException(status_code=409, detail="Самокат с таким номером уже существует")

    for field, value in update_data.items():
        setattr(scooter, field, value)

    db.commit()
    db.refresh(scooter)
    return scooter


@router.delete("/{scooter_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_scooter(
    scooter_id: uuid.UUID,
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
):
    scooter = db.get(Scooter, scooter_id)
    if scooter is None:
        raise HTTPException(status_code=404, detail="Самокат не найден")
    db.delete(scooter)
    db.commit()
    return None
