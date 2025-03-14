import { useState, useEffect } from "react";
import '../styles/App.css';

const Dashboard = ({ externalAirQualityData, externalNoiseData }) => {
    
    const [airQualityData, setAirQualityData] = useState(externalAirQualityData);
    const [noiseData, setNoiseData] = useState(externalNoiseData);

    const airValueBilbao = Math.round(
        airQualityData.reduce((sum, { value }) => sum + value, 0) / airQualityData.length
    );
    // Convertirlo en angulo
    const angle = (airValueBilbao * 180 / 100) - 90;

    const bestAirQuality = [...airQualityData]
        .sort((a, b) => b.value - a.value)
        .slice(0, 2); // Cojo 2

    const worstAirQuality = [...airQualityData]
        .sort((a, b) => a.value - b.value)
        .slice(0, 2);

    const getAirColorClass = (value) => {
        if (value >= 80) return "good-indicator";
        if (value >= 60) return "moderate-indicator";
        if (value >= 40) return "mid-indicator";
        if (value >= 20) return "bad-indicator";
        return "worst-indicator";
    };
    
    const noiseValueBilbao = Math.round(
        noiseData.reduce((sum, { value }) => sum + value, 0) / noiseData.length
    );
    // Convertirlo en posición vertical (0-120dB)
    const noisePosition = 100 - (noiseValueBilbao / 120 * 100); // 0 abajo, 120 arriba

    const quietestAreas = [...noiseData]
        .sort((a, b) => a.value - b.value)
        .slice(0, 2); 

    const noisestAreas = [...noiseData]
        .sort((a, b) => b.value - a.value)
        .slice(0, 2); 

    const getNoiseColorClass = (value) => {
        if (value <= 25) return "good-indicator";
        if (value <= 50) return "moderate-indicator";
        if (value <= 75) return "mid-indicator";
        if (value <= 100) return "bad-indicator";
        return "worst-indicator";
    };

    // Esto hace que se actualice cuando cambien los valores externos
    useEffect(() => {
        setAirQualityData(externalAirQualityData);
        setNoiseData(externalNoiseData);
    }, [externalAirQualityData, externalNoiseData]);

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
                                    <div className="gauge-needle" style={{ transform: `rotate(${angle}deg)` }}></div>
                                    <div className="gauge-center"></div>
                                </div>
                            </div>
                            <div className="city-info">
                                <div className="city-name">Bilbao</div>
                                <div className="city-score">{airValueBilbao} %</div>
                            </div>
                        </div>
                        <div className="air-quality-divider"></div>
                        <div className="air-quality-right">
                            {/* Establezco los colores correctos para los datos del array de arriba */}
                            <div className="air-quality-rankings top-rankings">
                                <h4>Lugares menos contaminados</h4>
                                {bestAirQuality.map((item, index) => (
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
                                {worstAirQuality.map((item, index) => (
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
                                            <div className="noise-meter-indicator" style={{ top: `${noisePosition}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="city-info">
                                <div className="city-name">Bilbao</div>
                                <div className="city-score">{noiseValueBilbao} dB</div>
                            </div>
                        </div>
                        <div className="noise-divider"></div>
                        <div className="noise-right">
                            <div className="noise-rankings top-rankings">
                                <h4>Zonas más silenciosas</h4>
                                {quietestAreas.map((item, index) => (
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
                                {noisestAreas.map((item, index) => (
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