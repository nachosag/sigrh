import React, { useState, useRef, useEffect } from "react";
import { useEmployees } from "@/hooks/useEmployees";
import axios from "axios";
import Cookies from "js-cookie";
import config from "@/config";
import { toastAlerts } from "@/utils/toastAlerts";
import FormAlert from "../customsAlerts/formAlert";

export default function LicenseRevision({ open, onClose, license, onSave }) {
  const [file, setFile] = useState(null);
  const fileInputRef = useRef();
  const [licensesTypes, setLicensesTypes] = useState([]);
  const token = Cookies.get("token");
  const [openFormAlert, setOpenFormAlert] = useState(false);
  const [formAlertMessage, setFormAlertMessage] = useState("");

  useEffect(() => {
    const fetchLicensesTypes = async () => {
      try {
        const res = await axios.get(`${config.API_URL}/leaves/types`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status !== 200) throw new Error("Error al obtener licencias");
        setLicensesTypes(res.data);
      } catch (error) {
        console.error("Error al traer licenses:", error);
        toastAlerts.showError(
          "Hubo un error al obtener los tipos de licencia, recargue la página e intente nuevamente"
        );
      }
    };
    fetchLicensesTypes();
  }, [token]);

  useEffect(() => {
    setFile(null);
  }, [license]);

  if (!open || !license) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    let fileBase64 = license.file || null;

    if (file) {
      fileBase64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }

    onSave({
      ...license,
      file: fileBase64,
    });
  };

  const title = "Revisión de Licencia";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Fondo opaco */}
      <div className="fixed inset-0 bg-black/50" onClick={onClose}></div>
      {/* Modal */}
      <div className="relative bg-white p-6 rounded-lg shadow-lg w-[90vw] max-w-md z-10">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="block font-semibold">📂 Tipo de licencia</label>
            <div className="border border-gray-300 rounded px-3 py-2 bg-gray-100">
              {licensesTypes.find((type) => type.id === license.leave_type_id)
                ?.type || "Tipo no encontrado"}
            </div>
          </div>
          <div className="mb-3">
            <label className="block font-semibold">📝 Motivo</label>
            <div className="border border-gray-300 rounded px-3 py-2 bg-gray-100">
              {license.reason.slice(0, 50)}
              {license.reason.length > 50 ? "..." : ""}
            </div>
          </div>
          <div className="mb-3 flex gap-2">
            <div className="flex-1">
              <label className="block font-semibold">📅 Desde</label>
              <div className="border border-gray-300 rounded px-3 py-2 bg-gray-100">
                {license.start_date}
              </div>
            </div>
            <div className="flex-1">
              <label className="block font-semibold">🗓️ Hasta</label>
              <div className="border border-gray-300 rounded px-3 py-2 bg-gray-100">
                {license.end_date}
              </div>
            </div>
          </div>
          {/* Campo para cargar o descargar PDF */}
          {license.file ? (
            <>
              <label className="block mb-2 font-semibold">
                📄 Documentación cargada
              </label>
              <button
                type="button"
                className="flex items-center gap-2 px-3 py-2 bg-emerald-100 hover:bg-emerald-200 rounded text-emerald-700 font-semibold w-full mb-4"
                onClick={() => {
                  // Descargar archivo base64 como PDF
                  const byteCharacters = atob(license.file);
                  const byteNumbers = new Array(byteCharacters.length);
                  for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                  }
                  const byteArray = new Uint8Array(byteNumbers);
                  const blob = new Blob([byteArray], {
                    type: "application/pdf",
                  });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement("a");
                  link.href = url;
                  link.download = `licencia_${license.id}.pdf`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  URL.revokeObjectURL(url);
                }}
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
                Descargar documento
              </button>
            </>
          ) : (
            <>
              <label className="block mb-2 font-semibold">
                📄 Cargar documentación
              </label>
              <div
                className="mb-4 border-2 border-dashed border-gray-300 rounded p-4 text-center cursor-pointer hover:border-emerald-400"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file) setFile(file);
                }}
              >
                <input
                  type="file"
                  accept="application/pdf"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      if (file.type !== "application/pdf") {
                        setFormAlertMessage("Solo se permiten archivos PDF.");
                        setOpenFormAlert(true);
                        return;
                      }
                      setFile(file);
                    }
                  }}
                />
                {file ? (
                  <div className="mt-2 text-emerald-700 font-medium">
                    {file.name}
                  </div>
                ) : (
                  <p className="text-gray-500">
                    🗃️ Adjunte la documentación correspondiente aquí
                  </p>
                )}
              </div>
            </>
          )}
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
              onClick={onClose}
            >
              {license.file ? "Cerrar" : "Cancelar"}
            </button>
            {!license.file && (
              <button
                type="submit"
                className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              >
                Guardar
              </button>
            )}
          </div>
          <FormAlert
            open={openFormAlert}
            onClose={() => setOpenFormAlert(false)}
            message={formAlertMessage}
          />
        </form>
      </div>
    </div>
  );
}
