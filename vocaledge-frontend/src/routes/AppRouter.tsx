import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "../pages/LandingPage";
import SignupPage from "../pages/SignupPage";
import VerifyOTPPage from "../pages/VerifyOTPPage";
import LoginPage from "../pages/LoginPage";
import Dashboard from "../pages/Dashboard";
import FileUploadPage from "../pages/FileUploadPage";
import PrivateRoute from "../components/PrivateRoute";

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/verify-otp" element={<VerifyOTPPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/upload" element={<FileUploadPage />} />
        </Route>

        {/* Catch-All Route */}
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
