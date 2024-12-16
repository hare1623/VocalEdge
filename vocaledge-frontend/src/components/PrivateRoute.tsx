import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import Cookies from "js-cookie";

const PrivateRoute: React.FC = () => {
  const token = Cookies.get("token"); // Retrieve the token from cookies

  return token ? <Outlet /> : <Navigate to="/" replace />;
};

export default PrivateRoute;
