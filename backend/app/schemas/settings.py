from decimal import Decimal

from pydantic import BaseModel, Field


class SettingsRead(BaseModel):
    price_per_minute: Decimal


class SettingsUpdate(BaseModel):
    price_per_minute: Decimal = Field(gt=0, le=1000)
