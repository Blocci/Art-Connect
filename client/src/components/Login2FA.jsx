import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom"; // ✅ import Link
import axios from "axios";
import FaceRecognition from "./FaceRecognition";
import VoiceRecorder from "./VoiceRecorder";
import { useAuth } from "../auth/AuthProvider";

const API_BASE = process.env.REACT_APP_API_BASE;

const Login2FA = () => {
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // Added loading state

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!username || !password) {
      setStatus("Enter username and password.");
      return;
    }

    setLoading(true); // Set loading to true when initiating the login
    try {
      const res = await axios.post(`${API_BASE}/login`, {
        username,
        password,
      });

      const receivedToken = res.data.token;

      login(receivedToken);
      setStatus("✅ Login successful. Now scan your face...");
      setStep(2);
    } catch (err) {
      setStatus("❌ Login failed: " + (err.response?.data?.error || "Server error"));
      
      // Hard reload to reset the page and state after login failure
      setTimeout(() => {
        window.location.reload(); // Reload the page
      }, 1500); // Add a small delay before reloading (optional)
    } finally {
      setLoading(false); // Reset loading state after API call
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Login with 2FA</h2>
      <p
        className={`mb-4 text-sm ${
          status.includes("❌")
            ? "text-red-500"
            : status.includes("✅")
            ? "text-green-600"
            : status
            ? "text-blue-500"
            : "text-gray-600"
        }`}
      >
        {status}
      </p>

      {loading && (
        <div className="flex justify-center items-center mb-4">
          <div className="w-6 h-6 border-t-2 border-blue-500 border-solid rounded-full animate-spin" />
        </div>
      )}

      {step === 1 && (
        <div className="space-y-2">
          <input
            className="border p-2 w-full"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            className="border p-2 w-full"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={handleLogin}
          >
            Login
          </button>

          <p className="text-sm mt-4">
            Don’t have an account?{" "}
            <Link to="/register" className="text-blue-600 underline">
              Register here
            </Link>
          </p>
        </div>
      )}

      {step === 2 && (
        <FaceRecognition
          onUploadComplete={() => {
            setStatus("✅ Face matched. Now record your voice...");
            setStep(3);
          }}
        />
      )}

      {step === 3 && (
        <VoiceRecorder
          mode="verify"
          onUploadComplete={() => {
            setStatus("✅ Voice verified. Redirecting...");
            setStep(4);

            setTimeout(() => {
              navigate("/dashboard");
            }, 1000);
          }}
        />
      )}

      {step === 4 && (
        <div className="mt-4 text-green-600 font-semibold">
          🎉 Logged in successfully!
        </div>
      )}
    </div>
  );
};

export default Login2FA;