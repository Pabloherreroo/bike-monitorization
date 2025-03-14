DROP DATABASE IF EXISTS bicicleta_data;
CREATE DATABASE bicicleta_data;

\c bicicleta_data;

CREATE EXTENSION IF NOT EXISTS timescaledb;

CREATE TABLE bikes (
    id SERIAL PRIMARY KEY,
    bike_id TEXT UNIQUE NOT NULL,
    estado VARCHAR(20) CHECK (estado IN ('en funcionamiento', 'parada')) NOT NULL, -- podria ser 0 o 1
    fecha_registro TIMESTAMPTZ DEFAULT NOW() -- esto no se si me convence
);

CREATE TABLE bike_data (
    id SERIAL PRIMARY KEY,
    bike_id TEXT NOT NULL,  
    latitud DOUBLE PRECISION NOT NULL,
    longitud DOUBLE PRECISION NOT NULL,
    puntuacion_road INT CHECK (puntuacion_road >= 1 AND puntuacion_road <= 4) NOT NULL,
    calidad_ambiental INT CHECK (calidad_ambiental >= 0 AND calidad_ambiental <= 100) NOT NULL,
    ruido INT CHECK (ruido >= 0 AND ruido <= 120) NOT NULL,
    barrio TEXT,
    fecha TIMESTAMPTZ NOT NULL,
    CONSTRAINT fk_bike_id FOREIGN KEY (bike_id) REFERENCES bikes(bike_id),
    CONSTRAINT bike_data_unique UNIQUE (bike_id, fecha)
);

-- 'fecha' como partición temporal, hypertable para datos de sensores
SELECT create_hypertable('bike_data', 'fecha');

