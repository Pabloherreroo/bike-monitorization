SELECT 'CREATE DATABASE bicicleta_data
    WITH OWNER = postgres
    ENCODING = ''UTF8''
    LC_COLLATE = ''es_ES.UTF-8''
    LC_CTYPE = ''es_ES.UTF-8''
    TEMPLATE = template0'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'bicicleta_data');

\c bicicleta_data;
SET client_encoding TO 'UTF8';

CREATE EXTENSION IF NOT EXISTS timescaledb;

CREATE TABLE IF NOT EXISTS bikes (
    id SERIAL PRIMARY KEY,
    bike_id TEXT UNIQUE NOT NULL,
    estado VARCHAR(20) CHECK (estado IN ('en funcionamiento', 'parada')) NOT NULL,
    fecha_registro TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'bike_data') THEN
        CREATE TABLE bike_data (
            bike_id TEXT NOT NULL,  
            latitud DOUBLE PRECISION NOT NULL,
            longitud DOUBLE PRECISION NOT NULL,
            puntuacion_road INT CHECK (puntuacion_road >= 1 AND puntuacion_road <= 4) NOT NULL,
            calidad_ambiental INT CHECK (calidad_ambiental >= 0 AND calidad_ambiental <= 100) NOT NULL,
            ruido INT CHECK (ruido >= 0 AND ruido <= 120) NOT NULL,
            barrio TEXT,
            fecha TIMESTAMPTZ NOT NULL,
            PRIMARY KEY (bike_id, fecha), --PK compuesta por el id y la fecha
            CONSTRAINT fk_bike_id FOREIGN KEY (bike_id) REFERENCES bikes(bike_id)
        );
        
        -- Crear hypertable para bike_data fecha
        PERFORM create_hypertable('bike_data', 'fecha');
    END IF;
END
$$;


