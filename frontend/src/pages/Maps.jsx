import React, { useState, useEffect, useMemo, useRef, useCallback, memo } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import "../styles/Maps.css";
import L from "leaflet"; 

const distanceCache = new Map();

const Heatmap = memo(({ data }) => {
    const map = useMap();
    const heatLayerRef = useRef(null);

    useEffect(() => {
        if (!map || !data || data.length === 0) return;
        // Remover capa anterior si existe
        if (heatLayerRef.current) {
            map.removeLayer(heatLayerRef.current);
        }

        const gradient = {
            0.0: 'blue',
            0.4: 'lime',
            0.6: 'yellow',
            0.8: 'orange',
            1.0: 'red'
        };

        let heatmapPoints;
        if (data.length > 5000) {
            // Tomar cada N puntos para reducir la carga
            const step = Math.ceil(data.length / 3000);
            heatmapPoints = data.filter((_, index) => index % step === 0)
                               .map(point => [point.lat, point.lng]);
        } else {
            heatmapPoints = data.map(point => [point.lat, point.lng]);
        }

        heatLayerRef.current = L.heatLayer(heatmapPoints, {
            radius: 15,
            blur: 25,
            maxZoom: 17,
            max: 1,          
            minOpacity: 0.3,
            gradient: gradient,  
        }).addTo(map);

        return () => {
            if (heatLayerRef.current) {
                map.removeLayer(heatLayerRef.current);
                heatLayerRef.current = null;
            }
        };
    }, [map, data]);

    return null;
});

// Hace que el mapa se actualice cuando invalido datos de prueba
const GeoJSONWithUpdates = memo(({ data, style, onFeatureClick }) => {
    const map = useMap();
    const geoJsonRef = useRef(null);
  
    useEffect(() => {
        if (map) {
            map.invalidateSize();
        }
    }, [data, map]);

    // Usar ref para evitar recrear el GeoJSON innecesariamente
    useEffect(() => {
        if (geoJsonRef.current) {
            geoJsonRef.current.clearLayers();
            geoJsonRef.current.addData(data);
        }
    }, [data]);
  
    return (
        <GeoJSON 
            ref={geoJsonRef}
            data={data} 
            style={style} 
            eventHandlers={{
                click: (e) => {
                    onFeatureClick(e.layer.feature.properties);
                },
            }}
        />
    );
});

const RecenterMap = memo(({ center, shouldRecenter }) => {
    const map = useMap();
    useEffect(() => {
        if (shouldRecenter) {
            map.setView(center, 12);
        }
    }, [center, map, shouldRecenter]);
    return null;
});

// Función para calcular la distancia entre dos puntos por coord en metros: usa cache
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const key = `${lat1.toFixed(6)},${lon1.toFixed(6)},${lat2.toFixed(6)},${lon2.toFixed(6)}`;
    
    if (distanceCache.has(key)) {
        return distanceCache.get(key);
    }

    const R = 6371e3 // Radio de la Tierra en metros
    const φ1 = (lat1 * Math.PI) / 180
    const φ2 = (lat2 * Math.PI) / 180
    const Δφ = ((lat2 - lat1) * Math.PI) / 180
    const Δλ = ((lon2 - lon1) * Math.PI) / 180
  
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  
    const distance = R * c;
    distanceCache.set(key, distance);
    
    // Limpiar cache si crece demasiado
    if (distanceCache.size > 10000) {
        const keysToDelete = Array.from(distanceCache.keys()).slice(0, 5000);
        keysToDelete.forEach(k => distanceCache.delete(k));
    }
    
    return distance;
  }
  
// Función para agrupar puntos cercanos usando grid espacial: Sustituyendo al procesamiento anterior
const groupNearbySegments = (segments) => {
    const GRID_SIZE = 0.0001; // ~10 metros
    const grid = new Map();
    
    // Asigna cada segmento a una celda del grid
    segments.forEach((segment, index) => {
        const gridX = Math.floor(segment.start.lat / GRID_SIZE);
        const gridY = Math.floor(segment.start.lng / GRID_SIZE);
        const key = `${gridX},${gridY}`;
        
        if (!grid.has(key)) {
            grid.set(key, []);
        }
        grid.get(key).push({ ...segment, originalIndex: index });
    });
    
    const mergedSegments = [];
    const processedIndices = new Set();
    
    // Procesa cada celda
    for (const cellSegments of grid.values()) {
        if (cellSegments.length === 0) continue;
        
        // Agrupa segmentos similares en celda
        for (let i = 0; i < cellSegments.length; i++) {
            if (processedIndices.has(cellSegments[i].originalIndex)) continue;
            
            const currentSegment = cellSegments[i];
            const similarSegments = [currentSegment];
            processedIndices.add(currentSegment.originalIndex);
            
            // Solo comparar con otros segmentos en la misma celda
            for (let j = i + 1; j < cellSegments.length; j++) {
                if (processedIndices.has(cellSegments[j].originalIndex)) continue;
                
                const compareSegment = cellSegments[j];
                
                const dist = calculateDistance(
                    currentSegment.start.lat,
                    currentSegment.start.lng,
                    compareSegment.start.lat,
                    compareSegment.start.lng
                );
                
                if (dist < 10) { // 10 metros
                    const isSameBike = currentSegment.bike_id === compareSegment.bike_id;
                    const timeDiff = Math.abs(new Date(currentSegment.time) - new Date(compareSegment.time)) / 1000;
                    
                    if (!isSameBike || timeDiff > 30) {
                        similarSegments.push(compareSegment);
                        processedIndices.add(compareSegment.originalIndex);
                    }
                }
            }
            
            // Crea segmento promediado
            if (similarSegments.length > 0) {
                const avgStart = {
                    lat: similarSegments.reduce((sum, seg) => sum + seg.start.lat, 0) / similarSegments.length,
                    lng: similarSegments.reduce((sum, seg) => sum + seg.start.lng, 0) / similarSegments.length,
                };
                
                const avgEnd = {
                    lat: similarSegments.reduce((sum, seg) => sum + seg.end.lat, 0) / similarSegments.length,
                    lng: similarSegments.reduce((sum, seg) => sum + seg.end.lng, 0) / similarSegments.length,
                };
                
                const avgScore = Math.round(similarSegments.reduce((sum, seg) => sum + seg.score, 0) / similarSegments.length);
                
                const latestTime = similarSegments.reduce((latest, seg) => {
                    return new Date(seg.time) > new Date(latest) ? seg.time : latest;
                }, similarSegments[0].time);
                
                mergedSegments.push({
                    start: avgStart,
                    end: avgEnd,
                    condition: similarSegments[0].condition,
                    time: latestTime,
                    mergedCount: similarSegments.length,
                    score: avgScore
                });
            }
        }
    }
    
    return mergedSegments;
};

// Función para formatear la fecha para el popup
const formatDate = (dateString) => {
    const date = new Date(dateString)
    const day = date.getDate().toString().padStart(2, "0")
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    const year = date.getFullYear()
    const hours = date.getHours().toString().padStart(2, "0")
    const minutes = date.getMinutes().toString().padStart(2, "0")
  
    return `${day}/${month}/${year} ${hours}:${minutes}`
}

// Componente para el popup -> evitar que se actualice con cada render
const StaticPopup =  memo(({ position, content, isOpen, onClose }) => {
    const popupRef = useRef(null);
    const map = useMap();
    
    useEffect(() => {
        // Cerrarlo
        if (!isOpen) {
            if (popupRef.current) {
                map.closePopup(popupRef.current);
                popupRef.current = null;
            }
            return;
          }
        
        // Si ya hay un popup abierto, lo dejo
        if (popupRef.current) return;

        if (!position || !content) return;
            
        // Crearlo y abrirlo
        const popup = L.popup({ closeOnClick: false })
            .setLatLng(position)
            .setContent(content)
            .openOn(map);

        popupRef.current = popup;
        popup.on("remove", onClose);

        return () => {
            popup.off("remove", onClose);
            if (popupRef.current === popup) {
            map.closePopup(popup);
            popupRef.current = null;
            }
        };
    }, [isOpen, position, content, map, onClose]);
    
    return null;
});


const Maps = memo(({ bikeData, bikes, activeTimeFrame, onTimeFrameChange, activeColors, onColorChange, roadConditions }) => {
    const [roadsCenterState, setRoadsCenterState] = useState([43.263, -2.935]);
    const [heatmapCenterState, setHeatmapCenterState] = useState([43.263, -2.935]);
    const [shouldRecenterRoads, setShouldRecenterRoads] = useState(true);
    const [shouldRecenterHeatmap, setShouldRecenterHeatmap] = useState(true);
    const [popupPosition, setPopupPosition] = useState(null);
    const [popupContent, setPopupContent] = useState('');
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    const processedDataCache = useRef(new Map());

    // Función para calcular la ventana de tiempo según el filtro 
    const getTimeWindow = useCallback(() => {
        const now = new Date();
        switch (activeTimeFrame) {
            case '1d':
                return new Date(now.setDate(now.getDate() - 1));
            case '1w':
                return new Date(now.setDate(now.getDate() - 7));
            case '1m':
                return new Date(now.setMonth(now.getMonth() - 1));
            case 'tot':
                return new Date(0); 
            default:
                return new Date(now.setDate(now.getDate() - 1));
        }
    }, [activeTimeFrame]);

    const heatmapData = useMemo(() => {
        if (!bikeData || bikeData.length === 0) return [];
        
        const cacheKey = `heatmap-${activeTimeFrame}`;
        if (processedDataCache.current.has(cacheKey)) {
            return processedDataCache.current.get(cacheKey);
        }
        
        const timeWindow = getTimeWindow();
        const filteredData = bikeData.filter(item => new Date(item.fecha) >= timeWindow);
        
        const result = filteredData
            .filter(item => item.latitud && item.longitud)
            .map(item => ({
                lat: parseFloat(item.latitud),
                lng: parseFloat(item.longitud)
            }));
        
        processedDataCache.current.set(cacheKey, result);
        return result;
    }, [bikeData, getTimeWindow, activeTimeFrame]);

    const conditionMaps = useMemo(() => {
        const scoreToCondition = new Map(roadConditions.map(c => [c.score, c.condition]));
        const conditionToColorId = new Map(roadConditions.map(c => [c.condition, c.id]));
        return { scoreToCondition, conditionToColorId };
    }, [roadConditions]);

    const roadsGeoJson = useMemo(() => {
        if (!bikeData || bikeData.length === 0) return { type: "FeatureCollection", features: [] };
        
        const cacheKey = `roads-${activeColors.join(',')}-${bikeData.length}`;
        if (processedDataCache.current.has(cacheKey)) {
            return processedDataCache.current.get(cacheKey);
        }
        
        const { scoreToCondition, conditionToColorId } = conditionMaps;
        
        // Pongo ultimos 3 meses para que se vean todos los de prueba
        const fechaLimite = new Date();
        fechaLimite.setMonth(fechaLimite.getMonth() - 3);
        const filteredData = bikeData.filter(item => new Date(item.fecha) >= fechaLimite);

        const getConditionFromScore = (score) => {
            return scoreToCondition.get(parseInt(score)) || "good";
        };

        // Limitar el número de puntos para procesado: Hay 8k que nunca llega con prueba pero por si se necesita ajustar
        const maxPoints = 8000;
        let dataToProcess = filteredData
            .filter(item => item.latitud && item.longitud && item.puntuacion_road);
        
        if (dataToProcess.length > maxPoints) {
            // Submuestreo inteligente: tomar puntos distribuidos temporalmente
            const step = Math.ceil(dataToProcess.length / maxPoints);
            dataToProcess = dataToProcess.filter((_, index) => index % step === 0);
        }
        
        // Ordenar los datos por bike_id y fecha para poder emparejar puntos consecutivos
        const sortedData = dataToProcess.sort((a, b) => {
            if (a.bike_id !== b.bike_id) return a.bike_id.localeCompare(b.bike_id);
            return new Date(a.fecha) - new Date(b.fecha);
        });

        const roadSegments = []
        for (let i = 1; i < sortedData.length; i++) {
            const currentPoint = sortedData[i];
            const prevPoint = sortedData[i - 1];

            // Misma bici y deben haber pasado menos de 5 segundos
            if (currentPoint.bike_id === prevPoint.bike_id) {
                const timeDiff = Math.abs(new Date(currentPoint.fecha) - new Date(prevPoint.fecha)) / 1000;
                
                if (timeDiff <= 5) {
                    const condition = getConditionFromScore(currentPoint.puntuacion_road);
                    const colorId = conditionToColorId.get(condition);
                    if (activeColors.includes(colorId)) {
                        roadSegments.push({
                            start: {
                                lat: Number.parseFloat(prevPoint.latitud),
                                lng: Number.parseFloat(prevPoint.longitud),
                            },
                            end: {
                                lat: Number.parseFloat(currentPoint.latitud),
                                lng: Number.parseFloat(currentPoint.longitud),
                            },
                            condition: condition,
                            bike_id: currentPoint.bike_id,
                            time: currentPoint.fecha,
                            score: Number.parseInt(currentPoint.puntuacion_road),
                        });
                    }
                }
            }
        }
        
        // Agrupar segmentos cercanos de diferentes bicis o de la misma bici con más de 30s de diferencia
        const mergedSegments = groupNearbySegments(roadSegments);

        // Convertir a GeoJSON
        const roadFeatures = mergedSegments.map((segment) => ({
            type: "Feature",
            geometry: {
                type: "LineString",
                coordinates: [
                    [segment.start.lng, segment.start.lat],
                    [segment.end.lng, segment.end.lat],
                ],
            },
            properties: {
                condition: segment.condition,
                time: segment.time,
                mergedCount: segment.mergedCount,
            },
        }));

        const result = {
            type: "FeatureCollection",
            features: roadFeatures
        };
        
        processedDataCache.current.set(cacheKey, result);
        // Limpiar cache si crece demasiado
        if (processedDataCache.current.size > 20) {
            const oldestKeys = Array.from(processedDataCache.current.keys()).slice(0, 10);
            oldestKeys.forEach(key => processedDataCache.current.delete(key));
        }
        
        return result;
    }, [bikeData, activeColors, conditionMaps]);

       

    const bikeStats = useMemo(() => {
        if (!bikeData || bikeData.length === 0 || !bikes || bikes.length === 0) return []
        const stats = {}
        // Inicializar
        bikes.forEach((bike) => {
            stats[bike.bike_id] = {
                id: bike.bike_id,
                totalData: 0,
                districts: {},
                lastDataTime: null,
            }
        })

        // Datos con contador, distritos y fecha
        bikeData.forEach((item) => {
            const bikeId = item.bike_id
            if (!stats[bikeId]) return

            stats[bikeId].totalData++

            if (item.barrio) {
                if (!stats[bikeId].districts[item.barrio]) {
                stats[bikeId].districts[item.barrio] = 0
                }
                stats[bikeId].districts[item.barrio]++
            }

            const itemDate = new Date(item.fecha)
            if (!stats[bikeId].lastDataTime || itemDate > new Date(stats[bikeId].lastDataTime)) {
                stats[bikeId].lastDataTime = item.fecha
            }
        })

        // Convertir a array y calcular distrito más frecuente
        return Object.values(stats)
            .map((bikeStat) => {
                let mostFrequentDistrict = "Desconocido"
                let maxCount = 0

                Object.entries(bikeStat.districts).forEach(([district, count]) => {
                    if (count > maxCount) {
                        mostFrequentDistrict = district
                        maxCount = count
                    }
                })

                return {
                    ...bikeStat,
                    mostFrequentDistrict,
                }
            })
            .sort((a, b) => {
                const prefixA = a.id.match(/^[A-Za-z]+/)[0];
                const prefixB = b.id.match(/^[A-Za-z]+/)[0];
                
                // Si los prefijos son diferentes, ordeno por prefijo
                if (prefixA !== prefixB) {
                    return prefixA.localeCompare(prefixB);
                }
                
                // Si los prefijos son iguales, comparo los números
                const numA = parseInt(a.id.match(/\d+/)[0], 10);
                const numB = parseInt(b.id.match(/\d+/)[0], 10);
                return numA - numB;
            })
    }, [bikeData, bikes]);

    const handleTimeFrameClick = useCallback((timeFrame) => {
        onTimeFrameChange(timeFrame)
    }, [onTimeFrameChange]);

    const handleColorClick = useCallback((colorId) => {
        onColorChange(colorId)
    }, [onColorChange]);

    const handleRoadClick = useCallback((properties) => {
        // Si habia un popup, cierro
        if (isPopupOpen) handleClosePopup();
        
        // Busca coordenadas para popup
        const feature = roadsGeoJson.features.find(f => f.properties.time === properties.time);
        if (!feature) return;

        const [[lng1, lat1], [lng2, lat2]] = feature.geometry.coordinates;
        setPopupPosition([(lat1 + lat2) / 2, (lng1 + lng2) / 2]);
            
        // Crear el contenido HTML del popup
        const content = `
            <div class="road-popup">
                <h4>Datos del ${formatDate(properties.time)}</h4>
                ${properties.mergedCount > 1 ? `<p>Promedio de ${properties.mergedCount} mediciones</p>` : ''}
            </div>
        `;
        setPopupContent(content);
        setIsPopupOpen(true);
    }, [isPopupOpen, roadsGeoJson.features]);

    const handleClosePopup = useCallback(() => {
        setIsPopupOpen(false);
    }, []);

    const getRoadColor = useCallback((condition) => {
        const roadCondition = roadConditions.find(c => c.condition === condition);
        return roadCondition ? roadCondition.color : "#000";
    }, [roadConditions]);

    const calculateCenter = useCallback((points, defaultCenter = [43.263, -2.935]) => {
        if (points.length === 0) return defaultCenter;
        const sum = points.reduce(
            (acc, point) => ({
                lat: acc.lat + point.lat,
                lng: acc.lng + point.lng,
            }),
            { lat: 0, lng: 0 }
        );
        return [sum.lat / points.length, sum.lng / points.length];
    }, []);

    const geoJsonStyle = useCallback((feature) => ({
        color: getRoadColor(feature.properties.condition),
        weight: 5,
        opacity: 0.8,
    }), [getRoadColor]);

    useEffect(() => {
        if (bikeData && bikeData.length > 0) {
            setShouldRecenterRoads(false)
        }
    }, [bikeData])

    useEffect(() => {
        setShouldRecenterHeatmap(true);
    }, [activeTimeFrame]);

    useEffect(() => {
        // Centro del heatmap
        if (!shouldRecenterHeatmap) return;
        const points = heatmapData.map(({ lat, lng }) => ({ lat, lng }));
        const newCenter = calculateCenter(points);
        setHeatmapCenterState(newCenter);
        setShouldRecenterHeatmap(false);
    }, [heatmapData, shouldRecenterHeatmap, calculateCenter]);

    useEffect(() => {
        // Centro de carreteras
        if (shouldRecenterRoads) {
          const points = roadsGeoJson.features.map((feature) => {
            const coords = feature.geometry.coordinates
            return {
                lat: (coords[0][1] + coords[1][1]) / 2,
                lng: (coords[0][0] + coords[1][0]) / 2,
            }
          })
          setRoadsCenterState(calculateCenter(points))
        }
    }, [roadsGeoJson, shouldRecenterRoads, calculateCenter])

    const timeFrames = useMemo(() => [
        { id: '1d', label: '1d' },
        { id: '1w', label: '1w' },
        { id: '1m', label: '1m' },
        { id: 'tot', label: 'Tot' }
    ], []);

    const activeIndex = useMemo(() => 
        timeFrames.findIndex(tf => tf.id === activeTimeFrame), 
        [timeFrames, activeTimeFrame]
    );

    return (
        <div className="maps-container">
            <div className="maps-row">
                <div className="map-box-container">
                    <h3 className="map-box-title">Flujo de ciclistas</h3>
                    <MapContainer center={heatmapCenterState} zoom={13} className="map-box">
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <RecenterMap center={heatmapCenterState} shouldRecenter={shouldRecenterHeatmap}/>
                        <Heatmap data={heatmapData} />
                    </MapContainer>
                    <div className="time-slider-container">
                        <div className="time-slider-track">
                            <div 
                                className="time-slider-thumb" 
                                style={{ left: `${(activeIndex / (timeFrames.length - 1)) * 100}%` }}
                            ></div>
                        </div>
                        <div className="time-slider-labels">
                            {timeFrames.map((time, index) => (
                                <div 
                                    key={time.id}
                                    className={`time-label ${activeTimeFrame === time.id ? 'active' : ''}`}
                                    style={{ left: `${(index / (timeFrames.length - 1)) * 100}%` }}
                                    onClick={() => handleTimeFrameClick(time.id)}
                                >
                                    {time.label}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="map-box-container">
                    <h3 className="map-box-title">Estado de carreteras y carriles</h3>
                    <MapContainer center={roadsCenterState} zoom={13} className="map-box">
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <RecenterMap center={roadsCenterState} shouldRecenter={shouldRecenterRoads} />
                        <GeoJSONWithUpdates
                            data={roadsGeoJson}
                            style={geoJsonStyle}
                            onFeatureClick={handleRoadClick}
                        />
                        {/* Creo un popup estático que no se actualice con cada render */}
                        {isPopupOpen && popupPosition && (
                            <StaticPopup 
                                position={popupPosition}
                                content={popupContent}
                                isOpen={isPopupOpen}
                                onClose={handleClosePopup}
                            />
                        )}
                    </MapContainer>
                    <div className="color-sections">
                        {roadConditions.map((section) => (
                        <div 
                            key={section.id}
                            className={`color-section ${activeColors.includes(section.id) ? 'active' : ''}`}
                            style={{ 
                            backgroundColor: activeColors.includes(section.id) ? section.color : `${section.color}88`
                            }}
                            onClick={() => handleColorClick(section.id)}
                        />
                        ))}
                    </div>
                </div>
            </div>
            <div className="maps-info card">
            <h3>Información Estadística de Bicicletas</h3>
                <div className="bikes-table-container">
                    <div className="bikes-table-wrapper">
                        <table className="bikes-table">
                            <thead>
                                <tr>
                                    <th>Bicicleta</th>
                                    <th>Envíos totales</th>
                                    <th>Zona más frecuente</th>
                                    <th>Últimos datos</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bikeStats.map((bike) => (
                                    <tr key={bike.id}>
                                        <td>{bike.id}</td>
                                        <td>{bike.totalData}</td>
                                        <td>{bike.mostFrequentDistrict}</td>
                                        <td>{bike.lastDataTime ? formatDate(bike.lastDataTime) : "Sin datos"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default Maps;