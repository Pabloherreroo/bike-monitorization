import { useState } from 'react';
import '../styles/Maps.css';

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

    return (
        <div className="maps-container">
            <div className="maps-row">
                <div className="map-box-container">
                    <div className="map-box">
                        <span>Mapa 1</span>
                    </div>
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
                    <div className="map-box">
                        <span>Mapa 2</span>
                    </div>
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