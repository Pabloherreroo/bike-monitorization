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
                <div className="dashboard-card">
                    <span>Alertas</span>
                </div>
                <div className="dashboard-card">
                    <span>Estatus de bicicletas</span>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;