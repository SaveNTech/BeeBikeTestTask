import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Numeric
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.db.base import Base


class RentalStatus(str, enum.Enum):
    active = "active"
    completed = "completed"


class Rental(Base):
    __tablename__ = "rentals"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    scooter_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("scooters.id", ondelete="CASCADE"), nullable=False
    )
    customer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("customers.id", ondelete="CASCADE"), nullable=False
    )
    status: Mapped[RentalStatus] = mapped_column(
        Enum(RentalStatus, name="rental_status"), default=RentalStatus.active, nullable=False
    )
    start_time: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    end_time: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    cost: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)

    scooter = relationship("Scooter", back_populates="rentals")
    customer = relationship("Customer", back_populates="rentals")
