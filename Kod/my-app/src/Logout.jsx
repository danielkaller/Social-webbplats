import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Logout = ({ setToken }) => {
  let navigate = useNavigate();

  useEffect(() => {
    // Remove the token from local storage
    localStorage.removeItem('token');
    
    // Set the token state to null
    setToken(null);

    // Navigate to the login page
    navigate('/login', { replace: true });
  }, [navigate, setToken]);

  // This component can return null or a message if needed

  return null;
};

export default Logout;