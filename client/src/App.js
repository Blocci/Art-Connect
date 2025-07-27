import React from 'react';
import Login2FA from './components/Login2FA';

function App() {
  return (
    <div className="App" style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
        Welcome to ArtConnect
      </h1>
      <Login2FA />
    </div>
  );
}

export default App;