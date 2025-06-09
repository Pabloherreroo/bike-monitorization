from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from fastapi import Query
from app import models, schemas, utils
from app.database import get_db
import subprocess
import os
import re
from datetime import datetime, timezone, timedelta

def normalizar_fecha(fecha_str):
    try:
        fecha = datetime.fromisoformat(fecha_str)
        if fecha.tzinfo is None:
            # No tiene zona → asumir +2
            tz_plus_2 = timezone(timedelta(hours=2))
            fecha = fecha.replace(tzinfo=tz_plus_2)
        else:
            # Convertir a +2 si tiene otra zona
            fecha = fecha.astimezone(timezone(timedelta(hours=2)))
        return fecha
    except:
        return datetime.now(timezone(timedelta(hours=2)))

router = APIRouter()

# Endpoint para importar desde firebase, hace todas las validaciones e inserta a BD
@router.post("/importar_firebase", response_model=dict)
def importar_datos_desde_firebase(db: Session = Depends(get_db)):
    import requests

    FIREBASE_URL = "https://bicicletas-sensorizadas-default-rtdb.europe-west1.firebasedatabase.app/bike_data.json"

    try:
        response = requests.get(FIREBASE_URL)
        response.raise_for_status()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"No se pudo acceder a Firebase: {str(e)}")

    datos_firebase = response.json()

    if not datos_firebase:
        return {"mensaje": "No hay datos en Firebase"}

    insertados = 0
    ignorados = 0

    for key, data in datos_firebase.items():
        # Convertir fecha a objeto datetime si viene en string
        if isinstance(data.get("fecha"), str):
            data["fecha"] = normalizar_fecha(data["fecha"])

        # Comprobar si ya existe este dato (por bike_id y fecha)
        existe = db.query(models.BikeData).filter_by(
            bike_id=data["bike_id"],
            fecha=data["fecha"]
        ).first()

        if existe:
            ignorados += 1
            continue

        if not data.get("barrio"):
            data["barrio"] = utils.obtener_barrio(data["latitud"], data["longitud"])

        if not data.get("calidad_ambiental"):
            data["calidad_ambiental"] = utils.calcular_calidad_amb(
                data["temperatura"],
                data["humedad"],
                data["presion"]
            )

        bike = db.query(models.Bike).filter_by(bike_id=data["bike_id"]).first()
        if not bike:
            bike = models.Bike(bike_id=data["bike_id"], estado="en funcionamiento")
            db.add(bike)
            db.commit()
            db.refresh(bike)
        else:
            bike.estado = "en funcionamiento"
            db.commit()

        utils.register_bike_update(data["bike_id"])

        nuevo_dato = models.BikeData(**data)
        db.add(nuevo_dato)
        try:
            db.commit()
            db.refresh(nuevo_dato)
            insertados += 1
            try:
                del_data = requests.delete(f"{FIREBASE_URL.rstrip('.json')}/{key}.json")
                del_data.raise_for_status()
            except Exception as e:
                print(f"No se pudo borrar el dato de Firebase: {key} - {e}")    
        except Exception as e:
            db.rollback()
            print(f"Error al insertar un dato: {e}")
            ignorados += 1

    return {
        "mensaje": "Importación completada",
        "datos_insertados": insertados,
        "datos_ignorados": ignorados
    }


# Consultas para front: En bike_data meto un parámetro desde para no mandar siempre todos los datos
@router.get("/bike_data", response_model=list[schemas.BikeData])
def obtener_bike_data(
    db: Session = Depends(get_db),
    desde: str = Query(None)
):
    if desde:
        try:
            timestamp_limpio = re.sub(r'\.\d+', '', desde.replace('Z', '+00:00'))
            fecha_desde = datetime.fromisoformat(timestamp_limpio)
        except ValueError as e:
            print(f"Error parsing timestamp: {desde}, error: {e}")
            raise HTTPException(status_code=400, detail=f"Formato de fecha inválido: {desde}")
        datos = (
            db.query(models.BikeData)
            .filter(models.BikeData.fecha >= fecha_desde)
            .order_by(models.BikeData.fecha)
            .all()
        )
    else:
        datos = db.query(models.BikeData).order_by(models.BikeData.fecha).all()
    return datos


@router.get("/bikes", response_model=list[schemas.Bike])
def obtener_bikes(db: Session = Depends(get_db)):
    bikes = db.query(models.Bike).all()
    return bikes


# FUNCIONALIDADES AVANZADAS --> TEST DINÁMICO
# Ejecución de test dinámico desde el botón del front
script_path = os.path.join(os.path.dirname(__file__), "..", "test_data", "realtime_test.py")
@router.post("/test_dinamico")
def ejecutar_test_dinamico():
    try:
        subprocess.run(["python3", script_path], check=True)
        return {"mensaje": "Script ejecutado correctamente"}
    except subprocess.CalledProcessError as e:
        return {"detalle": f"Error al ejecutar script: {e}"}

# Borrado de datos dinámicos desde el botón del front
@router.delete("/borrar_b2")
def borrar_datos_b2(db: Session = Depends(get_db)):
    eliminados = db.query(models.BikeData).filter(models.BikeData.bike_id == "B2").delete()
    bici_eliminada = db.query(models.Bike).filter(models.Bike.bike_id == "B2").delete()
    db.commit()
    return {"mensaje": f"Eliminados {eliminados} registros de la bici B2", "bici_eliminada": bool(bici_eliminada)}

