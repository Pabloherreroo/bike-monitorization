import { useState, useEffect } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import "../styles/Maps.css";
import L from "leaflet"; 

const Heatmap = ({ data }) => {
    const map = useMap();

    useEffect(() => {
        if (!map) return;

        // Gradiente personalizado segun intensidad -> A retocar
        const gradient = {
            0.0: 'blue',
            0.2: 'lime',
            0.4: 'yellow',
            0.6: 'orange',
            0.8: 'red',
            1.0: 'darkred'
        };

        const heatLayer = L.heatLayer(
            data.map(point => [point.lat, point.lng, point.intensity]),
            {
                radius: 25,   // Ajustar tamaño de puntos (>tamaño, >mancha de calor)
                blur: 25,     // Marca más los puntos cuanto mas bajo es, si sube los difumina (se integran mejor)
                maxZoom: 17,  // Ajusta el nivel máximo de zoom al que el mapa sera visible. A mayor, mapa con mas detalle
                gradient: gradient,  
            }
        ).addTo(map);

        return () => {
            map.removeLayer(heatLayer);
        };
    }, [map, data]);

    return null;
};

const Maps = () => {
    const [activeTimeFrame, setActiveTimeFrame] = useState('1d');
    const [activeColors, setActiveColors] = useState([]);

    const timeFrames = [
        { id: '1d', label: '1d' },
        { id: '1w', label: '1w' },
        { id: '1m', label: '1m' },
        { id: 'tot', label: 'Tot' }
    ];
    
    const colorSections = [
        { id: 'green', color: '#4CAF50' },
        { id: 'yellow', color: '#FFEB3B' },
        { id: 'orange', color: '#FF9800' },
        { id: 'red', color: '#F44336' }
    ];

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

    //Datos prueba: Para el mapa de calor, la intensidad será un valor a calcular en el futuro (con la cantidad de objetos por area o asi)
    const heatmapData = [
        { lat: 43.263, lng: -2.935, intensity: 0.9 },
        { lat: 43.265, lng: -2.938, intensity: 1.0 },
        { lat: 43.260, lng: -2.930, intensity: 0.8 },
        { lat: 43.261, lng: -2.937, intensity: 0.7 },
        { lat: 43.264, lng: -2.939, intensity: 1.0 },
        { lat: 43.258, lng: -2.931, intensity: 0.9 },
        { lat: 43.267, lng: -2.940, intensity: 0.8 },
        { lat: 43.262, lng: -2.933, intensity: 0.7 },
        { lat: 43.266, lng: -2.934, intensity: 0.9 },
        { lat: 43.259, lng: -2.936, intensity: 1.0 },
        { lat: 43.268, lng: -2.931, intensity: 0.9 },
        { lat: 43.269, lng: -2.932, intensity: 1.0 },
        { lat: 43.270, lng: -2.933, intensity: 0.8 },
        { lat: 43.271, lng: -2.934, intensity: 0.7 },
        { lat: 43.263, lng: -2.935, intensity: 0.5 },
        { lat: 43.264, lng: -2.936, intensity: 0.6 },
        { lat: 43.265, lng: -2.937, intensity: 0.7 },
        { lat: 43.262, lng: -2.934, intensity: 0.8 },
        { lat: 43.266, lng: -2.938, intensity: 0.9 },
        { lat: 43.261, lng: -2.933, intensity: 0.7 },
        { lat: 43.267, lng: -2.939, intensity: 0.8 },
        { lat: 43.260, lng: -2.932, intensity: 0.6 },
        { lat: 43.268, lng: -2.940, intensity: 0.9 },
        { lat: 43.263, lng: -2.930, intensity: 0.5 },
        { lat: 43.269, lng: -2.941, intensity: 0.8 },
        { lat: 43.262, lng: -2.931, intensity: 0.7 },
        { lat: 43.264, lng: -2.937, intensity: 0.6 },
        { lat: 43.265, lng: -2.932, intensity: 0.9 },
        { lat: 43.266, lng: -2.935, intensity: 0.7 },
        { lat: 43.2635, lng: -2.9355, intensity: 0.6 },
        { lat: 43.2645, lng: -2.9365, intensity: 0.7 },
        { lat: 43.2655, lng: -2.9375, intensity: 0.8 },
        { lat: 43.2625, lng: -2.9345, intensity: 0.9 },
        { lat: 43.2665, lng: -2.9385, intensity: 0.85 },
        { lat: 43.263, lng: -2.935, intensity: 0.5 },
        { lat: 43.265, lng: -2.938, intensity: 0.7 },
        { lat: 43.260, lng: -2.930, intensity: 0.9 },
        { lat: 43.261, lng: -2.937, intensity: 0.4 },
        { lat: 43.264, lng: -2.939, intensity: 0.6 },
        { lat: 43.258, lng: -2.931, intensity: 0.8 },
        { lat: 43.267, lng: -2.940, intensity: 0.7 },
        { lat: 43.262, lng: -2.933, intensity: 0.5 },
        { lat: 43.266, lng: -2.934, intensity: 0.6 },
        { lat: 43.259, lng: -2.936, intensity: 0.8 },
        { lat: 43.268, lng: -2.931, intensity: 0.7 },
        { lat: 43.269, lng: -2.932, intensity: 0.5 },
        { lat: 43.270, lng: -2.933, intensity: 0.9 },
        { lat: 43.271, lng: -2.934, intensity: 0.6 },
        { lat: 43.273, lng: -2.935, intensity: 0.4 },
        { lat: 43.274, lng: -2.936, intensity: 0.7 },
        { lat: 43.272, lng: -2.937, intensity: 0.6 },
        { lat: 43.275, lng: -2.938, intensity: 0.5 },
        { lat: 43.276, lng: -2.939, intensity: 0.9 },
        { lat: 43.277, lng: -2.930, intensity: 0.8 },
        { lat: 43.278, lng: -2.931, intensity: 0.7 },
        { lat: 43.279, lng: -2.932, intensity: 0.6 },
        { lat: 43.280, lng: -2.933, intensity: 0.5 },
        { lat: 43.281, lng: -2.934, intensity: 0.8 },
        { lat: 43.282, lng: -2.935, intensity: 0.6 },
        { lat: 43.283, lng: -2.936, intensity: 0.7 },
        { lat: 43.284, lng: -2.937, intensity: 0.5 },
        { lat: 43.285, lng: -2.938, intensity: 0.9 },
        { lat: 43.286, lng: -2.939, intensity: 0.8 },
        { lat: 43.287, lng: -2.940, intensity: 0.7 },
        { lat: 43.288, lng: -2.931, intensity: 0.6 },
        { lat: 43.289, lng: -2.932, intensity: 0.5 },
        { lat: 43.290, lng: -2.933, intensity: 0.7 },
        { lat: 43.291, lng: -2.934, intensity: 0.8 },
        { lat: 43.292, lng: -2.935, intensity: 0.9 },
        { lat: 43.293, lng: -2.936, intensity: 0.7 },
        { lat: 43.294, lng: -2.937, intensity: 0.6 },
        { lat: 43.295, lng: -2.938, intensity: 0.5 },
        { lat: 43.296, lng: -2.939, intensity: 0.9 },
        { lat: 43.297, lng: -2.930, intensity: 0.7 },
        { lat: 43.298, lng: -2.931, intensity: 0.6 },
        { lat: 43.299, lng: -2.932, intensity: 0.8 },
        { lat: 43.300, lng: -2.933, intensity: 0.7 },
        { lat: 43.301, lng: -2.934, intensity: 0.9 },
        { lat: 43.302, lng: -2.935, intensity: 0.6 },
        { lat: 43.303, lng: -2.936, intensity: 0.5 },
        { lat: 43.304, lng: -2.937, intensity: 0.8 },
        { lat: 43.305, lng: -2.938, intensity: 0.9 },
        { lat: 43.306, lng: -2.939, intensity: 0.7 },
        { lat: 43.307, lng: -2.940, intensity: 0.6 },
        { lat: 43.308, lng: -2.931, intensity: 0.7 },
        { lat: 43.309, lng: -2.932, intensity: 0.5 },
        { lat: 43.310, lng: -2.933, intensity: 0.8 },
        { lat: 43.311, lng: -2.934, intensity: 0.9 },
        { lat: 43.312, lng: -2.935, intensity: 0.6 },
        { lat: 43.313, lng: -2.936, intensity: 0.5 },
        { lat: 43.314, lng: -2.937, intensity: 0.7 },
        { lat: 43.315, lng: -2.938, intensity: 0.8 },
        { lat: 43.316, lng: -2.939, intensity: 0.7 },
        { lat: 43.317, lng: -2.940, intensity: 0.6 },
        { lat: 43.318, lng: -2.931, intensity: 0.5 },
        { lat: 43.319, lng: -2.932, intensity: 0.8 },
        { lat: 43.320, lng: -2.933, intensity: 0.7 },
        { lat: 43.321, lng: -2.934, intensity: 0.9 },
        { lat: 43.322, lng: -2.935, intensity: 0.6 },
        { lat: 43.323, lng: -2.936, intensity: 0.5 },
        { lat: 43.324, lng: -2.937, intensity: 0.7 },
        { lat: 43.325, lng: -2.938, intensity: 0.6 },
        { lat: 43.326, lng: -2.939, intensity: 0.9 },
        { lat: 43.327, lng: -2.930, intensity: 0.5 },
        { lat: 43.328, lng: -2.931, intensity: 0.7 },
        { lat: 43.329, lng: -2.932, intensity: 0.6 },
        { lat: 43.330, lng: -2.933, intensity: 0.5 },
        { lat: 43.331, lng: -2.934, intensity: 0.8 },
        { lat: 43.332, lng: -2.935, intensity: 0.9 },
        { lat: 43.333, lng: -2.936, intensity: 0.7 },
        { lat: 43.334, lng: -2.937, intensity: 0.6 },
        { lat: 43.335, lng: -2.938, intensity: 0.5 }
    ];
      
    const roadsGeoJson = {
        type: "FeatureCollection",
        features: [
            {
                type: "Feature",
                geometry: {
                    type: "LineString",
                    coordinates: [
                        [-2.935, 43.263],
                        [-2.938, 43.265],
                    ],
                },
                properties: { condition: "bad" },
            },
            {
                type: "Feature",
                geometry: {
                    type: "LineString",
                    coordinates: [
                        [-2.930, 43.260],
                        [-2.935, 43.263],
                    ],
                },
                properties: { condition: "good" },
            },
        ],
    };
    
    // Los colores de los botones, en funcion de como sea la carretera
    const getRoadColor = (condition) => {
        switch (condition) {
            case "good":
                return "#4CAF50"; 
            case "mid":
                return "#FFEB3B"; 
            case "bad":
                return "#FF9800"; 
            case "very bad":
                return "#F44336"; 
            default:
                return "#000";
        }
    };

    return (
        <div className="maps-container">
            <div className="maps-row">
                <div className="map-box-container">
                    <h3>Flujo de ciclistas</h3>
                    <MapContainer center={[43.263, -2.935]} zoom={13} className="map-box">
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
                    <h3>Estado de carreteras y carriles</h3>
                    <MapContainer center={[43.263, -2.935]} zoom={13} className="map-box">
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
                <p>This area will contain information about the maps above.</p>
                <p>You can display route information, sensor readings, and other data related to bike usage here.</p>
            </div>
        </div>
    );
};

export default Maps;