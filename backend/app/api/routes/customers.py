import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.customer import Customer
from app.schemas.customer import CustomerRead, TopUpRequest

router = APIRouter()


@router.get("", response_model=list[CustomerRead])
def list_customers(
    search: str | None = Query(default=None, description="Поиск по имени или телефону"),
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
):
    query = db.query(Customer)
    if search:
        like = f"%{search}%"
        query = query.filter(or_(Customer.full_name.ilike(like), Customer.phone.ilike(like)))
    return query.order_by(Customer.created_at.desc()).all()


@router.post("/{customer_id}/topup", response_model=CustomerRead)
def top_up_balance(
    customer_id: uuid.UUID,
    payload: TopUpRequest,
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
):
    """Mock balance top-up: no real payment gateway is integrated.

    `simulate_failure` lets the Test Mode panel in the UI exercise the
    failure path without needing a real declined card.
    """
    customer = db.get(Customer, customer_id)
    if customer is None:
        raise HTTPException(status_code=404, detail="Клиент не найден")

    if payload.simulate_failure:
        raise HTTPException(status_code=402, detail="Оплата отклонена (тестовый режим)")

    customer.balance = customer.balance + payload.amount
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer
