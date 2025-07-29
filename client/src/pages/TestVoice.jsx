import React from "react";
import SecureVoiceRecorder from "../components/VoiceRecorder";

// Paste your real JWT here between the quotes
const dummyToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ODg1Y2ZjNmYyNjVkZmFmMTU5N2NiNSIsImlhdCI6MTc1Mzc2NzE5NCwiZXhwIjoxNzUzNzcwNzk0fQ.q0j72FjIq0Yn-8AksBnvc1084FpI76xBrs1gCEc70-s"

const TestVoice = () => {
  return (
    <div style={{ padding: "2rem" }}>
      <h1>Test Voice Upload</h1>
      <SecureVoiceRecorder
        token={dummyToken}
        onUploadComplete={() => {
          alert("✅ Voice upload completed!");
        }}
      />
    </div>
  );
};

export default TestVoice;