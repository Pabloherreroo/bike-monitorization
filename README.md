# Sistema de Administración y Monitorización de Bicicletas Sensorizadas

Este sistema permite la administración y monitorización en tiempo real de bicicletas equipadas con sensores. La aplicación ofrece un panel de control intuitivo donde los usuarios pueden visualizar datos clave sobre el uso y estado de las bicicletas, con mapas e indicadores que aportan información relevante.

- **Backend**: FastAPI (Python) para recibir datos de los sensores y manejar la autenticación de usuarios.
- **Frontend**: React (Vite) para ofrecer una interfaz moderna y responsive.
- **Base de datos**: PostgreSQL con la extensión TimescaleDB para el almacenamiento eficiente de series temporales de datos provenientes de los sensores.
- **Carpeta "extra"**: Contiene los datos de prueba recogidos por Bilbao, además del script utilizado para convertirlos a SQL modificando algunos de sus valores por franjas temporales.

## 🎥 Demo del proyecto
[Enlace al video demo en YouTube](https://youtu.be/I31GYJfvUPA)

## Deployment con Render
Se puede acceder a la interfaz de la página web en el siguiente dominio:
https://frontend-f226.onrender.com  
El servidor backend se encuentra en: https://backend-hxfg.onrender.com  

## Ejecución con Docker
El proyecto está completamente dockerizado para facilitar su despliegue. Para ejecutar el sistema completo:
```sh
docker-compose up --build
```
Esto inicia:
- Base de datos PostgreSQL/TimescaleDB en el puerto 5432
- Servicio de backend (FastAPI) en el puerto 8000
- Interfaz de frontend (React/Vite) en el puerto 80


## Ejecución Manual
### 1. Configuración de la Base de Datos
```sh
psql -U postgres -f bike-monitorization\db\init.sql
psql -U postgres -d bicicleta_data -f bike-monitorization\db\populate.sql
```

### 2. Configuración del Backend
```sh
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### 3. Configuración del Frontend
```sh
cd frontend
npm install
npm run dev
```
