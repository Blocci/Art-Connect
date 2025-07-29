import React, { useState } from "react";
import axios from "axios";
import FaceRecognition from "./FaceRecognition";
import VoiceRecorder from "./VoiceRecorder";

const API_BASE = "https://localhost:3001";

const Register2FA = () => {
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");

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
      localStorage.setItem("token", receivedToken);
      setToken(receivedToken);

      setStatus("✅ Registered. Now scan your face...");
      setStep(2);
    } catch (err) {
      console.error(err);
      setStatus("❌ Registration failed.");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Register with Face + Voice</h2>
      <p className="mb-4 text-sm text-gray-600">{status}</p>

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

      {step === 2 && token && (
        <FaceRecognition
          onUploadComplete={() => {
            setStatus("✅ Face uploaded. Now record your voice...");
            setStep(3);
          }}
        />
      )}

      {step === 3 && token && (
        <VoiceRecorder
          token={token}
          mode="register"
          onUploadComplete={() => {
            setStatus("🎉 Voice uploaded. Registration complete!");
            setStep(4);
          }}
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