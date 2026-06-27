import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaEye, FaEyeSlash, FaSignInAlt } from 'react-icons/fa';
import './login.css';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
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
        <div className="login-page">
            <div className="login-wrap">
                <div className="login-title">
                    <h1 className="login-title1">Admin</h1>
                    <h1 className="login-title2">Login</h1>
                </div>

                <div className="login-card">
                    <form onSubmit={handleSubmit}>
                        <label>Username</label>
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            autoComplete="username"
                        />

                        <label>Password</label>
                        <div className="password-wrap">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                className="eye-btn"
                                onClick={() => setShowPassword((s) => !s)}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                title={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>

                        <button type="submit" className="login-submit-btn" disabled={loading}>
                            {loading ? 'Logging in…' : 'Login'} <FaSignInAlt />
                        </button>

                        {message && <p className="login-error">{message}</p>}
                    </form>

                    <p className="back-home" onClick={() => navigate('/')}>← Back to site</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
