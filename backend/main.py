import threading
import time
import requests
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import endpoints
from app.database import get_db
from app.status_checker import start_status_checker

app = FastAPI()

# Configuración de CORS para que React se comunique
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir rutas
app.include_router(endpoints.router)

# Llamada a endpoint de importación de datos
def importar_datos_periodicamente():
    while True:
        try:
            response = requests.post("http://localhost:8000/importar_firebase")
            if response.status_code == 200:
                print(f"Datos importados exitosamente: {response.json()}")
            else:
                print(f"Error en la importación: {response.status_code}")
        except Exception as e:
            print(f"Error al hacer la petición: {e}")

        time.sleep(1)

@app.on_event("startup")
def startup_event():
    # Check de status e importación de firebase en hilos distintos
    start_status_checker(app, get_db)
    thread_import = threading.Thread(target=importar_datos_periodicamente, daemon=True)
    thread_import.start()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000)