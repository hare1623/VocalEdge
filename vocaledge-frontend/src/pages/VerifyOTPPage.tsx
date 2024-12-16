/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../utils/api";

const VerifyOtpPage = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  const userId = location.state?.userId;

  const handleVerifyOtp = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await api.post("/user/verify-otp", { userId, otp });
      const { token } = response.data;

      // Store JWT Token
      localStorage.setItem("token", token);

      setMessage("OTP verified successfully! Redirecting to dashboard...");
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (error: any) {
      setMessage(error.response?.data?.message || "OTP verification failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h2 className="text-3xl font-bold mb-6 text-blue-600">Verify OTP</h2>
      <div className="w-full max-w-sm bg-white p-6 rounded-lg shadow-md">
        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="w-full px-4 py-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <button
          onClick={handleVerifyOtp}
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-300 mb-2"
          disabled={loading}
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>

        {message && <p className="mt-4 text-center text-red-600">{message}</p>}
      </div>
    </div>
  );
};

export default VerifyOtpPage;
