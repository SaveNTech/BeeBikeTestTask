import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class CustomerRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    full_name: str
    phone: str
    balance: Decimal
    created_at: datetime


class TopUpRequest(BaseModel):
    amount: Decimal = Field(gt=0, le=100000)
    simulate_failure: bool = False
