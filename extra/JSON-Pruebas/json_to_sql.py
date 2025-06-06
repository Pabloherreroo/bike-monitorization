import json
import sys, os
from shapely.geometry import Point, Polygon
from datetime import datetime
from datetime import datetime, timedelta, timezone
from dateutil.relativedelta import relativedelta

barrios = {
    "Deusto": Polygon([
        (43.290035, -2.971212), # Ría - Limite Erandio
        (43.285393, -2.967987), # Ría - Pasado el saliente de Zorrotza
        (43.277668, -2.969207), # Ría - Izquierda de Zorrotzaure Arriba
        (43.272494, -2.965932), # Ría- Medio Zorrotzaure
        (43.265268, -2.958146), # Ría- Sur Zorrotzaure
        (43.266341, -2.950248), # Ría- Esquina Zorrotzaure
        (43.269465, -2.940549), # Ría - Puente de Deusto
        (43.269901, -2.935919), # Ría - Pasada la Universidad
        (43.278645, -2.932099), # Pikotamendi
        (43.279786, -2.943152), # Este Diseminado Deusto
        (43.284369, -2.948302), # Norte Diseminado Deusto
        (43.287285, -2.947314), # Mas al Norte (Monte San Bernabé)
        (43.289065, -2.951008), # Un poco al Oeste (Monte San Bernabé)
        (43.285429, -2.960217) # Desguaces y gruas Deusto SL 
        # Cierra automaticamente al primer punto
    ]),
    "Basurto-Zorroza": Polygon([
        (43.290035, -2.971212), # Ría - Limite Erandio
        (43.285393, -2.967987), # Ría - Pasado el saliente de Zorrotza
        (43.277668, -2.969207), # Ría - Izquierda de Zorrotzaure Arriba
        (43.272494, -2.965932), # Ría- Medio Zorrotzaure
        (43.265268, -2.958146), # Ría- Sur Zorrotzaure
        (43.266341, -2.950248), # Ría- Esquina Zorrotzaure
        (43.265612, -2.948958), # San Mamés
        (43.265591, -2.945924), # Sagrado Corazón
        (43.264938, -2.945227), # Sagrado Corazón
        (43.260592, -2.947029), # Av del Ferrocarril
        (43.259362, -2.946310), # Av del Ferrocarril
        (43.257854, -2.946085), # Av del Ferrocarril - Autonomía
        (43.256529, -2.945828), # Av del Ferrocarril
        (43.254780, -2.944315), # Rotonda Ametzola
        (43.256069, -2.950430), # Autovía del Cantábrico 
        (43.252535, -2.949910), # Calle Altube
        (43.234514, -2.973065), # Vertedero Artigas
        (43.245925, -2.985306), # Alonsótegui 
        (43.258956, -2.970445), # Rio Cadagua hasta el final
        (43.264268, -2.976001),
        (43.266628, -2.973095),
        (43.273295, -2.977309),
        (43.276373, -2.976294),
        (43.278381, -2.977179),
        (43.281733, -2.974018),
        (43.281733, -2.974018)
    ]),
    "Rekalde": Polygon([
        (43.257854, -2.946085), # Av del Ferrocarril - Autonomía
        (43.256529, -2.945828), # Av del Ferrocarril
        (43.254780, -2.944315), # Rotonda Ametzola
        (43.256069, -2.950430), # Autovía del Cantábrico 
        (43.252535, -2.949910), # Calle Altube
        (43.234514, -2.973065), # Vertedero Artigas
        (43.219052, -2.947397), # Pagasarri
        (43.242096, -2.940597), # Calle Larraskitu
        (43.242962, -2.937163), # Calle Larraskitu
        (43.242023, -2.933011), # Calle Larraskitu
        (43.244696, -2.931362), # Autovía del Cantábrico
        (43.246967, -2.933529), # Autovía del Cantábrico
        (43.247997, -2.936423), # Autovía del Cantábrico
        (43.255941, -2.933199), # Plaza Zabalburu
        (43.257268, -2.934631) # Plaza Zabalburu - Autonomía
    ]),
    "Ibaiondo": Polygon([
        (43.219052, -2.947397), # Pagasarri
        (43.242096, -2.940597), # Calle Larraskitu
        (43.242962, -2.937163), # Calle Larraskitu
        (43.242023, -2.933011), # Calle Larraskitu
        (43.244696, -2.931362), # Autovía del Cantábrico
        (43.246967, -2.933529), # Autovía del Cantábrico
        (43.247997, -2.936423), # Autovía del Cantábrico
        (43.255941, -2.933199), # Plaza Zabalburu
        (43.257113, -2.932283), # Calle San Francisco
        (43.257306, -2.931337), # Calle Particular del Nte.
        (43.257354, -2.929482), # Calle de Bailén
        (43.260494, -2.925580), # Puente del Arenal
        (43.260248, -2.925086), # Ría - Puente del Arenal
        (43.263238, -2.923701), # Ría - Puente del Ayuntamiento
        (43.264950, -2.920876), # Av. Zumalakarregi
        (43.264466, -2.917024), # Plaza Músico Guridi
        (43.261677, -2.915727), # Rotonda Parque Etxebarria
        (43.260250, -2.919548), # Bo. La Cruz
        (43.257261, -2.915884), # Calle Prim
        (43.257432, -2.914015), # Calle Prim
        (43.255153, -2.913730), # Metro Santutxu
        (43.254622, -2.914755), # Calle Zabalbide
        (43.255302, -2.918781), # Calle Zabalbide
        (43.253138, -2.917108), # Calle Fika
        (43.251314, -2.918121), # Calle Marcelino Menéndez y Pelayo
        (43.251369, -2.920568), # Calle Ollerías Bajas
        (43.250868, -2.921677), # Ría
        (43.246482, -2.920778), # Ría
        (43.244198, -2.923206), # Ría
        (43.242430, -2.921734), # Ría
        (43.242368, -2.920811), # Ría - La Peña
        (43.226104, -2.905854), # Brisketa Auzoa
        (43.219514, -2.909920), # AP-68
        (43.213853, -2.929098) # Cerca del Pagasarri
    ]),
    "Begoña": Polygon([
        (43.261677, -2.915727), # Rotonda Parque Etxebarria
        (43.260250, -2.919548), # Bo. La Cruz
        (43.257261, -2.915884), # Calle Prim
        (43.257432, -2.914015), # Calle Prim
        (43.255153, -2.913730), # Metro Santutxu
        (43.254622, -2.914755), # Calle Zabalbide
        (43.255302, -2.918781), # Calle Zabalbide
        (43.253138, -2.917108), # Calle Fika
        (43.251314, -2.918121), # Calle Marcelino Menéndez y Pelayo
        (43.251369, -2.920568), # Calle Ollerías Bajas
        (43.250868, -2.921677), # Ría
        (43.246482, -2.920778), # Ría
        (43.244198, -2.923206), # Ría
        (43.242430, -2.921734), # Ría
        (43.242368, -2.920811), # Ría - La Peña
        (43.246072, -2.912740), # Ría
        (43.245426, -2.904531), # Ría
        (43.253390, -2.894619), # Ría
        (43.253043, -2.890463), # Ría - Leguizamón
        (43.253414, -2.889646), # N-634
        (43.254563, -2.892897), # N-634
        (43.249544, -2.903259), # Av. Zumarkalegi
        (43.249797, -2.905623), # Av. Zumarkalegi
        (43.258288, -2.912924), # Túnel Av. Zumarkalegi
        (43.258292, -2.911582), # Calle Zabalbide
        (43.259121, -2.913206) # Basílica de Nuestra Señora de Begoña
    ]),
    "Otxarkoaga-Txurdinaga": Polygon([
        (43.253414, -2.889646), # N-634
        (43.254563, -2.892897), # N-634
        (43.249544, -2.903259), # Av. Zumarkalegi
        (43.249797, -2.905623), # Av. Zumarkalegi
        (43.258288, -2.912924), # Túnel Av. Zumarkalegi
        (43.258292, -2.911582), # Calle Zabalbide
        (43.259114, -2.912378), # Calle Zabalbide
        (43.261103, -2.911446), # Arabella
        (43.265350, -2.904899), # BI-631
        (43.264914, -2.908508), # BI-631
        (43.269908, -2.906774), # BI-631
        (43.270737, -2.902366), # 'La curva del amor'
        (43.265173, -2.880211) # Hospital Santa Marina
    ]),
    "Uribarri": Polygon([
        (43.258292, -2.911582), # Calle Zabalbide
        (43.259114, -2.912378), # Calle Zabalbide
        (43.261103, -2.911446), # Arabella
        (43.265350, -2.904899), # BI-631
        (43.264914, -2.908508), # BI-631
        (43.269908, -2.906774), # BI-631
        (43.270737, -2.902366), # 'La curva del amor'
        (43.277396, -2.898470), # BI-631 hacia Zamudio
        (43.285844, -2.910048), # Artxanda
        (43.285829, -2.917083), # Artxanda
        (43.273812, -2.917705), # Polideportivo Artxanda
        (43.278645, -2.932099), # Pikotamendi
        (43.269901, -2.935919), # Ría - Pasada la Universidad
        (43.269393, -2.931882), # Ría- Puente de la Salve
        (43.263238, -2.923701), # Ría - Puente del Ayuntamiento
        (43.264950, -2.920876), # Av. Zumalakarregi
        (43.264466, -2.917024), # Plaza Músico Guridi
        (43.261677, -2.915727), # Rotonda Parque Etxebarria
        (43.259121, -2.913206) # Basílica de Nuestra Señora de Begoña
    ]),
    "Abando": Polygon([
        (43.269901, -2.935919), # Ría - Pasada la Universidad
        (43.269393, -2.931882), # Ría- Puente de la Salve
        (43.263238, -2.923701), # Ría - Puente del Ayuntamiento
        (43.260248, -2.925086), # Ría - Puente del Arenal
        (43.260494, -2.925580), # Puente del Arenal
        (43.257354, -2.929482), # Calle de Bailén
        (43.257306, -2.931337), # Calle Particular del Nte.
        (43.257113, -2.932283), # Calle San Francisco
        (43.255941, -2.933199), # Plaza Zabalburu
        (43.257268, -2.934631), # Plaza Zabalburu - Autonomía
        (43.257854, -2.946085), # Av del Ferrocarril - Autonomía
        (43.257854, -2.946085), # Av del Ferrocarril - Autonomía
        (43.259362, -2.946310), # Av del Ferrocarril
        (43.260592, -2.947029), # Av del Ferrocarril
        (43.264938, -2.945227), # Sagrado Corazón
        (43.265591, -2.945924), # Sagrado Corazón
        (43.265612, -2.948958), # San Mamés
        (43.266341, -2.950248), # Ría- Esquina Zorrotzaure
        (43.269465, -2.940549) # Ría - Puente de Deusto
    ]),
}

def obtener_barrio(latitud, longitud):
    punto = Point(latitud, longitud)
    for nombre_barrio, poligono in barrios.items():
        if poligono.contains(punto):
            return nombre_barrio
    return "Fuera de Bilbao"

last_update_times = {}

def score_variable(value, ideal_min, ideal_max, limit_min, limit_max):
    if value < ideal_min:
        return max(0, (value - limit_min) / (ideal_min - limit_min))
    elif value > ideal_max:
        return max(0, (limit_max - value) / (limit_max - ideal_max))
    if ideal_min <= value <= ideal_max:
        return 1.0  # dentro del rango ideal
    else:
        return 0.0  # condiciones muy extremas

def calcular_calidad_amb(temperatura, humedad, presion):
    PARAMETROS = {
        'temp': {'ideal_min': 20.0, 'ideal_max': 23.0, 'limit_min': -5.0, 'limit_max': 45.0, 'peso': 0.55},
        'hum': {'ideal_min': 40.0, 'ideal_max': 60.0, 'limit_min': 0.0, 'limit_max': 100.0, 'peso': 0.35},
        'pres': {'ideal_min': 1010.0, 'ideal_max': 1020.0, 'limit_min': 980.0, 'limit_max': 1040.0, 'peso': 0.1}
    }
    # Calcular puntajes
    score_temp = score_variable(temperatura, **{k: PARAMETROS['temp'][k] for k in ['ideal_min', 'ideal_max', 'limit_min', 'limit_max']})
    score_hum = score_variable(humedad, **{k: PARAMETROS['hum'][k] for k in ['ideal_min', 'ideal_max', 'limit_min', 'limit_max']})
    score_pres = score_variable(presion, **{k: PARAMETROS['pres'][k] for k in ['ideal_min', 'ideal_max', 'limit_min', 'limit_max']})
    
    # Calcular índice ponderado
    indice = (PARAMETROS['temp']['peso'] * score_temp + PARAMETROS['hum']['peso'] * score_hum + PARAMETROS['pres']['peso'] * score_pres)
    return round(indice * 100)

from datetime import datetime, timedelta
import json

def generar_sql(input_json_path):
    with open(input_json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    registros = []

    # Definir franjas horarias: Límites, nuevo ID, días que le quito, temperatura y humedad
    franjas = [
        ("19:16", "19:24", 'BP4', None, 0, 0),
        ("19:24", "19:32", 'BP5', 10, 3, -15),
        ("19:32", "19:41", 'BP6', 50, -7, 5),
        ("19:41", "19:49", 'BP7', 17, -5, 15),
        ("19:49", "19:57", 'BP8', None, 0, 0),
        ("19:57", "20:08", 'BP9', 35, 5, 10),
    ]

    def obtener_franja_bike_id(hora):
        for inicio, fin, bike_id, dias, ajuste_temp, ajuste_hum in franjas:
            if datetime.strptime(inicio, "%H:%M").time() <= hora < datetime.strptime(fin, "%H:%M").time():
                return bike_id, dias, ajuste_temp, ajuste_hum
        return 'BP1', None, 0, 0  # por si acaso

    for _, entidad in data["bike_data"].items():
        fecha_str = entidad.get("fecha")
        if isinstance(fecha_str, str):
            try:
                fecha = datetime.fromisoformat(fecha_str)
            except:
                fecha = datetime.now()
        else:
            fecha = datetime.now()

        hora = fecha.time()
        bike_id, dias_retroceso, ajustar_temperatura, ajustar_humedad = obtener_franja_bike_id(hora)

        if dias_retroceso is not None:
            nueva_fecha = datetime.now().date() - timedelta(days=dias_retroceso)
            fecha = fecha.replace(year=nueva_fecha.year, month=nueva_fecha.month, day=nueva_fecha.day)


        temperatura = round(entidad.get('temperatura', 0) + ajustar_temperatura, 1)
        humedad = int(entidad.get('humedad', 0) + ajustar_humedad)
        presion = int(entidad.get('presion', 0))
        latitud = round(entidad.get('latitud', 0), 6)
        longitud = round(entidad.get('longitud', 0), 6)
        ruido = int(entidad.get('ruido', 0))
        luz = max(int(entidad.get('luz', 0)), 0)
        road = int(entidad.get('puntuacion_road', 0))

        barrio = obtener_barrio(latitud, longitud)
        calidad = calcular_calidad_amb(temperatura, humedad, presion)

        tz_plus_2 = timezone(timedelta(hours=2))
        fecha = fecha.replace(tzinfo=tz_plus_2)
        fecha_str_sql = fecha.isoformat()  # correcto para insertar

        registros.append(
            f"('{bike_id}', {latitud}, {longitud}, {road}, {calidad}, {temperatura}, {humedad}, {presion}, {ruido}, {luz}, '{barrio}', '{fecha_str_sql}')"
        )

    if not registros:
        return "-- No se encontraron registros."

    insert_sql = (
        "INSERT INTO bike_data (bike_id, latitud, longitud, puntuacion_road, calidad_ambiental, temperatura, humedad, presion, ruido, luz, barrio, fecha) VALUES\n"
        + ",\n".join(registros) + ";"
    )

    return insert_sql

def guardar_resultado(resultado, base_name="results"):
    i = 0
    while True:
        filename = f"{base_name}{i if i > 0 else ''}.txt"
        if not os.path.exists(filename):
            with open(filename, "w", encoding="utf-8") as f:
                f.write(resultado)
            print(f"Resultado guardado en: {filename}")
            break
        i += 1

# Ejecutar desde terminal con: python json_to_sql.py pruebaLarga.json
if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Uso: python convert_json_to_sql.py archivo.json")
        sys.exit(1)

    input_path = sys.argv[1]
    resultado = generar_sql(input_path)
    print(resultado)
    guardar_resultado(resultado)