import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DistrictTable from "../components/DistrictTable"
import '../styles/App.css';
import { ejecutarTestDinamico, borrarDatosB2 } from "../api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const MainLayout = ({ children, bikeData, toggleHideTestBikes, hideTestBikes, onLogout }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const isMapsActive = location.pathname === '/maps';
    const [isTableOpen, setIsTableOpen] = useState(false);
    const [mostrarMenuPruebas, setMostrarMenuPruebas] = useState(false);
    const menuRef = useRef(null);
    
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

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMostrarMenuPruebas(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const ejecutarPrueba = async () => {
        try {
            const res = await ejecutarTestDinamico();
            toast.success(res.mensaje || "Test ejecutado con éxito");
        } catch (err) {
            toast.error("Error al ejecutar el test");
        }
    };
    
    const borrarDatos = async () => {
        try {
            const res = await borrarDatosB2();
            toast.success(res.mensaje || "Datos de prueba dinámica borrados");
            if (res.bici_eliminada) {
                toast.info("La bici B2 fue eliminada de la base de datos.");
            } else {
                toast.info("No se encontró la bici B2 en la base de datos.");
            }
        } catch (err) {
            toast.error("Error al borrar datos de prueba dinámica");
        }
    };
    

    return (
        <div>
            <header className="header">
                <h1>Sistema de Monitorización de Bicicletas</h1>
                <div className="header-controls">
                    <button className="dynamic-test-button" onClick={() => setMostrarMenuPruebas(!mostrarMenuPruebas)} title="Ejecutar/Borrar test dinámico">
                        <img
                            src="/src/assets/varita.png"
                            alt="Icono tests dinámicos"
                            className="icon-img"
                        />
                    </button>
                    {mostrarMenuPruebas && (
                        <div className="test-menu" ref={menuRef}>
                            <button onClick={ejecutarPrueba}>Ejecutar prueba</button>
                            <button onClick={borrarDatos}>Borrar datos B2</button>
                        </div>
                    )}
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