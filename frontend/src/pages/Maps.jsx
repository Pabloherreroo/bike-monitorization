import { useState, useEffect, useMemo } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import "../styles/Maps.css";
import L from "leaflet"; 

const Heatmap = ({ data }) => {
    const map = useMap();

    useEffect(() => {
        if (!map || !data || data.length === 0) return;

        // Gradiente personalizado segun intensidad -> A retocar
        const gradient = {
            0.0: 'blue',
            0.2: 'lime',
            0.4: 'yellow',
            0.6: 'orange',
            0.8: 'red',
            1.0: 'darkred'
        };

        const heatmapPoints = data.map(point => [point.lat, point.lng]);

        const heatLayer = L.heatLayer(heatmapPoints, {
            radius: 25,
            blur: 25,
            maxZoom: 17,
            gradient: gradient,  
        }).addTo(map);

        return () => {
            map.removeLayer(heatLayer);
        };
    }, [map, data]);

    return null;
};

const Maps = ({ bikeData }) => {
    const [activeTimeFrame, setActiveTimeFrame] = useState('1d');
    const [activeColors, setActiveColors] = useState(['green', 'yellow', 'orange', 'red']);

    const timeFrames = [
        { id: '1d', label: '1d' },
        { id: '1w', label: '1w' },
        { id: '1m', label: '1m' },
        { id: 'tot', label: 'Tot' }
    ];

    const roadColors = {
        good: "#4CAF50",
        mid: "#FFEB3B",
        bad: "#FF9800",
        very_bad: "#F44336"
    };
    
    const colorSections = [
        { id: 'green', color: roadColors.good, condition: 'good' },
        { id: 'yellow', color: roadColors.mid, condition: 'mid' },
        { id: 'orange', color: roadColors.bad, condition: 'bad' },
        { id: 'red', color: roadColors.very_bad, condition: 'very_bad' }
    ];

    // Función para calcular la ventana de tiempo según el filtro 
    const getTimeWindow = () => {
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
    };

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
    }, [bikeData, activeTimeFrame]);

    const roadsGeoJson = useMemo(() => {
        if (!bikeData || bikeData.length === 0) return { type: "FeatureCollection", features: [] };
        
        const timeWindow = getTimeWindow();
        const filteredData = bikeData.filter(item => new Date(item.fecha) >= timeWindow);
        const roadFeatures = [];
        
        // Ordenar los datos por bike_id y fecha para poder emparejar puntos consecutivos
        const sortedData = [...filteredData]
            .filter(item => item.latitud && item.longitud && item.puntuacion_road)
            .sort((a, b) => {
                if (a.bike_id !== b.bike_id) return a.bike_id - b.bike_id;
                return new Date(a.fecha) - new Date(b.fecha);
            });

        const getConditionFromScore = (score) => {
            switch (parseInt(score)) {
                case 1: return "good";
                case 2: return "mid";
                case 3: return "bad";
                case 4: return "very_bad";
                default: return "good";
            }
        };

        for (let i = 1; i < sortedData.length; i++) {
            const currentPoint = sortedData[i];
            const prevPoint = sortedData[i - 1];

            // Misma bici y deben haber pasado menos de 5 segundos
            if (currentPoint.bike_id === prevPoint.bike_id) {
                const timeDiff = Math.abs(new Date(currentPoint.fecha) - new Date(prevPoint.fecha)) / 1000;
                
                if (timeDiff <= 5) {
                    const condition = getConditionFromScore(currentPoint.puntuacion_road);
                    
                    // Solo agregar la línea si el color está activo
                    const colorSection = colorSections.find(cs => cs.condition === condition);
                    if (colorSection && activeColors.includes(colorSection.id)) {
                        roadFeatures.push({
                            type: "Feature",
                            geometry: {
                                type: "LineString",
                                coordinates: [
                                    [parseFloat(prevPoint.longitud), parseFloat(prevPoint.latitud)],
                                    [parseFloat(currentPoint.longitud), parseFloat(currentPoint.latitud)]
                                ],
                            },
                            properties: { 
                                condition: condition,
                                bike_id: currentPoint.bike_id,
                                time: currentPoint.fecha
                            },
                        });
                    }
                }
            }
        }

        return {
            type: "FeatureCollection",
            features: roadFeatures
        };
    }, [bikeData, activeTimeFrame, activeColors]);

    const handleTimeFrameClick = (timeFrame) => {
        setActiveTimeFrame(timeFrame);
    };

    const handleColorClick = (colorId) => {
        if (activeColors.includes(colorId)) {
        setActiveColors(activeColors.filter(id => id !== colorId));
        } else {
        setActiveColors([...activeColors, colorId]);
        }
    };

    const activeIndex = timeFrames.findIndex(tf => tf.id === activeTimeFrame);

    const getRoadColor = (condition) => roadColors[condition] || "#000";

    // Calcular el centro del mapa basado en los datos disponibles
    const mapCenter = useMemo(() => {
        if (heatmapData.length > 0) {
            return [heatmapData[0].lat, heatmapData[0].lng];
        }
        return [43.263, -2.935]; 
    }, [heatmapData]);

    return (
        <div className="maps-container">
            <div className="maps-row">
                <div className="map-box-container">
                    <h3 className="map-box-title">Flujo de ciclistas</h3>
                    <MapContainer center={mapCenter} zoom={13} className="map-box">
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
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
                    <MapContainer center={mapCenter} zoom={13} className="map-box">
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <GeoJSON
                            data={roadsGeoJson}
                            style={(feature) => ({
                                color: getRoadColor(feature.properties.condition),
                                weight: 5,
                                opacity: 0.8,
                            })}
                        />
                    </MapContainer>
                    <div className="color-sections">
                        {colorSections.map((section) => (
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
            <h3>Información</h3>
                <p>Mostrando datos de {activeTimeFrame === '1d' ? 'último día' : 
                    activeTimeFrame === '1w' ? 'última semana' : 
                    activeTimeFrame === '1m' ? 'último mes' : 'todo el tiempo'}</p>
                <p>Filtros activos: {activeColors.length === 0 ? 'Ninguno' : 
                    activeColors.map(color => {
                        const section = colorSections.find(s => s.id === color);
                        return section ? section.condition : '';
                    }).join(', ')}</p>
                <p>Total de puntos GPS: {heatmapData.length}</p>
                <p>Total de segmentos de carretera: {roadsGeoJson.features.length}</p>
            </div>
        </div>
    );
};

export default Maps;