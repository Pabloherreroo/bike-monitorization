import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DistrictTable from "../components/DistrictTable"
import '../styles/App.css';

const MainLayout = ({ children, bikeData }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const isMapsActive = location.pathname === '/maps';
    const [isTableOpen, setIsTableOpen] = useState(false)
    
    const toggleView = () => {
        if (isMapsActive) {
        navigate('/dashboard');
        } else {
        navigate('/maps');
        }
    };

    const toggleTable = () => {
        setIsTableOpen(!isTableOpen)
    }

    return (
        <div>
            <header className="header">
                <h1>Sistema de Monitorización de Bicicletas</h1>
                <div className="header-controls">
                    <button className="table-button" onClick={toggleTable} title="Ver evaluación de distritos">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <path d="M3 9h18" />
                            <path d="M9 21V9" />
                        </svg>
                    </button>
                    <div className="switch-container">
                        <span>{isMapsActive ? "Mapas" : "Dashboard"}</span>
                        <label className="switch">
                            <input type="checkbox" checked={isMapsActive} onChange={toggleView} />
                            <span className="slider"></span>
                        </label>
                    </div>
                </div>
            </header>
            <main className="container" style={{ marginTop: '20px' }}>
                {children}
            </main>
            <DistrictTable bikeData={bikeData} isOpen={isTableOpen} onClose={() => setIsTableOpen(false)} />
        </div>
    );
};

export default MainLayout;