import React from 'react';
import VoiceRecorder from './components/VoiceRecorder';

function App() {
  return (
    <div className="App" style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
        Welcome to ArtConnect
      </h1>
      <p>This app uses voice recognition as part of 2FA.</p>
      <VoiceRecorder />
    </div>
  );
}

export default App;