from pydantic import BaseModel
from datetime import datetime
from typing import Optional

# Modelos pydantic para validación de datos
class BikeBase(BaseModel):
    bike_id: str
    estado: str

class BikeCreate(BikeBase):
    pass

class Bike(BikeBase):
    id: int
    fecha_registro: datetime

    class Config:
        orm_mode = True
        from_attributes = True

class BikeDataBase(BaseModel):
    bike_id: str
    latitud: float
    longitud: float
    puntuacion_road: int
    calidad_ambiental: Optional[int] = None 
    temperatura: float
    humedad: int
    presion: int
    ruido: int
    luz: int
    barrio: Optional[str] = None
    fecha: datetime

class BikeDataCreate(BikeDataBase):
    pass

class BikeData(BikeDataBase):
    bike_id: str
    fecha: datetime

    class Config:
        orm_mode = True
        from_attributes = True

