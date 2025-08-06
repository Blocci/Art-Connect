import React, { useRef, useEffect, useState } from "react";
import * as faceapi from "face-api.js";
import axios from "axios";
import Spinner from "./Spinner";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:3001/api";
const FACE_MATCH_THRESHOLD = 0.5;

const FaceRecognition = ({ onUploadComplete }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [descriptor, setDescriptor] = useState(null);
  const [descriptorReady, setDescriptorReady] = useState(false);
  const [status, setStatus] = useState("Loading face detection models...");
  const [isLoading, setIsLoading] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = "/models";
      await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
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
          setTimeout(() => setCameraReady(true), 1500); // buffer to allow camera to stabilize
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
        .detectAllFaces(video, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
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
    const video = videoRef.current;
    if (
      !video ||
      video.readyState < 2 ||
      video.videoWidth === 0 ||
      video.videoHeight === 0
    ) {
      setStatus("Waiting for camera...");
      setTimeout(captureFaceDescriptor, 500);
      return;
    }

    const result = await faceapi
      .detectSingleFace(video, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (
      result &&
      result.descriptor &&
      result.descriptor instanceof Float32Array &&
      result.descriptor.length === 128
    ) {
      const currentDescriptor = Array.from(result.descriptor);
      setDescriptor(currentDescriptor);
      setDescriptorReady(false);
      setStatus("Face captured. Validating...");

      // Add delay before confirming readiness
      setTimeout(() => {
        const isValid = Array.isArray(currentDescriptor) && currentDescriptor.length === 128;
        setDescriptorReady(isValid);
        setStatus(isValid ? "Face ready. Click Save." : "Detection unstable. Try again.");
      }, 500);
    } else {
      setStatus("Face detection failed. Please try again.");
    }
  };

  const saveFaceDescriptor = async () => {
    if (!Array.isArray(descriptor) || descriptor.length !== 128) {
      setStatus("No valid face descriptor. Please click Capture first.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setStatus("No authentication token. Please log in.");
      return;
    }

    setIsLoading(true);

    try {
      console.log("Saving descriptor:", descriptor);
      await axios.post(
        `${API_BASE}/enroll-face`,
        { descriptor },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setStatus("Face descriptor saved to server.");
      onUploadComplete?.();
    } catch (error) {
      console.error("Error uploading face descriptor:", error);
      setStatus("Failed to save face descriptor.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <Spinner text="Processing face..." />;

  return (
  <div className="face-recognition">
    <div className="face-recognition-inner">
      <div style={{ position: "relative", width: "640px", height: "480px", margin: "0 auto" }}>
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

      <div style={{ marginTop: "1rem" }}>
        <p className="text-sm text-gray-700">{status}</p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", marginTop: "0.5rem" }}>
          <button
            onClick={captureFaceDescriptor}
            disabled={!cameraReady}
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Capture
          </button>
          <button
            onClick={saveFaceDescriptor}
            disabled={!descriptorReady}
            className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Save Face
          </button>
        </div>
      </div>
    </div>
  </div>
);
};

export default FaceRecognition;