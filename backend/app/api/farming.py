from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.orm import Session
from backend.app.database.db import get_db
from backend.app.database.models import Reminder, FarmActivity
from backend.app.services.market_service import market_service
from backend.app.services.weather_service import weather_service

router = APIRouter(prefix="/farming", tags=["Farming Operations"])

class ReminderCreate(BaseModel):
    title: str
    description: Optional[str] = None
    crop: Optional[str] = None
    scheduled_date: str
    scheduled_time: Optional[str] = "08:00 AM"
    language: Optional[str] = "te"

class ActivityCreate(BaseModel):
    activity_type: str
    crop: str
    field_name: Optional[str] = "Main Plot"
    notes: Optional[str] = None
    expense_amount: Optional[float] = 0.0

@router.get("/reminders")
def get_reminders(db: Session = Depends(get_db)):
    reminders = db.query(Reminder).order_by(Reminder.created_at.desc()).all()
    # Pre-populate sample if empty
    if not reminders:
        sample = Reminder(
            title="పొలంలో యూరియా ఎరువులు వేయుట",
            description="వరి చేలో రెండో దఫా నత్రజని ఎరువుల యాజమాన్యం",
            crop="వరి (Paddy)",
            scheduled_date="రేపు (Tomorrow)",
            scheduled_time="08:00 AM",
            status="pending",
            is_confirmed=True,
            language="te"
        )
        db.add(sample)
        db.commit()
        db.refresh(sample)
        reminders = [sample]
    return reminders

@router.post("/reminders")
def create_reminder(req: ReminderCreate, db: Session = Depends(get_db)):
    rem = Reminder(
        title=req.title,
        description=req.description,
        crop=req.crop,
        scheduled_date=req.scheduled_date,
        scheduled_time=req.scheduled_time,
        language=req.language,
        status="pending",
        is_confirmed=True
    )
    db.add(rem)
    db.commit()
    db.refresh(rem)
    return rem

@router.patch("/reminders/{reminder_id}/complete")
def complete_reminder(reminder_id: int, db: Session = Depends(get_db)):
    rem = db.query(Reminder).filter(Reminder.id == reminder_id).first()
    if not rem:
        raise HTTPException(status_code=404, detail="Reminder not found")
    rem.status = "completed"
    db.commit()
    db.refresh(rem)
    return rem

@router.get("/market")
def get_market_rates():
    return market_service.get_all_rates()

@router.get("/weather")
def get_weather_advisories():
    return weather_service.get_all_advisories()

@router.get("/activities")
def get_activities(db: Session = Depends(get_db)):
    acts = db.query(FarmActivity).order_by(FarmActivity.created_at.desc()).all()
    if not acts:
        sample = FarmActivity(
            activity_type="Spraying / మందుల పిచికారీ",
            crop="టమాటా (Tomato)",
            field_name="ఉత్తరం చేను (North Field)",
            notes="తెల్లదోమ నివారణకు వేప నూనె పిచికారీ చేసాము.",
            expense_amount=450.0
        )
        db.add(sample)
        db.commit()
        db.refresh(sample)
        acts = [sample]
    return acts

@router.post("/activities")
def log_activity(req: ActivityCreate, db: Session = Depends(get_db)):
    act = FarmActivity(
        activity_type=req.activity_type,
        crop=req.crop,
        field_name=req.field_name,
        notes=req.notes,
        expense_amount=req.expense_amount
    )
    db.add(act)
    db.commit()
    db.refresh(act)
    return act
