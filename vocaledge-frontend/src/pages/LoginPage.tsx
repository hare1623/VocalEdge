/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import api from "../utils/api";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await api.post("/user/login", { email, password });

      // Store JWT Token in cookies
      Cookies.set("token", response.data.token, { expires: 1, secure: true }); 
      setMessage("Login successful! Redirecting...");
      
      setTimeout(() => navigate("/dashboard"), 1500); 
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Login failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h2 className="text-3xl font-bold mb-6 text-blue-600">Login</h2>
      <div className="w-full max-w-sm bg-white p-6 rounded-lg shadow-md">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 mb-4 border rounded focus:ring-2 focus:ring-blue-400"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 mb-4 border rounded focus:ring-2 focus:ring-blue-400"
        />

        <button
          onClick={handleLogin}
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-300"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {message && <p className="mt-4 text-red-600 text-center">{message}</p>}
      </div>
    </div>
  );
};

export default LoginPage;
