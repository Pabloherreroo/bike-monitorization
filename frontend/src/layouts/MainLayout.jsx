import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DistrictTable from "../components/DistrictTable"
import '../styles/App.css';

const MainLayout = ({ children, bikeData, toggleHideTestBikes, hideTestBikes, onLogout }) => {
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

    const handleLogout = () => {
        onLogout()
        navigate("/login")
    }

    return (
        <div>
            <header className="header">
                <h1>Sistema de Monitorización de Bicicletas</h1>
                <div className="header-controls">
                    <button className="test-bikes-button" onClick={toggleHideTestBikes}>
                        {hideTestBikes ? "Mostrar datos de prueba" : "Quitar datos de prueba"}
                    </button>
                    <button className="table-button" onClick={toggleTable} title="Ver evaluación de distritos">
                        <img
                            src="/src/assets/tabla.png"
                            alt="Icono tabla"
                            className="icon-img"
                        />
                    </button>
                    <div className="switch-container">
                        <span>{isMapsActive ? "Mapas" : "Dashboard"}</span>
                        <label className="switch">
                            <input type="checkbox" checked={isMapsActive} onChange={toggleView} />
                            <span className="slider"></span>
                        </label>
                    </div>
                    <button className="logout-button" onClick={handleLogout}>
                        Salir
                    </button>
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