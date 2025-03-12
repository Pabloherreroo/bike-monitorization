# Sistema de Administración y Monitorización de Bicicletas Sensorizadas

Este sistema permite la administración y monitorización en tiempo real de bicicletas equipadas con sensores. La aplicación ofrece un panel de control intuitivo donde los usuarios pueden visualizar datos clave sobre el uso y estado de las bicicletas, con mapas e indicadores que aportan información relevante.

- **Backend**: FastAPI (Python) para recibir datos de los sensores y manejar la autenticación de usuarios.
- **Frontend**: React (Vite) para ofrecer una interfaz moderna y responsive.
- **Otros**: Todavía no se han establecido la BD ni cómo se hará la transmisión en tiempo real de datos.

## Ejecución
### 1. Configuración del Backend (FastAPI)
```sh
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### 2. Configuración del Frontend (React)
```sh
cd frontend
npm install
npm run dev
```

Se pretende Dockerizar el proyecto en una etapa posterior, al igual que implementarlo a través de alguna plataforma para que la web esté disponible online.
