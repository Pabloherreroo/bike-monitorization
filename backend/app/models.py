from sqlalchemy import Column, Integer, String, Float, TIMESTAMP, CheckConstraint, ForeignKey
from app.database import Base
from sqlalchemy.sql import func

class Bike(Base):
    __tablename__ = "bikes"
    id = Column(Integer, primary_key=True, index=True)
    bike_id = Column(String, unique=True, nullable=False)
    estado = Column(String(20), nullable=False)
    fecha_registro = Column(TIMESTAMP(timezone=True), server_default=func.now())

class BikeData(Base):
    __tablename__ = "bike_data"
    bike_id = Column(String, ForeignKey("bikes.bike_id"), primary_key=True, nullable=False)
    fecha = Column(TIMESTAMP(timezone=True), primary_key=True, nullable=False)
    latitud = Column(Float, nullable=False)
    longitud = Column(Float, nullable=False)
    puntuacion_road = Column(Integer, nullable=False)
    calidad_ambiental = Column(Integer, nullable=False)
    ruido = Column(Integer, nullable=False)
    barrio = Column(String)

    __table_args__ = (
        CheckConstraint("puntuacion_road >= 1 AND puntuacion_road <= 4", name="check_puntuacion_road"),
        CheckConstraint("calidad_ambiental >= 0 AND calidad_ambiental <= 100", name="check_calidad_ambiental"),
        CheckConstraint("ruido >= 0 AND ruido <= 120", name="check_ruido"),
    )


