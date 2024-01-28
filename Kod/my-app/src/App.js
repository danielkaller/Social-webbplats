import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import Home from './Home';
import Login from './Login';
import Register from './Register'
import Logout from './Logout'
import FindUsers from './FindUsers';
import MyPage from './MyPage';
import Navbar from './Navbar';
import Page from './Page';
import UserPage from './UserPage';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  
  return (
    <Router>
      <div>
        {token && <Navbar />}
        <Routes>
          <Route path="/" element={token ? <Home token={token}/> : <Login setToken={setToken} />} />
          <Route path="/findUsers" element={token ? <FindUsers token={token}/> : <Login setToken={setToken} />} />
          <Route path="/myPage" element={token ? <MyPage token={token}/> : <Login setToken={setToken} />} />
          <Route path="/logout" element={<Logout setToken={setToken} />} />
          <Route path="/login" element={<Login setToken={setToken} />} />
          <Route path="/register" element={<Register />} />

          <Route path="/user/:username" element={token ? <UserPage token={token}/> : <Login setToken={setToken} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;