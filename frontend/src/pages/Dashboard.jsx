import '../styles/App.css';

const Dashboard = () => {
    return (
        <div>
            <h2 style={{ marginBottom: '20px' }}>Dashboard</h2>
            <div className="dashboard-container">
                <div className="dashboard-card">
                    <span>Calidad del Aire</span>
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