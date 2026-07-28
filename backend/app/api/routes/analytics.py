from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.rental import Rental, RentalStatus
from app.models.scooter import Scooter, ScooterStatus
from app.schemas.analytics import AnalyticsSummary

router = APIRouter()


@router.get("/summary", response_model=AnalyticsSummary)
def get_summary(
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
):
    status_counts = dict(
        db.query(Scooter.status, func.count(Scooter.id)).group_by(Scooter.status).all()
    )
    scooters_by_status = {s.value: status_counts.get(s, 0) for s in ScooterStatus}
    total_scooters = sum(scooters_by_status.values())

    active_rentals = (
        db.query(func.count(Rental.id)).filter(Rental.status == RentalStatus.active).scalar() or 0
    )

    avg_battery = db.query(func.avg(Scooter.battery_level)).scalar()
    average_battery_level = round(float(avg_battery), 1) if avg_battery is not None else 0.0

    return AnalyticsSummary(
        scooters_by_status=scooters_by_status,
        total_scooters=total_scooters,
        active_rentals=active_rentals,
        average_battery_level=average_battery_level,
    )
