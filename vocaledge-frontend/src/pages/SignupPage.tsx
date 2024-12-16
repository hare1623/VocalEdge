/* eslint-disable @typescript-eslint/no-explicit-any */
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import api from "../utils/api";

// Form validation schema
const schema = yup.object().shape({
  name: yup.string().required("Name is required"),
  email: yup.string().email("Invalid email format").required("Email is required"),
  phone: yup
    .string()
    .matches(/^[0-9]{10}$/, "Phone number must be 10 digits")
    .required("Phone is required"),
  password: yup.string().min(6, "Password must be at least 6 characters").required(),
});

const SignupPage = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [otpSent, setOtpSent] = useState(false); 
  const navigate = useNavigate(); 

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  // Handle form submission
  const onSubmit = async (data: any) => {
    setLoading(true);
    setMessage("");

    try {
      const response = await api.post("/user/signup", data);
      setOtpSent(true); 
      setMessage("Signup successful! OTP sent to your email or phone.");
      console.log("User ID:", response.data.userId); 
      navigate("/verify-otp", { state: { userId: response.data.userId } });
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Signup failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h2 className="text-3xl font-bold mb-6 text-blue-600">Signup to VocalEdge</h2>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md bg-white p-6 rounded-lg shadow-md"
      >
        {/* Name Input */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Name"
            {...register("name")}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
        </div>

        {/* Email Input */}
        <div className="mb-4">
          <input
            type="email"
            placeholder="Email"
            {...register("email")}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
        </div>

        {/* Phone Input */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Phone"
            {...register("phone")}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
        </div>

        {/* Password Input */}
        <div className="mb-4">
          <input
            type="password"
            placeholder="Password"
            {...register("password")}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-300"
          disabled={loading}
        >
          {loading ? "Signing up..." : "Sign Up"}
        </button>
      </form>

      {/* Message Section */}
      {message && (
        <p
          className={`mt-4 text-center ${
            otpSent ? "text-green-600" : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default SignupPage;
