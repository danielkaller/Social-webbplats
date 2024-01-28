import { useNavigate } from 'react-router-dom';
import React, { useState } from "react";

const Register = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [registrationStatus, setRegistrationStatus] = useState(null);
    const navigate = useNavigate();

    const registerUser = (e) => {
        e.preventDefault();

        fetch("http://localhost:3000/api/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.message === "User registered successfully") {
                    // Registration successful
                    setPassword("");
                    setUsername("");
                    setRegistrationStatus("Registration successful");
                } else if (data.error) {
                    setRegistrationStatus("Registration failed: " + data.error);
                } else {
                    // Registration failed
                    setRegistrationStatus("Registration failed");
                }
            })
            .catch((error) => {
                console.error(error);
                setRegistrationStatus("An error occurred during registration");
            });
    };

    const navigateToLogin = () => {
        // Use history to navigate to the "/register" route
        navigate('/login', { replace: true });
    };


    return (
        <div className="container d-flex justify-content-center align-items-center vh-100">
            <div className="card">
                <div className="card-body">
                    <h2 className="card-title">Register</h2>
                    <form id="register-form">
                        <div className="mb-3">
                            <label htmlFor="username" className="form-label">Username:</label>
                            <input type="text" id="username" className="form-control" required value={username} onChange={(e) => setUsername(e.target.value)} />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="password" className="form-label">Password:</label>
                            <input type="password" id="password" className="form-control" required value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>

                        <button type="submit" className="btn btn-primary" onClick={registerUser}>
                            Register
                        </button>

                        {registrationStatus && <p className="mt-3">{registrationStatus}</p>}
                    </form>

                    <p className="mt-3">Already have an account? </p>
                    <button className="btn btn-link" onClick={navigateToLogin}>Login to account</button>
                </div>
            </div>
        </div>
    );
};

export default Register;