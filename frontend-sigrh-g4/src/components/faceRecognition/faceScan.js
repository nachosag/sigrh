import React, { useRef, useEffect, useState } from "react";
import * as faceapi from "face-api.js";
import axios from "axios";
import Cookies from "js-cookie";
import config from "@/config";

export default function FaceScan({ onFoundFace, onError, type }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [status, setStatus] = useState("Esperando...");
  const [processing, setProcessing] = useState(false);
  const token = Cookies.get("token");

  useEffect(() => {
    const loadModels = async () => {
      setStatus("Cargando modelos...");
      faceapi.nets.tinyFaceDetector.loadFromUri("/models");
      faceapi.nets.faceRecognitionNet.loadFromUri("/models");
      faceapi.nets.faceLandmark68Net.loadFromUri("/models");
      setStatus("Modelos cargados");
    };
    loadModels();
  }, []);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setStatus("No se pudo acceder a la cámara");
      }
    };
    startCamera();
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    let interval;
    async function processFrame() {
      if (
        !videoRef.current ||
        !canvasRef.current ||
        processing ||
        !faceapi.nets.tinyFaceDetector.params
      )
        return;

      const detection = await faceapi
        .detectSingleFace(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions()
        )
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detection && detection.descriptor && !processing) {
        setProcessing(true);
        setStatus("Rostro detectado, enviando...");

        // El embedding es un Float32Array, lo convertimos a array normal
        const embedding = Array.from(detection.descriptor);

        await sendToBackend(embedding);

        setTimeout(() => setProcessing(false), 3000); // Cooldown
      }
    }

    interval = setInterval(processFrame, 700);
    return () => clearInterval(interval);
  }, [processing]);

  const sendToBackend = async (embedding) => {
    setStatus("Enviando al backend...");
    console.log("Embedding:", embedding);
    if (type === "in") {
      try {
        const res = await axios.post(
          `${config.API_URL}/face_recognition/in`,
          { embedding: embedding },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data.success) {
          onFoundFace(res.data.employee_id);
        } else {
          onError(new Error("No se encontró un rostro coincidente"));
        }
      } catch (e) {
        onError(e);
      }
    } else if (type === "out") {
      try {
        const res = await axios.post(
          `${config.API_URL}/face_recognition/out`,
          { embedding: embedding },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data.success) {
          onFoundFace(res.data.employee_id);
        } else {
          onError(new Error("No se encontró un rostro coincidente"));
        }
      } catch (e) {
        onError(e);
      }
    }
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        width={800}
        height={600}
        style={{
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        }}
      />
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        style={{
          display: "none",
        }}
      />
      <div className="mt-4 text-lg text-white">{status}</div>
    </div>
  );
}
