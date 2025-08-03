import React, { use, useEffect, useRef, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import config from "@/config";
import { toastAlerts } from "@/utils/toastAlerts";
import FormAlert from "../customsAlerts/formAlert";

export default function LicenseModal({ open, onClose }) {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [licensesTypes, setLicensesTypes] = useState([]);
  const [typeSelected, setTypeSelected] = useState(null);
  const [reason, setReason] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const token = Cookies.get("token");
  const [openFormAlert, setOpenFormAlert] = useState(false);
  const [formAlertMessage, setFormAlertMessage] = useState("");

  if (!open) return null;

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

  useEffect(() => {
    fetchLicensesTypes();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (typeSelected?.justification_required && !file) {
      setFormAlertMessage("Debe adjuntar un archivo de justificación.");
      setOpenFormAlert(true);
      return;
    }

    createLicense();
    onClose();
  };

  const createLicense = async () => {
    let fileBase64 = null;
    if (file) {
      fileBase64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(",")[1]); // solo base64, sin el encabezado
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }

    const payload = {
      start_date: startDate,
      end_date: endDate,
      leave_type_id: Number(typeSelected.id),
      reason: reason,
      file: fileBase64 || null,
    };

    try {
      const res = await axios.put(`${config.API_URL}/leaves/`, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.status !== 201) throw new Error("Error al crear la licencia");
      toastAlerts.showSuccess("Licencia creada exitosamente");
    } catch (error) {
      console.error("Error al crear licencia:", error);
      toastAlerts.showError(
        "No se pudo crear la licencia, intente nuevamente más tarde"
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Fondo opaco */}
      <div className="fixed inset-0 bg-black/50"></div>
      {/* Modal */}
      <div className="relative bg-white p-6 rounded-lg shadow-lg w-[90vw] max-w-md z-10">
        <h2 className="text-xl font-bold text-emerald-700 mb-4">
          Solicitar Licencia
        </h2>
        <form onSubmit={handleSubmit}>
          {/* Tipo de licencia */}
          <div className="mb-4">
            <label className="block mb-1 font-semibold">
              📄 Tipo de licencia
            </label>
            <select
              className="w-full border border-gray-300 rounded px-3 py-2 hover:border-emerald-400"
              value={typeSelected ? typeSelected.id : ""}
              onChange={(e) => {
                const selected = licensesTypes.find(
                  (type) => String(type.id) === e.target.value
                );
                setTypeSelected(selected || null);
              }}
              required
            >
              <option value="">Seleccionar tipo</option>
              {licensesTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.type}
                </option>
              ))}
            </select>
          </div>
          <label className="block mb-1 font-semibold">
            📝 Motivo de la licencia
          </label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded px-3 py-2 mb-4 hover:border-emerald-400"
            placeholder="Ingrese el motivo de la licencia"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          />
          {/* Subida de file */}
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
              ref={fileInputRef}
              className="hidden"
              accept="application/pdf"
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
                🗃️ Adjunte la documentación correspodiente aquí{" "}
                {typeSelected
                  ? typeSelected.justification_required
                    ? "(Obligatorio)"
                    : "(Opcional)"
                  : ""}
              </p>
            )}
          </div>
          {/* Fechas */}
          <div className="mb-4 flex gap-2">
            <div className="flex-1">
              <label className="block mb-1 font-semibold">📅 Desde</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 hover:border-emerald-400"
                required
              />
            </div>
            <div className="flex-1">
              <label className="block mb-1 font-semibold">🗓️ Hasta</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 hover:border-emerald-400"
                required
              />
            </div>
          </div>
          {/* Botones */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="px-4 py-2 rounded-full bg-red-400 hover:bg-red-500 text-white cursor-pointer"
              onClick={onClose}
            >
              Cancelar ❌
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer"
            >
              Solicitar ✉️
            </button>
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
