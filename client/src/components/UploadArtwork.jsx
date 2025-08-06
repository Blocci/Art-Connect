// UploadArtwork.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthProvider";
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:3001/api";

const UploadArtwork = () => {
  const { token } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    document.title = "ArtConnect – Upload Artwork";
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);

    if (file) {
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !description || !image) {
      setStatus("All fields are required.");
      return;
    }

    setIsSubmitting(true);
    setStatus("");

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("image", image);

      const res = await axios.post(`${API_BASE}/upload-artwork`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setStatus("Artwork uploaded successfully!");
      setTitle("");
      setDescription("");
      setImage(null);
      setPreviewUrl(null);
    } catch (err) {
      console.error("Upload error:", err);
      setStatus("Failed to upload artwork.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
  <div className="upload-artwork">
    <div className="upload-artwork-inner">
      <div
        className="panel"
        style={{
          maxWidth: "600px",
          margin: "40px auto",
          padding: "30px 20px",
          backgroundColor: "white",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
        }}
      >
        <h2 style={{ textAlign: "center", fontSize: "24px", marginBottom: "24px" }}>
          Upload Artwork
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border p-2 w-full rounded"
              placeholder="Enter artwork title"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border p-2 w-full rounded"
              placeholder="Enter artwork description"
              rows={4}
                  style={{
                  width: "100%",
                  padding: "10px",
                  fontSize: "1rem",
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                  resize: "vertical",
                  fontFamily: "inherit",
                }}
            />
          </div>

          <div className="mb-4">
            <label className="block mb-2">Image</label>
            <input
              type="file"
              onChange={handleImageChange}
              accept="image/*"
              className="border p-2 w-full rounded"
            />
          </div>

          {previewUrl && (
            <div className="mb-4 text-center">
              <p className="text-sm font-medium mb-2">Preview:</p>
              <img
                src={previewUrl}
                alt="Preview"
                className="rounded-lg border"
                style={{
                  maxHeight: "300px",
                  maxWidth: "100%",
                  objectFit: "cover",
                  border: "2px solid #ccc",
                }}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full"
            style={{
              padding: "12px",
              backgroundColor: isSubmitting ? "#999" : "#2563eb",
              color: "white",
              border: "none",
              fontSize: "1rem",
              borderRadius: "6px",
              cursor: isSubmitting ? "not-allowed" : "pointer",
            }}
          >
            {isSubmitting ? "Uploading..." : "Upload Artwork"}
          </button>
        </form>

        {status && (
          <p className="mt-4 text-center text-sm" style={{ color: "#333" }}>
            {status}
          </p>
        )}
      </div>
    </div>
  </div>
);
};

export default UploadArtwork;