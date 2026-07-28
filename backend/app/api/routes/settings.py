from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.settings import AppSettings
from app.schemas.settings import SettingsRead, SettingsUpdate

router = APIRouter()


def get_or_create_settings(db: Session) -> AppSettings:
    settings_row = db.get(AppSettings, 1)
    if settings_row is None:
        settings_row = AppSettings(id=1)
        db.add(settings_row)
        db.commit()
        db.refresh(settings_row)
    return settings_row


@router.get("", response_model=SettingsRead)
def read_settings(db: Session = Depends(get_db), _current_user=Depends(get_current_user)):
    return get_or_create_settings(db)


@router.put("", response_model=SettingsRead)
def update_settings(
    payload: SettingsUpdate,
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
):
    settings_row = get_or_create_settings(db)
    settings_row.price_per_minute = payload.price_per_minute
    db.add(settings_row)
    db.commit()
    db.refresh(settings_row)
    return settings_row
