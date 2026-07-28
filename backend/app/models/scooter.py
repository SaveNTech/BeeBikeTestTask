import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, Float, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.db.base import Base


class ScooterStatus(str, enum.Enum):
    available = "available"
    in_use = "in_use"
    maintenance = "maintenance"
    offline = "offline"


class Scooter(Base):
    __tablename__ = "scooters"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    number: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    model: Mapped[str] = mapped_column(String(100), nullable=False)
    status: Mapped[ScooterStatus] = mapped_column(
        Enum(ScooterStatus, name="scooter_status"), default=ScooterStatus.available, nullable=False
    )
    battery_level: Mapped[int] = mapped_column(Integer, default=100, nullable=False)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    rentals = relationship("Rental", back_populates="scooter", cascade="all, delete-orphan")
