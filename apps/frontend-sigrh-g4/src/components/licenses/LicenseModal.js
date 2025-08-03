import React, { useState, useEffect } from "react";
import { useEmployees } from "@/hooks/useEmployees";

const REQUEST_STATUS_OPTIONS = ["pendiente", "aprobado", "rechazado"];
const DOCUMENT_STATUS_OPTIONS = [
  "pendiente_de_carga",
  "pendiente_de_validacion",
  "aprobado",
  "rechazado",
];

export default function LicenseModal({ open, onClose, license, onSave }) {
  const { employees } = useEmployees();
  const employee = employees.find((emp) => emp.id === license?.employee_id);
  const [requestStatus, setRequestStatus] = useState(
    license?.request_status || ""
  );
  const [documentStatus, setDocumentStatus] = useState(
    license?.document_status || ""
  );

  useEffect(() => {
    setRequestStatus(license?.request_status || "");
    setDocumentStatus(license?.document_status || "");
  }, [license]);

  if (!open || !license) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...license,
      request_status: requestStatus,
      document_status: documentStatus,
    });
  };

  const handleDownload = () => {
    if (!license.file) return;
    const mimeType = "application/pdf";
    const link = document.createElement("a");
    link.href = `data:${mimeType};base64,${license.file}`;
    link.download = `documento_licencia_${license.id}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Fondo opaco */}
      <div className="fixed inset-0 bg-black/50" onClick={onClose}></div>
      {/* Modal */}
      <div className="relative bg-white p-6 rounded-lg shadow-lg w-[90vw] max-w-md z-10">
        <h2 className="text-xl font-bold mb-4">Gestionar Licencia</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="block font-semibold mb-2">👤 Empleado</label>
            <div className="border border-gray-300 rounded px-3 py-2 bg-gray-100">
              {`${employee.first_name} ${employee.last_name} - DNI: ${employee.dni}`}
            </div>
          </div>
          <div className="mb-3">
            <label className="block font-semibold mb-2">📝 Motivo</label>
            <div className="border border-gray-300 rounded px-3 py-2 bg-gray-100">
              {license.reason.slice(0, 50)}
              {license.reason.length > 50 && (
                <span className="text-gray-500">...</span>
              )}
            </div>
          </div>
          <div className="mb-3 flex gap-2">
            <div className="flex-1">
              <label className="block font-semibold mb-2">📅 Desde</label>
              <div className="border border-gray-300 rounded px-3 py-2 bg-gray-100">
                {license.start_date}
              </div>
            </div>
            <div className="flex-1">
              <label className="block font-semibold mb-2">🗓️ Hasta</label>
              <div className="border border-gray-300 rounded px-3 py-2 bg-gray-100">
                {license.end_date}
              </div>
            </div>
          </div>
          {/* Botón de descarga si hay archivo */}
          {license.file ? (
            <div className="mb-3 flex gap-2 items-end">
              <div className="flex-1">
                <label className="block font-semibold mb-2">🗃️ Documentación</label>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-3 py-2 bg-emerald-100 hover:bg-emerald-200 rounded text-emerald-700 font-semibold w-full"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
                    />
                  </svg>
                  Descargar archivo
                </button>
              </div>
              <div className="w-1/2">
                <label className="block font-semibold mb-2">
                  📑 Estado Documentación
                </label>
                <select
                  className="border border-gray-300 rounded px-2 py-2 w-full text-sm"
                  value={documentStatus}
                  onChange={(e) => setDocumentStatus(e.target.value)}
                  required
                >
                  <option value="">Seleccionar estado</option>
                  {DOCUMENT_STATUS_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt.charAt(0).toUpperCase() +
                        opt.slice(1).replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="mb-3">
              <label className="block font-semibold mb-2">🗃️ Documentación</label>
              <div className="text-gray-500 italic mt-1">
                No hay documentación cargada
              </div>
            </div>
          )}
          <div className="mb-3">
            <label className="block font-semibold mb-2">
              📤 Estado de Solicitud
            </label>
            <select
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={requestStatus}
              onChange={(e) => setRequestStatus(e.target.value)}
              required
            >
              <option value="">Seleccionar estado</option>
              {REQUEST_STATUS_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
