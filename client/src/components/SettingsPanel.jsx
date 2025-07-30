import React, { useState } from "react";
import FaceRecognition from "./FaceRecognition";
import VoiceRecorder from "./VoiceRecorder";

const SettingsPanel = () => {
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState("");

  return (
    <div className="p-6 max-w-xl mx-auto bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">🔧 Settings</h2>
      <p className="text-sm mb-4 text-gray-600">
        Re-enroll your face or voice for better recognition.
      </p>

      {step === 1 && (
        <div className="flex gap-4">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={() => setStep(2)}
          >
            Re-enroll Face
          </button>
          <button
            className="bg-green-600 text-white px-4 py-2 rounded"
            onClick={() => setStep(3)}
          >
            Re-enroll Voice
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="mt-4">
          <FaceRecognition
            onUploadComplete={() => {
              setStatus("✅ Face re-enrolled.");
              setStep(1);
            }}
          />
        </div>
      )}

      {step === 3 && (
        <div className="mt-4">
          <VoiceRecorder
            mode="register"
            onUploadComplete={() => {
              setStatus("✅ Voice re-enrolled.");
              setStep(1);
            }}
          />
        </div>
      )}

      {status && (
        <p className="mt-4 text-sm text-green-600 font-semibold">{status}</p>
      )}
    </div>
  );
};

export default SettingsPanel;