import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './login.css';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setLoading(true);
        try {
            await login(username, password);
            navigate('/admin');
        } catch (err) {
            setMessage(err.response?.data?.message || 'Login failed. Check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div id="login">
            <div className="login-container">
                <form className="login-form" onSubmit={handleSubmit}>
                    <h2 className='login'>Admin Login</h2><br />
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        autoComplete="username"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                    /><br />
                    <button type="submit" disabled={loading}>
                        {loading ? 'Logging in…' : 'Login'}
                    </button>
                    {message && <p>{message}</p>}
                    <p className="back-home" onClick={() => navigate('/')}>← Back to site</p>
                </form>
            </div>
        </div>
    );
};

export default Login;
