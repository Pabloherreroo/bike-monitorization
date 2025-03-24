from fastapi import FastAPI
from app.api import endpoints
from fastapi.middleware.cors import CORSMiddleware
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

@app.on_event("startup")
def startup_event():
    start_status_checker(app, get_db)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)