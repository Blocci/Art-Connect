// UploadArtwork.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../auth/AuthProvider';

const API_BASE = process.env.REACT_APP_API_BASE;

const UploadArtwork = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [status, setStatus] = useState('');
  const { token } = useAuth(); // Get the token from context

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !image) {
      setStatus('Please provide all the required fields.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('image', image);

    try {
      const res = await axios.post(`${API_BASE}/upload-artwork`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      setStatus('Artwork uploaded successfully!');
      // Optionally clear the form
      setTitle('');
      setDescription('');
      setImage(null);
    } catch (err) {
      setStatus('❌ Failed to upload artwork. Please try again.');
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded shadow-lg">
      <h2 className="text-xl font-bold mb-4">Upload Artwork</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border p-2 w-full rounded"
            placeholder="Enter artwork title"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border p-2 w-full rounded"
            placeholder="Enter artwork description"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2">Image</label>
          <input
            type="file"
            onChange={handleImageChange}
            accept="image/*"
            className="border p-2 w-full rounded"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded mt-4"
        >
          Upload Artwork
        </button>
      </form>

      {status && <p className="mt-4 text-sm">{status}</p>}
    </div>
  );
};

export default UploadArtwork;