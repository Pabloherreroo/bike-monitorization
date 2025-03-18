DROP DATABASE IF EXISTS bicicleta_data;
CREATE DATABASE bicicleta_data;

\c bicicleta_data;

CREATE EXTENSION IF NOT EXISTS timescaledb;

CREATE TABLE bikes (
    id SERIAL PRIMARY KEY,
    bike_id TEXT UNIQUE NOT NULL,
    estado VARCHAR(20) CHECK (estado IN ('en funcionamiento', 'parada')) NOT NULL,
    fecha_registro TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE bike_data (
    bike_id TEXT NOT NULL,  
    latitud DOUBLE PRECISION NOT NULL,
    longitud DOUBLE PRECISION NOT NULL,
    puntuacion_road INT CHECK (puntuacion_road >= 1 AND puntuacion_road <= 4) NOT NULL,
    calidad_ambiental INT CHECK (calidad_ambiental >= 0 AND calidad_ambiental <= 100) NOT NULL,
    ruido INT CHECK (ruido >= 0 AND ruido <= 120) NOT NULL,
    barrio TEXT,
    fecha TIMESTAMPTZ NOT NULL,
    PRIMARY KEY (bike_id, fecha),  -- Clave primaria compuesta por bike_id y fecha
    CONSTRAINT fk_bike_id FOREIGN KEY (bike_id) REFERENCES bikes(bike_id)
);

-- Crear la 'hypertable' para 'bike_data' con partición en 'fecha'
SELECT create_hypertable('bike_data', 'fecha');


