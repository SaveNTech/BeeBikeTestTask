from pydantic import BaseModel


class AnalyticsSummary(BaseModel):
    scooters_by_status: dict[str, int]
    total_scooters: int
    active_rentals: int
    average_battery_level: float
