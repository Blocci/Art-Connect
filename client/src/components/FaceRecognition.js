import React, { useRef, useEffect, useState } from "react";
import * as faceapi from "face-api.js";
import axios from "axios";
import Spinner from "./Spinner";

const API_BASE = "https://artconnect-backend-65t2.onrender.com";
const FACE_MATCH_THRESHOLD = 0.5; // Tune as needed (e.g., 0.4 stricter)

const FaceRecognition = ({ onUploadComplete }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [descriptor, setDescriptor] = useState(null);
  const [status, setStatus] = useState("Loading face detection models...");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = "/models";
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
      ]);
      setStatus("Models loaded. Starting camera...");
      startVideo();
    };

    const startVideo = () => {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          videoRef.current.srcObject = stream;
          setStatus("Camera on. Click 'Capture' to scan face.");
        })
        .catch((err) => {
          console.error("Webcam error:", err);
          setStatus("❌ Error accessing webcam.");
        });
    };

    loadModels();

    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (
        !video ||
        !canvas ||
        video.readyState < 2 ||
        video.videoWidth === 0 ||
        video.videoHeight === 0
      )
        return;

      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptors();

      const displaySize = {
        width: video.videoWidth,
        height: video.videoHeight,
      };

      faceapi.matchDimensions(canvas, displaySize);
      const resized = faceapi.resizeResults(detections, displaySize);

      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      faceapi.draw.drawDetections(canvas, resized);
      faceapi.draw.drawFaceLandmarks(canvas, resized);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const compareDescriptors = (d1, d2) => {
    const distance = faceapi.euclideanDistance(d1, d2);
    return distance < FACE_MATCH_THRESHOLD;
  };

  const captureFaceDescriptor = async () => {
    if (!videoRef.current) return;

    const result = await faceapi
      .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (result && result.descriptor) {
      const currentDescriptor = Array.from(result.descriptor);
      setDescriptor(currentDescriptor);

      const token = localStorage.getItem("token");
      if (!token) {
        setStatus("❌ No authentication token. Please log in.");
        return;
      }

      setIsLoading(true);
      try {
        const res = await axios.get(`${API_BASE}/enroll-face`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const storedDescriptor = res.data?.descriptor;

        if (!storedDescriptor) {
          setStatus("❌ No face data found on server.");
          return;
        }

        const isMatch = compareDescriptors(currentDescriptor, storedDescriptor);

        if (isMatch) {
          setStatus("✅ Face matched. Now record your voice...");
          if (onUploadComplete) onUploadComplete();
        } else {
          setStatus("❌ Face does not match our records. Try again.");
        }
      } catch (err) {
        console.error("Failed to fetch face data", err);
        setStatus("❌ Error checking stored face data.");
      } finally {
        setIsLoading(false);
      }
    } else {
      setStatus("❌ No face detected. Try again.");
    }
  };

  const saveFaceDescriptor = async () => {
    if (!descriptor) {
      setStatus("No descriptor found. Capture face first.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setStatus("❌ No authentication token. Please log in.");
      return;
    }

    setIsLoading(true);

    try {
      await axios.post(
        `${API_BASE}/enroll-face`,
        { descriptor },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setStatus("✅ Face descriptor saved to server.");

      if (onUploadComplete) onUploadComplete();
    } catch (error) {
      console.error("Error uploading face descriptor:", error);
      setStatus("❌ Failed to save face descriptor.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <Spinner text="Processing face..." />;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ position: "relative", width: "640px", height: "480px" }}>
        <video
          ref={videoRef}
          autoPlay
          muted
          width="640"
          height="480"
          style={{ position: "absolute", top: 0, left: 0 }}
        />
        <canvas
          ref={canvasRef}
          width="640"
          height="480"
          style={{ position: "absolute", top: 0, left: 0 }}
        />
      </div>

      <div style={{ marginTop: "1rem", textAlign: "center" }}>
        <p className="text-sm text-gray-700">{status}</p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", marginTop: "0.5rem" }}>
          <button onClick={captureFaceDescriptor} className="bg-blue-600 text-white px-4 py-2 rounded">
            Capture
          </button>
          <button onClick={saveFaceDescriptor} className="bg-green-600 text-white px-4 py-2 rounded">
            Save Face
          </button>
        </div>
      </div>
    </div>
  );
};

export default FaceRecognition;