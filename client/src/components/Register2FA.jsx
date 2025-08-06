import React, { useEffect, useState } from "react";
import axios from "axios";
import FaceRecognition from "./FaceRecognition";
import VoiceRecorder from "./VoiceRecorder";
import { useAuth } from "../auth/AuthProvider";
import { useNavigate } from "react-router-dom";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:3001/api";

const Register2FA = () => {

  useEffect(() => {
      document.title = "ArtConnect – Register";
  }, []);

  const [step, setStep] = useState(1);
  const [status, setStatus] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async () => {
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
      const res = await axios.post(`${API_BASE}/register`, { email, username, password });
      const receivedToken = res.data.token;
      if (!receivedToken) throw new Error("No token received");

      login(receivedToken);
      setStatus("Registered. Now scan your face...");
      setStep(2);
    } catch (err) {
      console.error(err);
      setStatus("Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceDone = () => {
    setStatus("Voice uploaded. Registration complete!");
    setStep(4);
    setTimeout(() => navigate("/dashboard"), 1000);
  };

  const goToLogin = () => navigate("/login");

  return (
  <div className="register">
    <div className="register-inner">
      <h2>Register with Face + Voice</h2>

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
            onClick={handleRegister}
            disabled={loading}
          >
            Register
          </button>
        </>
      )}

      {step === 2 && (
        <FaceRecognition
          mode="register"
          onUploadComplete={() => {
            setStatus("Face uploaded. Now record your voice...");
            setStep(3);
          }}
        />
      )}

      {step === 3 && (
        <VoiceRecorder mode="register" onUploadComplete={handleVoiceDone} />
      )}

      {step === 4 && (
        <div className="mt-4 text-green-600 font-semibold text-center">
          Registration complete!
        </div>
      )}

      <div className="mt-4">
        <button
          onClick={goToLogin}
          className="bg-gray-600 text-white px-4 py-2 rounded w-full"
        >
          Already have an account? Login here
        </button>
      </div>
    </div>
  </div>
);
};

export default Register2FA;