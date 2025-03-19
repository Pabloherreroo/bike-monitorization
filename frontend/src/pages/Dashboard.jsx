import { useMemo } from "react";
import '../styles/Dashboard.css';

const Dashboard = ({ bikeData, bikes }) => {
    
    const processedData = useMemo(() => {
        // Verificamos si hay datos disponibles y si no predeterminados
        if (!bikeData || bikeData.length === 0) {
            return {
                airValueBilbao: 0,
                noiseValueBilbao: 0,
                bestAirQuality: [],
                worstAirQuality: [],
                quietestAreas: [],
                noisestAreas: [],
                angle: -90,
                noisePosition: 100 
            };
        }

        // Solo ultimos 2 días
        const dosdiasAtras = new Date();
        dosdiasAtras.setDate(dosdiasAtras.getDate() - 2);
        
        const datosFiltrados = bikeData.filter(dato => {
            const fechaDato = new Date(dato.fecha);
            return fechaDato >= dosdiasAtras;
        });
        
        const airValueBilbao = Math.round(
            datosFiltrados.reduce((sum, dato) => sum + dato.calidad_ambiental, 0) / datosFiltrados.length
        );
        
        const noiseValueBilbao = Math.round(
            datosFiltrados.reduce((sum, dato) => sum + dato.ruido, 0) / datosFiltrados.length
        );
        
        const barriosMap = {};
        
        datosFiltrados.forEach(dato => {
            if (!dato.barrio) return; // Ignoramos datos sin barrio
            if (!barriosMap[dato.barrio]) {
                barriosMap[dato.barrio] = {
                    totalCalidadAmbiental: 0,
                    totalRuido: 0,
                    count: 0
                };
            }
            barriosMap[dato.barrio].totalCalidadAmbiental += dato.calidad_ambiental;
            barriosMap[dato.barrio].totalRuido += dato.ruido;
            barriosMap[dato.barrio].count++;
        });
        
        const barriosAirQuality = [];
        const barriosNoise = [];
        
        Object.entries(barriosMap).forEach(([barrio, datos]) => {
            if (datos.count > 0) {
                barriosAirQuality.push({
                    name: barrio,
                    value: Math.round(datos.totalCalidadAmbiental / datos.count)
                });
                
                barriosNoise.push({
                    name: barrio,
                    value: Math.round(datos.totalRuido / datos.count)
                });
            }
        });
        
        const bestAirQuality = [...barriosAirQuality]
            .sort((a, b) => b.value - a.value)
            .slice(0, 2);
            
        const worstAirQuality = [...barriosAirQuality]
            .sort((a, b) => a.value - b.value)
            .slice(0, 2);
            
        const quietestAreas = [...barriosNoise]
            .sort((a, b) => a.value - b.value)
            .slice(0, 2);
            
        const noisestAreas = [...barriosNoise]
            .sort((a, b) => b.value - a.value)
            .slice(0, 2);
        
        const angle = (airValueBilbao * 180 / 100) - 90;
        const noisePosition = 100 - (noiseValueBilbao / 120 * 100);
        
        return {
            airValueBilbao,
            noiseValueBilbao,
            bestAirQuality,
            worstAirQuality,
            quietestAreas,
            noisestAreas,
            angle,
            noisePosition
        };
    }, [bikeData]);

    const getAirColorClass = (value) => {
        if (value >= 80) return "good-indicator";
        if (value >= 60) return "moderate-indicator";
        if (value >= 40) return "mid-indicator";
        if (value >= 20) return "bad-indicator";
        return "worst-indicator";
    };

    const getNoiseColorClass = (value) => {
        if (value <= 25) return "good-indicator";
        if (value <= 50) return "moderate-indicator";
        if (value <= 75) return "mid-indicator";
        if (value <= 100) return "bad-indicator";
        return "worst-indicator";
    };

    const isBikeTest = (bikeId) => {
        return /^BP\d+$/.test(bikeId)
    }

    return (
        <div>
            <h2>Dashboard</h2>
            <div className="dashboard-container">
                <div className="dashboard-card-container">
                    <h3 className="dashboard-card-title">Calidad del Aire</h3>
                    <div className="dashboard-card air-quality-card">
                        <div className="air-quality-left">
                            <div className="gauge-container">
                                <div className="gauge">
                                    <div className="gauge-sections"></div>
                                    {/* Hago aquí el estilo dinámico de la aguja porque depende de una variable de ángulo */}
                                    <div className="gauge-needle" style={{ transform: `rotate(${processedData.angle}deg)` }}></div>
                                    <div className="gauge-center"></div>
                                </div>
                            </div>
                            <div className="city-info">
                                <div className="city-name">Bilbao</div>
                                <div className="city-score">{processedData.airValueBilbao} %</div>
                            </div>
                        </div>
                        <div className="air-quality-divider"></div>
                        <div className="air-quality-right">
                            {/* Establezco los colores correctos para los datos de arriba */}
                            <div className="air-quality-rankings top-rankings">
                                <h4>Lugares menos contaminados</h4>
                                {processedData.bestAirQuality.map((item, index) => (
                                    <div key={index} className="ranking-item">
                                        <span className="ranking-name">{item.name}</span>
                                        <div className="ranking-score">
                                            <span>{item.value}</span>
                                            <div className={`color-indicator ${getAirColorClass(item.value)}`}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="air-quality-rankings bottom-rankings">
                                <h4>Lugares más contaminados</h4>
                                {processedData.worstAirQuality.map((item, index) => (
                                    <div key={index} className="ranking-item">
                                        <span className="ranking-name">{item.name}</span>
                                        <div className="ranking-score">
                                            <span>{item.value}</span>
                                            <div className={`color-indicator ${getAirColorClass(item.value)}`}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="dashboard-card-container">
                    <h3 className="dashboard-card-title">Niveles de Ruido</h3>
                    <div className="dashboard-card noise-card">
                        <div className="noise-left">
                            <div className="noise-meter-container">
                                <div className="noise-scale">
                                    <div className="noise-meter-with-labels">
                                        <div className="noise-scale-labels">
                                            <span className="noise-scale-label noise-scale-top">120 dB</span>
                                            <span className="noise-scale-label noise-scale-bottom">0 dB</span>
                                        </div>
                                        <div className="noise-meter">
                                            <div className="noise-meter-gradient"></div>
                                            {/* Línea horizontal que muestra el nivel de ruido actual */}
                                            <div className="noise-meter-indicator" style={{ top: `${processedData.noisePosition}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="city-info">
                                <div className="city-name">Bilbao</div>
                                <div className="city-score">{processedData.noiseValueBilbao} dB</div>
                            </div>
                        </div>
                        <div className="noise-divider"></div>
                        <div className="noise-right">
                            <div className="noise-rankings top-rankings">
                                <h4>Zonas más silenciosas</h4>
                                {processedData.quietestAreas.map((item, index) => (
                                    <div key={index} className="ranking-item">
                                        <span className="ranking-name">{item.name}</span>
                                        <div className="ranking-score">
                                            <span>{item.value}</span>
                                            <div className={`color-indicator ${getNoiseColorClass(item.value)}`}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="noise-rankings bottom-rankings">
                                <h4>Zonas más ruidosas</h4>
                                {processedData.noisestAreas.map((item, index) => (
                                    <div key={index} className="ranking-item">
                                        <span className="ranking-name">{item.name}</span>
                                        <div className="ranking-score">
                                            <span>{item.value}</span>
                                            <div className={`color-indicator ${getNoiseColorClass(item.value)}`}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="dashboard-card-container">
                    <h3 className="dashboard-card-title">Alertas</h3>
                    <div className="dashboard-card alert-card">
                        
                    </div>
                </div>
                <div className="dashboard-card-container">
                    <h3 className="dashboard-card-title">Estado de bicicletas</h3>
                    <div className="dashboard-card estado-card">
                        <div className="bikes-list-container">
                            {bikes && bikes.length > 0 ? (
                                bikes.map((bike, index) => (
                                    <div key={index} className="bike-row">
                                        <div className={`bike-icon ${isBikeTest(bike.bike_id) ? 'test-bike-icon' : 'normal-bike-icon'}`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                                                <path d="M18.18 10l-1.7-4.68A2.008 2.008 0 0 0 14.6 4H12v2h2.6l1.46 4h-4.81l-.36-1H12V7H7v2h1.75l1.82 5H9.9c-.44-2.23-2.31-3.88-4.65-3.99C2.45 9.87 0 12.2 0 15c0 2.8 2.2 5 5 5 2.46 0 4.45-1.69 4.9-4h4.2c.44 2.23 2.31 3.88 4.65 3.99 2.8.13 5.25-2.19 5.25-5 0-2.8-2.2-5-5-5h-.82zM7.82 16c-.4 1.17-1.49 2-2.82 2-1.68 0-3-1.32-3-3s1.32-3 3-3c1.33 0 2.42.83 2.82 2H5v2h2.82zm6.28-2h-1.4l-.73-2H15c-.44.58-.76 1.25-.9 2zm4.9 4c-1.68 0-3-1.32-3-3 0-.93.41-1.73 1.05-2.28l.96 2.64 1.88-.68-.97-2.67c.03 0 .06-.01.09-.01 1.68 0 3 1.32 3 3s-1.33 3-3.01 3z"/>
                                            </svg>
                                        </div>
                                        <div className="bike-name">{bike.bike_id}</div>
                                        <div className={`bike-status ${bike.estado === 'en funcionamiento' ? 'status-active' : 'status-inactive'}`}>
                                            <span>{bike.estado === 'en funcionamiento' ? 'En movimiento' : 'Parada'}</span>
                                            <div className={`status-indicator ${bike.estado === 'en funcionamiento' ? 'indicator-active' : 'indicator-inactive'}`}></div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="no-bikes-message">No hay datos de bicicletas disponibles</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;