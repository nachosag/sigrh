import React from "react";

export default function FormAlert({ open, message, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Capa de opacidad */}
      <div
        className="fixed inset-0 bg-black"
        style={{ opacity: 0.4 }}
        onClick={onClose}
      ></div>
      {/* Contenido del modal */}
      <div className="relative bg-white rounded-lg shadow-lg p-6 max-w-sm w-full z-10 flex flex-col items-center">
        <div className="mb-4 text-emerald-600 text-3xl">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 mx-auto"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z"
            />
          </svg>
        </div>
        <div className="mb-6 text-center text-gray-800 text-base font-medium">
          {message}
        </div>
        <button
          className="px-5 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
          onClick={onClose}
        >
          Aceptar
        </button>
      </div>
    </div>
  );
}
