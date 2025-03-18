# CODIGO A RECICLAR PARA DETERMINAR EL BARRIO Y ASIGNARLO EN LA BD -> Problema que son cuadrados los barrios aqui

from typing import List

# Suponiendo que los barrios estan definidos como diccionarios con sus límites
barrios = [
    {"id": 1, "nombre": "Abando", "lat_min": 43.25, "lat_max": 43.27, "lng_min": -2.95, "lng_max": -2.93},
    {"id": 2, "nombre": "Indautxu", "lat_min": 43.25, "lat_max": 43.26, "lng_min": -2.93, "lng_max": -2.92},
    # Agregar aqui más barrios
]

def obtener_barrio(latitud: float, longitud: float) -> int:
    """Determina el barrio basándose en la latitud y longitud."""
    for barrio in barrios:
        if barrio["lat_min"] <= latitud <= barrio["lat_max"] and barrio["lng_min"] <= longitud <= barrio["lng_max"]:
            return barrio["id"]  
    return None 

# MAS FUNCIONES QUE NECESITO: CALCULAR SI LA BICI ESTA PARADA O NO (SI HA MANDADO HACE MENOS DE 30S), CALCULAR SI 