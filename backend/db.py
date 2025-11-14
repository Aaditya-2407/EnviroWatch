from sqlalchemy import create_engine, Column, Integer, Float, Text, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import datetime, os

BASE = declarative_base()
DB_PATH = os.path.join(os.path.dirname(__file__), "envirowatch.db")
ENGINE = create_engine(f"sqlite:///{DB_PATH}", connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=ENGINE)
db_session = SessionLocal()

class Prediction(BASE):
    __tablename__ = "predictions"
    id = Column(Integer, primary_key=True, index=True)
    input_json = Column(Text)
    predicted_value = Column(Float)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

def db_init():
    BASE.metadata.create_all(bind=ENGINE)
