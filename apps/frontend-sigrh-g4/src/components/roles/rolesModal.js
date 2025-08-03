"use client";
import React from "react";

export default function RoleModal({ role, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-50 z-40"></div>
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-hidden z-50 border border-gray-300">
        <div className="p-6 overflow-y-auto h-full">
          <h2 className="text-xl font-semibold mb-4">Detalle del Rol</h2>

          <div className="mb-4">
            <label className="font-medium text-sm text-gray-600 block mb-1">Nombre</label>
            <p className="text-gray-800 border px-3 py-2 rounded bg-gray-100">{role.name}</p>
          </div>

          <div>
            <label className="font-medium text-sm text-gray-600 block mb-2">Permisos</label>
             <div className="h-[30vh] overflow-y-auto">
            <ul className="list-disc pl-5 space-y-1">
              {role.permissions && role.permissions.length > 0 ? (
                role.permissions.map((perm) => (
                  <li key={perm.id}>
                    <span className="font-semibold">{perm.name}</span>: {perm.description}
                  </li>
                ))
              ) : (
                <p className="text-gray-500">Este rol no tiene permisos asignados.</p>
              )}
            </ul>
            </div>
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
