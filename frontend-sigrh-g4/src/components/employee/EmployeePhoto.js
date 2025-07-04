// components/PhotoUploader.jsx
"use client";

import { useRef } from "react";
import * as faceapi from "face-api.js";
import { toastAlerts } from "@/utils/toastAlerts";

export default function EmployeePhoto({ photoBase64, onPhotoChange }) {
  const fileInputRef = useRef(null);

  // modelos de face-api
  async function loadModels() {
    await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
  }

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        await loadModels();
        // Hace otra imagen para detectar la cara sin corromper el original
        const img = new window.Image();
        img.src = reader.result;
        img.onload = async () => {
          const detection = await faceapi.detectSingleFace(
            img,
            new faceapi.TinyFaceDetectorOptions()
          );
          if (detection) {
            onPhotoChange(reader.result); // Cambia la foto si encuentra una cara
          } else {
            toastAlerts.showError(
              "No se detectó una cara en la imagen. Por favor, intenta con otra foto."
            );
          }
        };
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      {photoBase64 ? (
        <img
          src={photoBase64}
          alt="Foto actual"
          className="w-40 h-40 object-cover rounded-md border border-gray-300"
        />
      ) : (
        <div className="w-40 h-40 flex items-center justify-center bg-gray-100 text-gray-500 rounded-md border border-gray-300">
          Sin foto
        </div>
      )}

      <button
        type="button"
        onClick={() => fileInputRef.current.click()}
        className="mt-2 px-3 py-1 text-sm bg-emerald-500 text-white rounded hover:bg-emerald-600"
      >
        Cambiar foto
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
