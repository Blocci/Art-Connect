import React, { useState } from 'react';
import Register2FA from './components/Register2FA';
import Login2FA from './components/Login2FA';

function App() {
  const [mode, setMode] = useState('register'); // or 'login'

  return (
    <div className="App" style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
        Welcome to ArtConnect
      </h1>

      <div style={{ marginBottom: '1rem' }}>
        <button
          onClick={() => setMode('register')}
          className={`px-4 py-2 rounded mr-2 ${mode === 'register' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          Register
        </button>
        <button
          onClick={() => setMode('login')}
          className={`px-4 py-2 rounded ${mode === 'login' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
        >
          Login
        </button>
      </div>

      {mode === 'register' ? <Register2FA /> : <Login2FA />}
    </div>
  );
}

export default App;