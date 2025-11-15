# utils/aqi_calc.py
# Convert PM2.5 / PM10 concentrations -> approximate AQI using EPA breakpoints.
# This is adequate for demonstration; for strict Indian AQI use CPCB breakpoints.

PM25_BREAKPOINTS = [
    (0.0, 12.0, 0, 50),
    (12.1, 35.4, 51, 100),
    (35.5, 55.4, 101, 150),
    (55.5, 150.4, 151, 200),
    (150.5, 250.4, 201, 300),
    (250.5, 350.4, 301, 400),
    (350.5, 500.4, 401, 500),
]

PM10_BREAKPOINTS = [
    (0, 54, 0, 50),
    (55, 154, 51, 100),
    (155, 254, 101, 150),
    (255, 354, 151, 200),
    (355, 424, 201, 300),
    (425, 504, 301, 400),
    (505, 604, 401, 500),
]

def _interp(C, Clow, Chigh, Ilow, Ihigh):
    return ((Ihigh - Ilow)/(Chigh - Clow))*(C - Clow) + Ilow

def aqi_from_pm25(pm25):
    if pm25 is None: return None
    for Clow, Chigh, Ilow, Ihigh in PM25_BREAKPOINTS:
        if Clow <= pm25 <= Chigh:
            return round(_interp(pm25, Clow, Chigh, Ilow, Ihigh))
    return None

def aqi_from_pm10(pm10):
    if pm10 is None: return None
    for Clow, Chigh, Ilow, Ihigh in PM10_BREAKPOINTS:
        if Clow <= pm10 <= Chigh:
            return round(_interp(pm10, Clow, Chigh, Ilow, Ihigh))
    return None

def combined_aqi(pm25, pm10):
    a1 = aqi_from_pm25(pm25)
    a2 = aqi_from_pm10(pm10)
    candidates = [x for x in (a1, a2) if x is not None]
    return max(candidates) if candidates else None
