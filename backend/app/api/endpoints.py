from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models, schemas, utils
from app.database import get_db

router = APIRouter()

# Consultas a servidor -> A CAMBIAR
@router.post("/bike_data", response_model=schemas.BikeData)
def crear_bike_data(data: schemas.BikeDataCreate, db: Session = Depends(get_db)):
    # Si el campo 'barrio' viene vacío o hay que recalcularlo (igual aplica a mas campos):
    data.barrio = utils.obtener_barrio(data.latitud, data.longitud)
    
    # Aquí se podría verificar si la bici existe, o crearla si no existe
    bike = db.query(models.Bike).filter(models.Bike.bike_id == data.bike_id).first()
    if not bike:
        # Ejemplo: se podría crear una entrada en la tabla bikes
        bike = models.Bike(bike_id=data.bike_id, estado="en funcionamiento")
        db.add(bike)
        db.commit()
        db.refresh(bike)
    
    bike_data = models.BikeData(**data.dict())
    db.add(bike_data)
    try:
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail="Error al insertar los datos")
    db.refresh(bike_data)
    return bike_data

# Consultas para front
@router.get("/bike_data", response_model=list[schemas.BikeData])
def obtener_bike_data(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    datos = db.query(models.BikeData).offset(skip).limit(limit).all()
    return datos

@router.get("/bikes", response_model=list[schemas.Bike])
def obtener_bikes(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    bikes = db.query(models.Bike).offset(skip).limit(limit).all()
    return bikes

 
