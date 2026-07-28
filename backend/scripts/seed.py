"""Idempotent seed script: creates the admin user and demo fixtures
so the app is usable right after `docker compose up` without manual setup."""

from datetime import datetime, timedelta, timezone

from app.core.config import settings
from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models.customer import Customer
from app.models.rental import Rental, RentalStatus
from app.models.scooter import Scooter, ScooterStatus
from app.models.settings import AppSettings
from app.models.user import User

DEMO_SCOOTERS = [
    {
        "number": "SC-001",
        "model": "Ninebot Max G30",
        "status": ScooterStatus.available,
        "battery_level": 92,
        "latitude": 55.7558,
        "longitude": 37.6173,
    },
    {
        "number": "SC-002",
        "model": "Xiaomi Mi Pro 2",
        "status": ScooterStatus.in_use,
        "battery_level": 47,
        "latitude": 55.7522,
        "longitude": 37.6156,
    },
    {
        "number": "SC-003",
        "model": "Ninebot Max G30",
        "status": ScooterStatus.maintenance,
        "battery_level": 15,
        "latitude": 55.7601,
        "longitude": 37.6184,
    },
    {
        "number": "SC-004",
        "model": "Kugoo M4 Pro",
        "status": ScooterStatus.offline,
        "battery_level": 0,
        "latitude": 55.7489,
        "longitude": 37.6231,
    },
    {
        "number": "SC-005",
        "model": "Xiaomi Mi Pro 2",
        "status": ScooterStatus.available,
        "battery_level": 78,
        "latitude": 55.7539,
        "longitude": 37.6208,
    },
]

DEMO_CUSTOMERS = [
    {"full_name": "Иван Петров", "phone": "+7 900 111-22-33", "balance": 250.00},
    {"full_name": "Мария Смирнова", "phone": "+7 900 444-55-66", "balance": 40.50},
]


def seed() -> None:
    db = SessionLocal()
    try:
        if not db.query(User).filter(User.email == settings.ADMIN_EMAIL).first():
            db.add(
                User(
                    email=settings.ADMIN_EMAIL,
                    hashed_password=hash_password(settings.ADMIN_PASSWORD),
                    full_name="Administrator",
                )
            )
            db.commit()
            print(f"Создан администратор: {settings.ADMIN_EMAIL}")

        if db.get(AppSettings, 1) is None:
            db.add(AppSettings(id=1))
            db.commit()

        if db.query(Scooter).count() == 0:
            for data in DEMO_SCOOTERS:
                db.add(Scooter(**data))
            db.commit()
            print(f"Добавлено демо-самокатов: {len(DEMO_SCOOTERS)}")

        if db.query(Customer).count() == 0:
            customers = [Customer(**data) for data in DEMO_CUSTOMERS]
            db.add_all(customers)
            db.commit()

            in_use_scooter = db.query(Scooter).filter(Scooter.status == ScooterStatus.in_use).first()
            if in_use_scooter is not None:
                db.add(
                    Rental(
                        scooter_id=in_use_scooter.id,
                        customer_id=customers[0].id,
                        status=RentalStatus.active,
                        start_time=datetime.now(timezone.utc) - timedelta(minutes=18),
                    )
                )
                db.commit()
            print(f"Добавлено демо-клиентов: {len(customers)}")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
