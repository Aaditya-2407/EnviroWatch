from pydantic import BaseModel, Field, validator
from typing import Optional, Literal


class PredictPayload(BaseModel):
    Location: str
    MinTemp: float
    MaxTemp: float
    Rainfall: float
    Evaporation: Optional[float] = None
    Sunshine: Optional[float] = None
    WindGustDir: Optional[str] = None
    WindGustSpeed: Optional[float] = None
    WindDir9am: Optional[str] = None
    WindDir3pm: Optional[str] = None
    WindSpeed9am: Optional[float] = None
    WindSpeed3pm: Optional[float] = None
    Humidity9am: Optional[float] = None
    Humidity3pm: Optional[float] = None
    Pressure9am: Optional[float] = None
    Pressure3pm: Optional[float] = None
    Cloud9am: Optional[float] = None
    Cloud3pm: Optional[float] = None
    Temp9am: Optional[float] = None
    Temp3pm: Optional[float] = None
    RainToday: Optional[Literal["Yes", "No"]] = "No"
    Date_month: int = Field(..., ge=1, le=12)
    Date_day: int = Field(..., ge=1, le=31)

    @validator("Location")
    def location_not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError("Location cannot be empty")
        return v
