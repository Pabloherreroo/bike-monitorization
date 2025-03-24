from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from app import models, schemas, utils
from app.database import get_db

router = APIRouter()

# Consultas a servidor, almaceno los ultimos tiempos de cada bici en utils.py
@router.post("/bike_data", response_model=schemas.BikeData)
def crear_bike_data(data: schemas.BikeDataCreate, db: Session = Depends(get_db)):
    if not hasattr(data, 'fecha') or data.fecha is None:
        data.fecha = datetime.now()
    if not data.barrio:
        data.barrio = utils.obtener_barrio(data.latitud, data.longitud)
    
    if not data.barrio or data.barrio == "Fuera de Bilbao":
        raise HTTPException(status_code=400, detail="La ubicación no pertenece a Bilbao, no se almacena.")

    # Crear bike si no existe
    bike = db.query(models.Bike).filter(models.Bike.bike_id == data.bike_id).first()
    if not bike:
        bike = models.Bike(bike_id=data.bike_id, estado="en funcionamiento")
        db.add(bike)
        db.commit()
        db.refresh(bike)
    else:
        # Si existe, en funcionamiento
        bike.estado = "en funcionamiento"
        db.commit()
    
    utils.register_bike_update(data.bike_id)
    
    bike_data = models.BikeData(**data.model_dump())
    
    db.add(bike_data)
    try:
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Error al insertar los datos: {str(e)}")
    
    db.refresh(bike_data)
    return bike_data

# Consultas para front
@router.get("/bike_data", response_model=list[schemas.BikeData])
def obtener_bike_data(db: Session = Depends(get_db)):
    datos = db.query(models.BikeData).all()
    return datos

@router.get("/bikes", response_model=list[schemas.Bike])
def obtener_bikes(db: Session = Depends(get_db)):
    bikes = db.query(models.Bike).all()
    return bikes

 
