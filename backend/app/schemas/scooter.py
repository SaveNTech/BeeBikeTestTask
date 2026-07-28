import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.scooter import ScooterStatus


class ScooterBase(BaseModel):
    number: str = Field(min_length=1, max_length=50)
    model: str = Field(min_length=1, max_length=100)
    status: ScooterStatus = ScooterStatus.available
    battery_level: int = Field(ge=0, le=100)
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)


class ScooterCreate(ScooterBase):
    pass


class ScooterUpdate(BaseModel):
    number: str | None = Field(default=None, min_length=1, max_length=50)
    model: str | None = Field(default=None, min_length=1, max_length=100)
    status: ScooterStatus | None = None
    battery_level: int | None = Field(default=None, ge=0, le=100)
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)


class ScooterRead(ScooterBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    updated_at: datetime
