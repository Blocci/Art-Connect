// SettingsPanel.jsx
import React, { useState } from 'react';

const SettingsPanel = () => {
  const [username, setUsername] = useState("");  // Add more states for other editable fields

  const handleSave = () => {
    // Handle save logic here (e.g., make an API call to update the user's profile)
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Profile Settings</h1>
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <label className="block mb-2 text-lg font-semibold">Username</label>
        <input 
          type="text" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
          className="border p-2 w-full rounded-lg mb-4"
        />
        <button 
          onClick={handleSave} 
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default SettingsPanel;