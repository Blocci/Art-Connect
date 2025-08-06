import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import FaceRecognition from "./FaceRecognition";
import VoiceRecorder from "./VoiceRecorder";
import { useAuth } from "../auth/AuthProvider";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:3001/api";

const Login2FA = () => {

  useEffect(() => {
      document.title = "ArtConnect – Login";
  }, []);

  const [step, setStep] = useState(1);
  const [status, setStatus] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!username || !password || !email) {
      setStatus("Please enter all fields.");
      return;
    }
    if (!email.includes("@")) {
      setStatus("Please enter a valid email address.");
      return;
    } 

    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/login`, {
        email, 
        username,
        password,
      });

      const receivedToken = res.data.token;

      if (!receivedToken) throw new Error("No token received.");

      login(receivedToken);
      setStatus("Login successful. Now scan your face...");
      setStep(2);
    } catch (err) {
      setStatus("Login failed: " + (err.response?.data?.error || "Server error"));
      setUsername("");
      setPassword("");
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="login">
    <div className="login-inner">
      <h2>Login with 2FA</h2>

      <p
        className={`mb-4 text-sm ${
          status.includes("error:")
            ? "text-red-500"
            : status.includes("success:")
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
        <>
          <input
            className="border p-2 w-full rounded text-sm mb-2"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="border p-2 w-full rounded text-sm mb-2"
            type="text"
            autoComplete="username"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            className="border p-2 w-full rounded text-sm mb-4"
            type="password"
            autoComplete="current-password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded w-full mb-4"
            onClick={handleLogin}
            disabled={loading}
          >
            Login
          </button>

          <p className="text-sm text-center">
            Don’t have an account?{" "}
            <Link to="/register" className="text-blue-600 underline">
              Register here
            </Link>
          </p>
        </>
      )}

      {step === 2 && (
        <FaceRecognition
          onUploadComplete={() => {
            setStatus("Face matched. Now record your voice...");
            setStep(3);
          }}
        />
      )}

      {step === 3 && (
        <VoiceRecorder
          mode="verify"
          onUploadComplete={() => {
            setStatus("Voice verified. Redirecting...");
            setStep(4);
            setTimeout(() => navigate("/dashboard"), 1000);
          }}
        />
      )}

      {step === 4 && (
        <div className="mt-4 text-green-600 font-semibold text-center">
          Logged in successfully!
        </div>
      )}
    </div>
  </div>
);
};

export default Login2FA;