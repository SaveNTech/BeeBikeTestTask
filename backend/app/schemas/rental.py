import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.models.rental import RentalStatus
from app.schemas.customer import CustomerRead
from app.schemas.scooter import ScooterRead


class RentalCreate(BaseModel):
    scooter_id: uuid.UUID
    customer_name: str = Field(min_length=1, max_length=255)
    customer_phone: str = Field(min_length=3, max_length=50)


class RentalRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    scooter_id: uuid.UUID
    customer_id: uuid.UUID
    status: RentalStatus
    start_time: datetime
    end_time: datetime | None
    cost: Decimal | None
    scooter: ScooterRead
    customer: CustomerRead
