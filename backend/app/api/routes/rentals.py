import math
import uuid
from datetime import datetime, timezone
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_current_user
from app.api.routes.settings import get_or_create_settings
from app.db.session import get_db
from app.models.customer import Customer
from app.models.rental import Rental, RentalStatus
from app.models.scooter import Scooter, ScooterStatus
from app.schemas.rental import RentalCreate, RentalRead

router = APIRouter()


@router.get("", response_model=list[RentalRead])
def list_rentals(
    status_filter: RentalStatus | None = Query(default=None, alias="status"),
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
):
    query = db.query(Rental).options(joinedload(Rental.scooter), joinedload(Rental.customer))
    if status_filter is not None:
        query = query.filter(Rental.status == status_filter)
    return query.order_by(Rental.start_time.desc()).all()


def _get_or_create_customer(db: Session, name: str, phone: str) -> Customer:
    customer = db.query(Customer).filter(Customer.phone == phone).first()
    if customer is None:
        customer = Customer(full_name=name, phone=phone, balance=0)
        db.add(customer)
        db.flush()
    elif customer.full_name != name:
        customer.full_name = name
        db.add(customer)
    return customer


@router.post("", response_model=RentalRead, status_code=status.HTTP_201_CREATED)
def create_rental(
    payload: RentalCreate,
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
):
    scooter = db.get(Scooter, payload.scooter_id)
    if scooter is None:
        raise HTTPException(status_code=404, detail="Самокат не найден")
    if scooter.status != ScooterStatus.available:
        raise HTTPException(status_code=400, detail="Самокат недоступен для аренды")

    customer = _get_or_create_customer(db, payload.customer_name, payload.customer_phone)

    rental = Rental(
        scooter_id=payload.scooter_id,
        customer_id=customer.id,
        status=RentalStatus.active,
    )
    scooter.status = ScooterStatus.in_use
    db.add(rental)
    db.add(scooter)
    db.commit()
    db.refresh(rental)
    return rental


@router.post("/{rental_id}/complete", response_model=RentalRead)
def complete_rental(
    rental_id: uuid.UUID,
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
):
    rental = db.get(Rental, rental_id)
    if rental is None:
        raise HTTPException(status_code=404, detail="Аренда не найдена")
    if rental.status == RentalStatus.completed:
        raise HTTPException(status_code=400, detail="Аренда уже завершена")

    end_time = datetime.now(timezone.utc)
    duration_minutes = max(1, math.ceil((end_time - rental.start_time).total_seconds() / 60))

    settings_row = get_or_create_settings(db)
    cost = Decimal(duration_minutes) * settings_row.price_per_minute

    rental.status = RentalStatus.completed
    rental.end_time = end_time
    rental.cost = cost

    customer = db.get(Customer, rental.customer_id)
    if customer is not None:
        customer.balance = customer.balance - cost
        db.add(customer)

    scooter = db.get(Scooter, rental.scooter_id)
    if scooter is not None and scooter.status == ScooterStatus.in_use:
        scooter.status = ScooterStatus.available
        db.add(scooter)

    db.add(rental)
    db.commit()
    db.refresh(rental)
    return rental
