import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';
import SignupPage from '../pages/SignupPage';
// import LoginPage from '../pages/LoginPage';
// import Dashboard from '../pages/Dashboard';

const AppRouter: React.FC = () => (
  <Router>
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/signup" element={<SignupPage />} />
      {/* <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<Dashboard />} /> */}
    </Routes>
  </Router>
);

export default AppRouter;
