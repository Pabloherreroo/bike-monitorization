import React, { useState, useEffect, useMemo, useRef, useCallback, memo } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import "../styles/Maps.css";
import L from "leaflet"; 

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

        const heatmapPoints = data.map(point => [point.lat, point.lng]);
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
}, (prevProps, nextProps) => {
    // Solo re-renderizar si los datos realmente han cambiado
    return prevProps.data === nextProps.data;
});

// Hace que el mapa se actualice cuando invalido datos de prueba
const GeoJSONWithUpdates = memo(({ data, style, geoJsonKey, onFeatureClick }) => {
    const map = useMap()
  
    useEffect(() => {
      if (map) {
        map.invalidateSize()
      }
    }, [data, map])
  
    return <GeoJSON key={geoJsonKey} data={data} style={style} 
        eventHandlers={{
            click: (e) => {
                onFeatureClick(e.layer.feature.properties)
            },
        }}
    />
}, (prevProps, nextProps) => {
    return (
        prevProps.data === nextProps.data &&
        prevProps.geoJsonKey === nextProps.geoJsonKey &&
        prevProps.style === nextProps.style
    );
});

const RecenterMap = memo(({ center, shouldRecenter }) => {
    const map = useMap()
    useEffect(() => {
      if (shouldRecenter) {
        map.setView(center, 12)
      }
    }, [center, map, shouldRecenter])
    return null
}, (prevProps, nextProps) => {
    return (
        prevProps.center[0] === nextProps.center[0] &&
        prevProps.center[1] === nextProps.center[1] &&
        prevProps.shouldRecenter === nextProps.shouldRecenter
    );
});

// Función para calcular la distancia entre dos puntos por coord en metros
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3 // Radio de la Tierra en metros
    const φ1 = (lat1 * Math.PI) / 180
    const φ2 = (lat2 * Math.PI) / 180
    const Δφ = ((lat2 - lat1) * Math.PI) / 180
    const Δλ = ((lon2 - lon1) * Math.PI) / 180
  
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  
    return R * c // Distancia
  }
  
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
        // Cerrar el popup si debe hacerse
        if (!isOpen) {
            if (popupRef.current) {
                map.closePopup(popupRef.current);
                popupRef.current = null;
            }
            return;
          }
        
        // Si ya hay un popup abierto, lo dejo
        if (popupRef.current) return;

        // Validar posición y contenido
        if (!position || !content) return;
            
        // Crear y abrir el popup
        const popup = L.popup({ closeOnClick: false })
            .setLatLng(position)
            .setContent(content)
            .openOn(map);

        popupRef.current = popup;
        // Sólo para limpiar la variable y disparar onClose
        popup.on("remove", onClose);

        return () => {
            popup.off("remove", onClose);
            if (popupRef.current === popup) {
            map.closePopup(popup);
            popupRef.current = null;
            }
        };
    }, [isOpen, position, content, map]);
    
    return null;
});


const Maps = memo(({ bikeData, bikes, activeTimeFrame, onTimeFrameChange, activeColors, onColorChange, roadConditions }) => {
    const [roadsCenterState, setRoadsCenterState] = useState([43.263, -2.935])
    const [heatmapCenterState, setHeatmapCenterState] = useState([43.263, -2.935])
    const [shouldRecenterRoads, setShouldRecenterRoads] = useState(true)
    const [shouldRecenterHeatmap, setShouldRecenterHeatmap] = useState(true)
    const [selectedRoad, setSelectedRoad] = useState(null)
    const [popupPosition, setPopupPosition] = useState(null)
    const [popupContent, setPopupContent] = useState('')
    const [isPopupOpen, setIsPopupOpen] = useState(false)
    const [geoJsonKey, setGeoJsonKey] = useState(0)

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
        
        const timeWindow = getTimeWindow();
        const filteredData = bikeData.filter(item => new Date(item.fecha) >= timeWindow);
        
        return filteredData
            .filter(item => item.latitud && item.longitud)
            .map(item => ({
                lat: parseFloat(item.latitud),
                lng: parseFloat(item.longitud)
            }));
    }, [bikeData, getTimeWindow]);

    const conditionMaps = useMemo(() => {
        const scoreToCondition = new Map(roadConditions.map(c => [c.score, c.condition]));
        const conditionToColorId = new Map(roadConditions.map(c => [c.condition, c.id]));
        return { scoreToCondition, conditionToColorId };
    }, [roadConditions]);

    const roadsGeoJson = useMemo(() => {
        if (!bikeData || bikeData.length === 0) return { type: "FeatureCollection", features: [] };
        const { scoreToCondition, conditionToColorId } = conditionMaps;
        
        // Pongo ultimos 3 meses por poner algo de limite para los datos de carreteras, podría ser menos tiempo
        const fechaLimite = new Date();
        fechaLimite.setMonth(fechaLimite.getMonth() - 3);
        const filteredData = bikeData.filter(item => new Date(item.fecha) >= fechaLimite);

        const getConditionFromScore = (score) => {
            return scoreToCondition.get(parseInt(score)) || "good";
        };
        
        // Ordenar los datos por bike_id y fecha para poder emparejar puntos consecutivos
        const sortedData = [...filteredData]
            .filter(item => item.latitud && item.longitud && item.puntuacion_road)
            .sort((a, b) => {
                if (a.bike_id !== b.bike_id) return a.bike_id.localeCompare(b.bike_id);
                return new Date(a.fecha) - new Date(b.fecha);
            });


        // Segmentos de carretera 
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
                        })
                    }
                }
            }
        }
        
        // Agrupar segmentos cercanos de diferentes bicis o de la misma bici con más de 30s de diferencia
        const mergedSegments = []
        const processedIndices = new Set()

        for (let i = 0; i < roadSegments.length; i++) {
            if (processedIndices.has(i)) continue

            const currentSegment = roadSegments[i]
            const similarSegments = [currentSegment]
            processedIndices.add(i)

            for (let j = i + 1; j < roadSegments.length; j++) {
                if (processedIndices.has(j)) continue

                const compareSegment = roadSegments[j]

                // Calcular distancias entre los puntos de inicio y fin
                const startStartDist = calculateDistance(
                    currentSegment.start.lat,
                    currentSegment.start.lng,
                    compareSegment.start.lat,
                    compareSegment.start.lng,
                )

                const endEndDist = calculateDistance(
                    currentSegment.end.lat,
                    currentSegment.end.lng,
                    compareSegment.end.lat,
                    compareSegment.end.lng,
                )

                const startEndDist = calculateDistance(
                    currentSegment.start.lat,
                    currentSegment.start.lng,
                    compareSegment.end.lat,
                    compareSegment.end.lng,
                )

                const endStartDist = calculateDistance(
                    currentSegment.end.lat,
                    currentSegment.end.lng,
                    compareSegment.start.lat,
                    compareSegment.start.lng,
                )

                // Si los puntos están lo suficientemente cerca (10 metros) y van en cualquier sentido
                const isNearby = (startStartDist < 10 && endEndDist < 10) || (startEndDist < 10 && endStartDist < 10)

                // Verificar si son de bicis distintas o de la misma bici con más de 30s de diferencia
                const isSameBike = currentSegment.bike_id === compareSegment.bike_id
                const timeDiff = Math.abs(new Date(currentSegment.time) - new Date(compareSegment.time)) / 1000
                const isDifferentTimeOrBike = !isSameBike || (isSameBike && timeDiff > 30)

                if (isNearby && isDifferentTimeOrBike) {
                    similarSegments.push(compareSegment)
                    processedIndices.add(j)
                }
            }

            // Promedio de segmentos similares y su valor de roadCondition
            if (similarSegments.length > 0) {
                const avgStart = {
                    lat: similarSegments.reduce((sum, seg) => sum + seg.start.lat, 0) / similarSegments.length,
                    lng: similarSegments.reduce((sum, seg) => sum + seg.start.lng, 0) / similarSegments.length,
                }

                const avgEnd = {
                    lat: similarSegments.reduce((sum, seg) => sum + seg.end.lat, 0) / similarSegments.length,
                    lng: similarSegments.reduce((sum, seg) => sum + seg.end.lng, 0) / similarSegments.length,
                }

                const avgScore = Math.round(similarSegments.reduce((sum, seg) => sum + seg.score, 0) / similarSegments.length)

                const avgCondition = getConditionFromScore(avgScore)

                // Usar fecha más reciente
                const latestTime = similarSegments.reduce((latest, seg) => {
                    return new Date(seg.time) > new Date(latest) ? seg.time : latest
                }, similarSegments[0].time)

                // Guardar info sobre segmentos promediados
                const mergedInfo = similarSegments.map((seg) => ({
                    bike_id: seg.bike_id,
                    time: seg.time,
                    score: seg.score,
                }))

                mergedSegments.push({
                start: avgStart,
                end: avgEnd,
                condition: avgCondition,
                time: latestTime,
                mergedCount: similarSegments.length,
                mergedInfo: mergedInfo,
                })
            }
        }

        // Convertir los segmentos a GeoJSON
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
                mergedInfo: segment.mergedInfo,
            },
        }))

        return {
            type: "FeatureCollection",
            features: roadFeatures
        };
    }, [bikeData, activeColors, roadConditions]);

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
                
                // Si los prefijos son diferentes, ordenamos por prefijo
                if (prefixA !== prefixB) {
                    return prefixA.localeCompare(prefixB);
                }
                
                // Si los prefijos son iguales, comparamos los números
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
        setSelectedRoad(null);
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
        setGeoJsonKey((prev) => prev + 1)
    }, [bikeData, activeTimeFrame, activeColors])

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
                            geoJsonKey={geoJsonKey}
                            style={(feature) => ({
                                color: getRoadColor(feature.properties.condition),
                                weight: 5,
                                opacity: 0.8,
                            })}
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
}, (prevProps, nextProps) => {
    return (
        prevProps.bikeData === nextProps.bikeData &&
        prevProps.bikes === nextProps.bikes &&
        prevProps.activeTimeFrame === nextProps.activeTimeFrame &&
        prevProps.activeColors === nextProps.activeColors &&
        prevProps.roadConditions === nextProps.roadConditions
    );
});

export default Maps;