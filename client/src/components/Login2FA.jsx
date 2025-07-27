import React, { useState } from "react";
import axios from "axios";
import FaceRecognition from "./FaceRecognition";
import VoiceRecorder from "./VoiceRecorder";

const Login2FA = () => {
  const [step, setStep] = useState(1);
  const [token, setToken] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // STEP 1: Login
  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:3000/api/auth/login", {
        username,
        password,
      });

      setToken(res.data.token);
      setStatus("Login successful. Now scan your face.");
      setStep(2);
    } catch (err) {
      setStatus("Login failed.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Face match callback
  const handleFaceMatch = async (descriptor) => {
    setLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:3000/api/auth/verify-face",
        { descriptor },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.match) {
        setStatus("Face verified! Now record your voice.");
        setStep(3);
      } else {
        setStatus("Face verification failed.");
      }
    } catch (err) {
      setStatus("Face verification error.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // STEP 3: Voice upload callback
  const handleVoiceComplete = () => {
    setStatus("Voice uploaded and matched. Access granted!");
    setStep(4);
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Login with 2FA</h2>
      <p className="mb-4 text-sm text-gray-600">{status}</p>

      {step === 1 && (
        <div className="space-y-2">
          <input
            className="border p-2 w-full"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
          />
          <input
            className="border p-2 w-full"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </div>
      )}

      {step === 2 && <FaceRecognition onFaceMatch={handleFaceMatch} loading={loading} />}

      {step === 3 && <VoiceRecorder onUploadComplete={handleVoiceComplete} token={token} />}

      {step === 4 && (
        <div className="mt-4 text-green-600 font-semibold">✅ Access Granted</div>
      )}
    </div>
  );
};

export default Login2FA;