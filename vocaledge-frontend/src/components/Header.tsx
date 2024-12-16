import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => (
  <header>
    <h1>VocalEdge</h1>
    <nav>
      <Link to="/">Home</Link> | <Link to="/signup">Signup</Link> | <Link to="/login">Login</Link>
    </nav>
  </header>
);

export default Header;
