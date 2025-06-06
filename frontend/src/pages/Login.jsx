import { useState } from 'react';
import '../styles/App.css';

const Login = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!username || !password) {
            setError("Por favor introduce nombre de usuario y contraseña")
            return
        }
        const success = onLogin(username, password)
        if (!success) {
            setError("Usuario o contraseña incorrectos")
        }
    };

    return (
        <div>
            <div className="login-container">
                <div className="card login-card">
                    <h2>Sistema de Monitorización de Bicicletas</h2>
                    {error && <p className="error-message" style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}
                    <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Usuario</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Introduce tu nombre de usuario"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Contraseña</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Introduce tu contraseña"
                        />
                    </div>
                    <button type="submit" style={{ width: '100%' }}>Login</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;