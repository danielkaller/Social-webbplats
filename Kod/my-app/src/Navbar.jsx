import React from 'react';
import { NavLink } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ml-auto">
          <li className="nav-item">
              <NavLink className="nav-link" to="/" activeClassName="active">Home</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/findUsers" activeClassName="active">Find Users</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/myPage" activeClassName="active">My Page</NavLink>
            </li>
            <li className="nav-item right">
              <NavLink className="nav-link" to="/logout" activeClassName="active">Logout</NavLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;