import { useState, useEffect } from "react";
import '../styles/App.css';

const Dashboard = ({ externalAirQualityData }) => {
    
    const [airQualityData, setAirQualityData] = useState(externalAirQualityData);

    const valueBilbao = Math.round(
        airQualityData.reduce((sum, { value }) => sum + value, 0) / airQualityData.length
    );
    // Convertirlo en angulo
    const angle = (valueBilbao * 180 / 100) - 90;

    const bestAirQuality = [...airQualityData]
        .sort((a, b) => b.value - a.value)
        .slice(0, 2); // Cojo 2

    const worstAirQuality = [...airQualityData]
        .sort((a, b) => a.value - b.value)
        .slice(0, 2);

    const getColorClass = (value) => {
        if (value >= 80) return "good-indicator";
        if (value >= 60) return "moderate-indicator";
        if (value >= 40) return "mid-indicator";
        if (value >= 20) return "bad-indicator";
        return "worst-indicator";
    };

    // Esto hace que se actualice cuando cambien los valores externos
    useEffect(() => {
        setAirQualityData(externalAirQualityData);
    }, [externalAirQualityData]);

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
                                <div className="city-score">{valueBilbao} %</div>
                            </div>
                        </div>
                        <div className="air-quality-divider"></div>
                        <div className="air-quality-right">
                            {/* Establezco los colores correctos para los datos del array de arriba */}
                            <div className="air-quality-rankings top-rankings">
                                <h4>Lugares con menor contaminación</h4>
                                {bestAirQuality.map((item, index) => (
                                    <div key={index} className="ranking-item">
                                        <span className="ranking-name">{item.name}</span>
                                        <div className="ranking-score">
                                            <span>{item.value}</span>
                                            <div className={`color-indicator ${getColorClass(item.value)}`}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="air-quality-rankings bottom-rankings">
                                <h4>Lugares con mayor contaminación</h4>
                                {worstAirQuality.map((item, index) => (
                                    <div key={index} className="ranking-item">
                                        <span className="ranking-name">{item.name}</span>
                                        <div className="ranking-score">
                                            <span>{item.value}</span>
                                            <div className={`color-indicator ${getColorClass(item.value)}`}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="dashboard-card">
                    <span>Niveles de Ruido</span>
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