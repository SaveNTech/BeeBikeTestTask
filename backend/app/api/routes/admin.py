import random

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.customer import Customer
from app.models.rental import Rental
from app.models.scooter import Scooter, ScooterStatus
from scripts.seed import DEMO_SCOOTERS

router = APIRouter()


@router.post("/reseed", status_code=204)
def reseed_demo_data(db: Session = Depends(get_db), _current_user=Depends(get_current_user)):
    """Test Mode helper: wipes rentals/scooters/customers and reloads demo fixtures."""
    db.query(Rental).delete()
    db.query(Customer).delete()
    db.query(Scooter).delete()
    for data in DEMO_SCOOTERS:
        db.add(Scooter(**data))
    db.commit()
    return None


@router.post("/simulate", status_code=204)
def simulate_activity(db: Session = Depends(get_db), _current_user=Depends(get_current_user)):
    """Test Mode helper: randomly nudges scooter battery/status so polling has something to show."""
    scooters = db.query(Scooter).filter(Scooter.status != ScooterStatus.in_use).all()
    for scooter in random.sample(scooters, k=min(len(scooters), max(1, len(scooters) // 2))):
        scooter.battery_level = max(0, min(100, scooter.battery_level + random.randint(-15, 15)))
        if random.random() < 0.2:
            scooter.status = random.choice(
                [ScooterStatus.available, ScooterStatus.maintenance, ScooterStatus.offline]
            )
        db.add(scooter)
    db.commit()
    return None
