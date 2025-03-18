from pydantic import BaseModel
from datetime import datetime

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

class BikeDataBase(BaseModel):
    bike_id: str
    latitud: float
    longitud: float
    puntuacion_road: int
    calidad_ambiental: int
    ruido: int
    barrio: str = None
    fecha: datetime

class BikeDataCreate(BikeDataBase):
    pass

class BikeData(BikeDataBase):
    bike_id: str
    fecha: datetime

    class Config:
        orm_mode = True

