import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import Register from "./Register";

const Login = ({ setToken }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loginStatus, setLoginStatus] = useState(null);
    const navigate = useNavigate();

    const loginButton = (e) => {
        e.preventDefault();
        fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.token) {
                // Login successful
                localStorage.setItem('token', data.token);
                setToken(data.token);
                navigate('/', { replace: true });
            } else {
                setLoginStatus(data.error);
            }
        })
        .catch(error => {
            console.error(error);
            setLoginStatus(error);
        });
    }

    const navigateToRegister = () => {
        // Use history to navigate to the "/register" route
        navigate('/register', { replace: true });
    };

    return (
        <div className="container d-flex justify-content-center align-items-center vh-100">
            <div className="card">
                <div className="card-body">
                    <h2 className="card-title">Login</h2>
                    <form id="login-form">
                        <div className="mb-3">
                            <label htmlFor="username" className="form-label">Username:</label>
                            <input type="text" id="username" className="form-control" required onChange={e => setUsername(e.target.value)} />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="password" className="form-label">Password:</label>
                            <input type="password" id="password" className="form-control" required onChange={e => setPassword(e.target.value)} />
                        </div>

                        <button type="submit" className="btn btn-primary" onClick={loginButton}>
                            Login
                        </button>

                        {loginStatus && <p className="mt-3">{loginStatus}</p>}
                    </form>
                    
                    <p className="mt-3">Don't have an account? </p>
                    <button className="btn btn-link" onClick={navigateToRegister}>Register account</button>
                </div>
            </div>
        </div>
    );
}

export default Login;