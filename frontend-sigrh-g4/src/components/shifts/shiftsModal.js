"use client";
import React from "react";

export default function ShiftModal({ shift, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-50 z-40"></div>
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-hidden z-50 border border-gray-300">
        <div className="p-6 overflow-y-auto h-full">
          <h2 className="text-xl font-semibold mb-4">Detalle del Turno</h2>

          <div className="mb-4">
            <label className="font-medium text-sm text-gray-600 block mb-1">
              Descripción
            </label>
            <p className="text-gray-800 border border-gray-200 px-3 py-2 rounded bg-gray-100">
              {shift.description}
            </p>
          </div>

          <div className="mb-4">
            <label className="font-medium text-sm text-gray-600 block mb-1">
              Tipo
            </label>
            <p className="text-gray-800 border border-gray-200 px-3 py-2 rounded bg-gray-100">
              {shift.type}
            </p>
          </div>

          <div className="mb-4">
            <label className="font-medium text-sm text-gray-600 block mb-1">
              Horas Laborales
            </label>
            <p className="text-gray-800 border border-gray-200 px-3 py-2 rounded bg-gray-100">
              {shift.working_hours} horas
            </p>
          </div>

          <div className="mb-4">
            <label className="font-medium text-sm text-gray-600 block mb-1">
              Días Laborales
            </label>
            <p className="text-gray-800 border border-gray-200 px-3 py-2 rounded bg-gray-100">
              {shift.working_days} días por semana
            </p>
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded-full hover:bg-gray-400"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
