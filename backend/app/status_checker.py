import time
import threading
from app.utils import check_bikes_status

# Bucle continuo para verificar estado cada 1s
def run_status_checker(db_getter):
    while True:
        db = next(db_getter())
        try:
            check_bikes_status(db)
        except Exception as e:
            print(f"Error al actualizar el estado de las bicicletas: {str(e)}")
        finally:
            db.close()
        time.sleep(1)

# Inicia el verificador de estado, se llama al iniciar
def start_status_checker(app, db_getter):
    status_thread = threading.Thread(
        target=run_status_checker,
        args=(db_getter,),
        daemon=True
    )
    status_thread.start()
    print("Verificador de estado iniciado en segundo plano")
    