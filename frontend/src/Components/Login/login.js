import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        const adminUsername = 'admin';
        const adminPassword = 'password123';

        if (username === adminUsername && password === adminPassword) {
            setMessage('Login successful');
            navigate('/dashboard');
        } else {
            setMessage('Login failed');
        }
    };

    return (
        <div className="login-container">
            <form className="login-form" onSubmit={handleSubmit}>
                <h2 className='login'>Login</h2><br/>
                <input 
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input 
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                /><br/>
                <button type="submit">Login</button>
                {message && <p>{message}</p>}
            </form>
        </div>
    );
};

export default Login;
