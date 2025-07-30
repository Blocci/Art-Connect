import React, { useState } from "react";
import axios from "axios";
import FaceRecognition from "./FaceRecognition";
import VoiceRecorder from "./VoiceRecorder";
import { useAuth } from "../auth/AuthProvider"; // ✅
import { useNavigate } from "react-router-dom"; // ✅

const API_BASE = process.env.REACT_APP_API_BASE || "https://your-backend.onrender.com/api";

const Register2FA = () => {
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!username || !password) {
      setStatus("Please enter a username and password.");
      return;
    }

    try {
      const res = await axios.post(`${API_BASE}/api/register`, {
        username,
        password,
      });

      const receivedToken = res.data.token;

      login(receivedToken); // ✅ Store token via context
      setStatus("✅ Registered. Now scan your face...");
      setStep(2);
    } catch (err) {
      console.error(err);
      setStatus("❌ Registration failed.");
    }
  };

  const handleVoiceDone = () => {
    setStatus("🎉 Voice uploaded. Registration complete!");

    setStep(4);

    setTimeout(() => {
      navigate("/dashboard"); // optional — or redirect to /login if you prefer
    }, 1000);
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Register with Face + Voice</h2>
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
            onClick={handleRegister}
          >
            Register
          </button>
        </div>
      )}

      {step === 2 && (
        <FaceRecognition
          mode="register"
          onUploadComplete={() => {
            setStatus("✅ Face uploaded. Now record your voice...");
            setStep(3);
          }}
        />
      )}

      {step === 3 && (
        <VoiceRecorder
          mode="register"
          onUploadComplete={handleVoiceDone}
        />
      )}

      {step === 4 && (
        <div className="mt-4 text-green-600 font-semibold">
          ✅ Registration complete!
        </div>
      )}
    </div>
  );
};

export default Register2FA;