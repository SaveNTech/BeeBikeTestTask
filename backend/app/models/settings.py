from sqlalchemy import Integer, Numeric
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base

DEFAULT_PRICE_PER_MINUTE = 5.0


class AppSettings(Base):
    """Singleton row (id always 1) holding admin-editable app settings."""

    __tablename__ = "app_settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, default=1)
    price_per_minute: Mapped[float] = mapped_column(
        Numeric(10, 2), default=DEFAULT_PRICE_PER_MINUTE, nullable=False
    )
