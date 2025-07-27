import React, { useRef, useEffect, useState } from "react";
import * as faceapi from "face-api.js";
import axios from "axios";

export default function FaceRecognition() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [descriptor, setDescriptor] = useState(null);
  const [status, setStatus] = useState("Loading...");

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = "/models";
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
      ]);
      startVideo();
      setStatus("Models loaded. Starting video...");
    };

    const startVideo = () => {
      navigator.mediaDevices
        .getUserMedia({ video: {} })
        .then((stream) => {
          videoRef.current.srcObject = stream;
        })
        .catch((err) => {
          console.error("Webcam error:", err);
          setStatus("Error accessing webcam.");
        });
    };

    loadModels();

    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Draw detections on canvas every 100ms
  useEffect(() => {
    const interval = setInterval(async () => {
      if (videoRef.current && canvasRef.current) {
        const detections = await faceapi
          .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptors();

        const canvas = canvasRef.current;
        const displaySize = {
          width: videoRef.current.videoWidth,
          height: videoRef.current.videoHeight,
        };

        faceapi.matchDimensions(canvas, displaySize);
        const resizedDetections = faceapi.resizeResults(detections, displaySize);

        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Capture single face descriptor from current video frame
  const captureFaceDescriptor = async () => {
    if (!videoRef.current) return;

    const result = await faceapi
      .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (result && result.descriptor) {
      setDescriptor(Array.from(result.descriptor));
      setStatus("Face captured.");
    } else {
      setStatus("No face detected. Try again.");
    }
  };

  // Save face descriptor to backend
  const saveFaceDescriptor = async () => {
    if (!descriptor) {
      setStatus("No face descriptor to save. Please capture first.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:3000/api/auth/enroll-face",
        { descriptor },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setStatus("Face saved successfully!");
    } catch (err) {
      console.error(err);
      setStatus("Error saving face.");
    }
  };

  return (
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
      <div style={{ marginTop: "500px" }}>
        <p>{status}</p>
        <button
          onClick={captureFaceDescriptor}
          className="bg-blue-500 text-white px-4 py-2 mr-2 rounded"
        >
          Capture
        </button>
        <button
          onClick={saveFaceDescriptor}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Save Face
        </button>
      </div>
    </div>
  );
}